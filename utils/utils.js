// from: https://github.com/ethereumvex/SushiMaker-bridge-exploit/blob/master/utils/utils.js
const hre = require("hardhat");
require('dotenv').config();
const ALCHEMY_API_KEY = process.env.ALCHEMY_KEY;

const WETH_USDC_pair = {
    tokenA: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenB: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    pair: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc'
}

const pairs = [
    WETH_USDC_pair
]

const forkFrom = async (blockNumber) => {  
    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
            blockNumber: blockNumber,
          },
        },
      ],
    });
};

const impersonate = async function getImpersonatedSigner(address) {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [address]
    });
    return ethers.provider.getSigner(address);
}

module.exports = [pairs, forkFrom, impersonate];