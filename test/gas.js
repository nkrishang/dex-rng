const { ethers } = require("hardhat");

const [pairs] = require('../utils/utils.js');

describe("Gas estimates for getRandomNumber()", () => {

  const range = 100;
  let priceRNG;

  before(async () => {
    const PriceRNG_Factory = await ethers.getContractFactory("PriceRNG");
    priceRNG = await PriceRNG_Factory.deploy();
  })

  it("Estimate with 1 to 5 pairs", async () => {

    let counter = 1;

    for(let addresses of pairs) {

      await priceRNG.addPair(addresses.pair, addresses.tokenA, addresses.tokenB);

      const gasEstimate = await priceRNG.estimateGas.getRandomNumber(range)
      const parsedEstimate = (parseInt(gasEstimate).toString());

      console.log(
        `Gas estimate with ${counter} pairs: `,
        parsedEstimate
      )

      counter++
    }
  })
})

/// With 1 pair:

// Beggining to end of getRandomNumber() -- 45,473 gas
// Before and after call in another contract -- 73600