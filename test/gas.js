const { ethers } = require("hardhat");

const [pairs] = require('../utils/utils.js');

describe("Gas estimates for getRandomNumber()", () => {

  const range = 100;
  let rng;

  before(async () => {
    const RNG_Factory = await ethers.getContractFactory("DeFiRNG");
    rng = await RNG_Factory.deploy();
  })

  it("Est. gas for adding a pair", async () => {
    const { pair } = pairs[0]; 
    const gasEstimate = await rng.estimateGas.addPair(pair);
    const parsedEstimate = (parseInt(gasEstimate).toString());

    console.log("Gas estimate for adding pair: ", parsedEstimate);
  })

  it("Estimate with 1 to 5 pairs", async () => {

    let counter = 1;

    for(let addresses of pairs) {

      await rng.addPair(addresses.pair);

      if(counter == 1) {
        const statusGasEstimate = await rng.estimateGas.changePairStatus(addresses.pair, false);
        const parsedStatusEstimate = (parseInt(statusGasEstimate).toString());

        console.log("Gas estimate for changing pair status: ", parsedStatusEstimate);
      }

      const gasEstimate = await rng.estimateGas.getRandomNumber(range)
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