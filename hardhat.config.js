require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const TEST_PRIVATE_KEY = process.env.TEST_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.0",
  networks: {
    mainnet: {
      url: process.env.ALCHEMY_ENDPOINT_MAINNET,
      accounts: [`${TEST_PRIVATE_KEY}`]
    }
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};