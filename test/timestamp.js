const { ethers } = require("hardhat");

const [pairs, forkFrom] = require('../utils/utils.js');

describe("Checking entropy of RNG by block", function() {
  this.timeout(120000); // Let it run for 2 minutes

  const range = 100;

  let endBlock
  let startBlock;

  const numOfBlocksToSurvey = 15;
  const blockInterval = 1;

  before(async () => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT_MAINNET, "mainnet");
    endBlock = await provider.getBlockNumber();
    startBlock = endBlock - numOfBlocksToSurvey;

    console.log("Most recent block: ", endBlock, "\n");
  })

  it("Should check whether a block has acceptable entropy.", async () => {

    let prevTimeStamps = [];
    let numOfUnacceptableEntropy = 0;
    let pairUpdates = {}

    for(let pair of pairs) {
      pairUpdates[`${pair.name}`] = 0;
    }

    for(let i = startBlock; i < endBlock; i += blockInterval) {
      console.log("Block index: ", (i - startBlock) + 1)
      await forkFrom(i);

      let acceptableEntropy = false;
      
      const PriceRNG_Factory = await ethers.getContractFactory("DeFiRNG");
      const priceRNG = await PriceRNG_Factory.deploy();

      const RNGConsumer_Factory = await ethers.getContractFactory("RNGConsumer");
      const rngConsumer = await  RNGConsumer_Factory.deploy(priceRNG.address);

      for(let addresses of pairs) {
        await priceRNG.addPair(addresses.pair);
      }

      const currentIndex = parseInt((await priceRNG.currentPairIndex()).toString())

      if(i == startBlock) {
        for(let i = 1; i <= currentIndex; i++) {
          const pairObject = await priceRNG.pairs(i);
          const timeStamp = parseInt((pairObject.lastUpdateTimeStamp).toString())
  
          prevTimeStamps.push(timeStamp);
        }
      }   

      await rngConsumer.random(range);

      let newTimeStamps = [];
      let updatedPairs = [];

      for(let j = 1; j <= currentIndex; j++) {
        const pairObject = await priceRNG.pairs(j);
        const timeStamp = parseInt((pairObject.lastUpdateTimeStamp).toString())

        if(timeStamp > prevTimeStamps[j-1]) {
          acceptableEntropy = true;

          // console.log("Pair addresses: ", pairObject.pair);

          for(let addresses of pairs) {
            if(addresses.pair == pairObject.pair) {
              updatedPairs.push(addresses.name);
              pairUpdates[`${addresses.name}`] = pairUpdates[`${addresses.name}`] + 1;              
            }
          }                 
        }

        newTimeStamps.push(timeStamp);
      }

      prevTimeStamps = newTimeStamps;

      if(updatedPairs.length > 0) console.log("Pairs that updated: ", updatedPairs);
      console.log("Acceptable entropy: ", acceptableEntropy);
      console.log("\n")

      if(!acceptableEntropy) numOfUnacceptableEntropy++;
    }

    console.log("Number of blocks tested over: ", (endBlock - startBlock) / blockInterval)
    console.log("Number of blocks with unacceptable entropy: ", numOfUnacceptableEntropy);
    console.log("Number of updates by pair: ", pairUpdates);
  })
})
