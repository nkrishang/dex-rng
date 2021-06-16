const { ethers } = require("hardhat");

const [pairs, forkFrom] = require('../utils/utils.js');

describe("Random Numbers", function() {
  this.timeout(120000); // Let it run for 2 minutes

  const range = 100;

  const startBlock = 12635536;
  const endBlock = startBlock + 50;
  const blockInterval = 1;

  it("Should print a different random number every time.", async () => {

    let prevRandomNumber = 0;

    for(let i = startBlock; i < endBlock; i += blockInterval) {

      await forkFrom(i);
      
      const PriceRNG_Factory = await ethers.getContractFactory("DeFiRNG");
      const priceRNG = await PriceRNG_Factory.deploy();

      const RNGConsumer_Factory = await ethers.getContractFactory("RNGConsumer");
      const rngConsumer = await  RNGConsumer_Factory.deploy(priceRNG.address);

      console.log("Block Number: ", await ethers.provider.getBlockNumber());

      for(let addresses of pairs) {
        await priceRNG.addPair(addresses.pair);
      }

      await rngConsumer.random(range);
      const randomNum = parseInt((await rngConsumer.randomNumber()).toString());

      if(randomNum == prevRandomNumber) {
        console.log('SAME: ', randomNum)
      } else {
        console.log("Random Number generated: ", randomNum);
        prevRandomNumber = randomNum;
      }
    }
  })
})