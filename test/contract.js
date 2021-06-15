const { expect } = require("chai");
const { ethers } = require("hardhat");
const [pairs, forkFrom] = require('../utils/utils.js');

describe("Contract state changes", () => {

  let rng;
  
  const { pair } = pairs[0];
  const forkBlock = 12635536;
  const range = 100;

  beforeEach(async () => {
    await forkFrom(forkBlock);

    const RNG_Factory = await ethers.getContractFactory("DeFiRNG");
    rng = await RNG_Factory.deploy(); 
  })

  describe("Adding pairs", () => {
    it("Should emit PairAdded upon adding a pair", async () => {
      await expect(rng.addPair(pair))
        .to.emit(rng, "PairAdded")
    })

    it("Should revert if the address provided is not a Uniswap pair address", async () => {
      const incorrectPairAddr = '0x2Ee4c2e9666Ff48DE2779EB6f33cDC342d761372';

      await expect(rng.addPair(incorrectPairAddr))
        .to.be.reverted;
    })

    it("Should revert if the pair being added already exists as a source of randomness", async () => {
      await rng.addPair(pair);

      await expect(rng.addPair(pair))
        .to.be.revertedWith("This pair already exists as a randomness source.");
    })

    it("Should increment the current pair index by 1", async () => {
      const indexBeforeTx = parseInt((await rng.currentPairIndex()).toString())

      await rng.addPair(pair);

      const indexAfterTx = parseInt((await rng.currentPairIndex()).toString());
      expect(indexAfterTx - indexBeforeTx).to.equal(1);
    })

    it("Should set the newly added pair as active", async () => {
      await rng.addPair(pair);

      const pairStatus = await rng.active(pair);
      expect(pairStatus).to.equal(true);    
    })

    it("Should index the pair with the currentPairIndex", async () => {      
      await rng.addPair(pair);

      const currentIndex = parseInt((await rng.currentPairIndex()).toString())
      const pairInfoRetreived = await rng.pairs(currentIndex)
      const indexRetreived = parseInt((await rng.pairIndex(pair)).toString())

      expect(pairInfoRetreived.pair).to.equal(pair);
      expect(indexRetreived).to.equal(currentIndex);
    })
  })

  describe("Changing pair status", () => {
    it("Should emit PairStatusUpdated upon changing pair active status", async () => {
      await rng.addPair(pair);

      const activeStatus = false;
      await expect(rng.changePairStatus(pair, activeStatus))
        .to.emit(rng, "PairStatusUpdated")
        .withArgs(pair, activeStatus);
    })

    it("Should update the status of pair in the `active` mapping", async () => {
      await rng.addPair(pair);

      const activeStatus = false;
      await rng.changePairStatus(pair, activeStatus);

      const retreivedPairStatus = await rng.active(pair);
      expect(retreivedPairStatus).to.equal(activeStatus);
    })

    it("Should revert if pair does not exist as a source of randomness", async () => {
      const incorrectPairAddr = '0x2Ee4c2e9666Ff48DE2779EB6f33cDC342d761372';
      const activeStatus = true;

      await expect(rng.changePairStatus(incorrectPairAddr, activeStatus))
        .to.be.revertedWith("Cannot change the status of a pair that does not exist.")
    })
  })

  describe("Getting random number", () => {
    it("Should revert if no pairs have been added", async () => {
      const currentIndex = parseInt((await rng.currentPairIndex()).toString())
      expect(currentIndex).to.equal(0);

      await expect(rng.getRandomNumber(range))
        .to.be.revertedWith("No Uniswap pairs available to draw randomness from.");
    })

    it("Should emit the RandomNumber event", async () => {
      await rng.addPair(pair);

      await expect(rng.getRandomNumber(range))
        .to.emit(rng, "RandomNumber");
    })
  })
})