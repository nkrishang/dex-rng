async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const PriceRNG_Factory = await ethers.getContractFactory("DeFiRNG");
  const priceRNG = await PriceRNG_Factory.deploy();

  console.log("DeFi RNG address:", priceRNG.address);

  const RNGConsumer_Factory = await ethers.getContractFactory("RNGConsumer");
  const rngConsumer = await RNGConsumer_Factory.deploy(priceRNG.address);

  console.log("RNGConsumer address:", rngConsumer.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

// PriceRNG Address: 0xE3A652bb9C3e14d883e4F7204799B43DBe0083c7
// RNGConsumer Address: 0x3502E335C76Aac3f2d15A4Dd63A2d4a2F10533Fd