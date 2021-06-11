async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const PriceRNG_Factory = await ethers.getContractFactory("PriceRNG");
  const priceRNG = await PriceRNG_Factory.deploy();

  console.log("PriceRNG address:", priceRNG.address);

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