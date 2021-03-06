const { ethers } = require("hardhat");

const [pairs, forkFrom] = require('../utils/utils.js');

/**
 * This script is a 'health check' for the RNG.
 * 
 * The script surveys the 10 most recent blocks and calls `getRandomNumber()`. It prints the random number generated for
 * that block, and checks whether it was generated with 'acceptable entropy'.
 * 
 * A random number is said to be generated with 'acceptable entropy' if the reserve value of at least one DEX pair used in the random number 
 * generation has updated, since the last `getRandomNumber()` call.
 */

describe("RNG health check", function() {
  this.timeout(180000); // Let it run for 3 minutes max

  const range = 100;

  let endBlock
  let startBlock;

  const numOfBlocksToSurvey = 10;
  const blockInterval = 1;

  before(async () => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT_MAINNET, "mainnet");
    endBlock = await provider.getBlockNumber();
    startBlock = endBlock - numOfBlocksToSurvey;

    console.log("Most recent block: ", endBlock, "\n");
  })

  it("Should print the random number generated and check whether it was generated with acceptable entropy.", async () => {

    let prevRandomNumber = 0;
    let sameNumbers = 0;

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
      
      const RNG_Factory = await ethers.getContractFactory("DexRNG");
      const rng = await RNG_Factory.deploy();

      const RNGConsumer_Factory = await ethers.getContractFactory("RNGConsumer");
      const rngConsumer = await  RNGConsumer_Factory.deploy(rng.address);

      for(let addresses of pairs) {
        await rng.addPair(addresses.pair);
      }

      const currentIndex = parseInt((await rng.currentPairIndex()).toString())

      if(i == startBlock) {
        for(let i = 1; i <= currentIndex; i++) {
          const pairObject = await rng.pairs(i);
          const timeStamp = parseInt((pairObject.lastUpdateTimeStamp).toString())
  
          prevTimeStamps.push(timeStamp);
        }
      }

      await rngConsumer.random(range);

      // Get random number
      const randomNum = parseInt((await rngConsumer.randomNumber()).toString());
      if(randomNum == prevRandomNumber) {
        sameNumbers++;
      } else {
        console.log("Random Number generated: ", randomNum);
        prevRandomNumber = randomNum;
      }

      // Timestamp entropy check
      let newTimeStamps = [];
      let updatedPairs = [];

      for(let j = 1; j <= currentIndex; j++) {
        const pairObject = await rng.pairs(j);
        const timeStamp = parseInt((pairObject.lastUpdateTimeStamp).toString())

        if(timeStamp > prevTimeStamps[j-1]) {
          acceptableEntropy = true;

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
      console.log("Acceptable entropy: ", acceptableEntropy, '\n');

      if(!acceptableEntropy) numOfUnacceptableEntropy++;
    }

    console.log("Number of blocks tested over: ", (endBlock - startBlock) / blockInterval)
    console.log("Number of blocks with unacceptable entropy: ", numOfUnacceptableEntropy);
    console.log("Number of times the same 'random' number appeared consecutively: ", sameNumbers);
    console.log("Number of updates by pair: ", pairUpdates);
  })
})