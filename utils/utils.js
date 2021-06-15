// from: https://github.com/ethereumvex/SushiMaker-bridge-exploit/blob/master/utils/utils.js
const hre = require("hardhat");
require('dotenv').config();
const ALCHEMY_API_KEY = process.env.ALCHEMY_KEY;

const WETH_USDC_PAIR = {
    tokenA: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenB: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    pair: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc'
}

const WETH_USDT_PAIR = {
    tokenA: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    tokenB: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    pair: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"
}

const WETH_FEI_PAIR = {
    tokenA: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    tokenB: "0x956f47f50a910163d8bf957cf5846d573e7f87ca",
    pair: "0x94b0a3d511b6ecdb17ebf877278ab030acb0a878"
}

const WETH_DAI_PAIR = {
    tokenA: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    tokenB: "0x6b175474e89094c44da98b954eedeac495271d0f",
    pair: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11"
}

const WETH_WBTC_PAIR = {
    tokenA: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    tokenB: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    pair: "0xbb2b8038a1640196fbe3e38816f3e67cba72d940"
}

const pairs = [
    WETH_USDC_PAIR,
    WETH_USDT_PAIR,
    WETH_FEI_PAIR,
    WETH_DAI_PAIR,
    WETH_WBTC_PAIR
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