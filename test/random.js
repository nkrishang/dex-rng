const { ethers } = require("hardhat");

const [pairs, forkFrom] = require('../utils/utils.js');

describe("Random Numbers", function() {
  this.timeout(120000); // Let it run for 2 minutes

  const range = 100;

  const startBlock = 12000000;
  const endBlock = 12001000;
  const blockInterval = 1;

  it("Should print a different random number every time (almost)", async () => {

    let prevRandomNumber = 0;

    for(let i = startBlock; i < endBlock; i += blockInterval) {

      await forkFrom(i);
      
      const PriceRNG_Factory = await ethers.getContractFactory("PriceRNG");
      const priceRNG = await PriceRNG_Factory.deploy();

      const RNGConsumer_Factory = await ethers.getContractFactory("RNGConsumer");
      const rngConsumer = await  RNGConsumer_Factory.deploy(priceRNG.address);

      console.log("Block Number: ", await ethers.provider.getBlockNumber());

      for(let addresses of pairs) {
        await priceRNG.addPair(addresses.pair, addresses.tokenA, addresses.tokenB);
      }

      await rngConsumer.random(range);
      const randomNum = parseInt((await rngConsumer.randomNumber()).toString());

      if(randomNum == prevRandomNumber) {
        console.log('SAME: ', randomNum)
      } else {
        console.log("Random Number generated: ", randomNum);
        prevRandomNumber = randomNum;
      }

      const minePromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 1000)
      })

      await minePromise;
    }
  })
})
