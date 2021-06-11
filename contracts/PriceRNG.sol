// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceRNG is Ownable {

  uint public numOfPairs;

  struct PairAddresses {
    address tokenA;
    address tokenB;
    address pair;

    uint lastUpdateTimeStamp;
  }

  mapping(uint => PairAddresses) public pairs;

  event RandomNumber(address indexed requester, uint randomNumber);
  event PairAdded(address pair, address tokenA, address tokenB);

  constructor() {}

  /// @dev Add a UniswapV2 pair to draw randomness from.
  function addPair(
    address pair, 
    address tokenA, 
    address tokenB
  ) external onlyOwner {
    require(IUniswapV2Pair(pair).MINIMUM_LIQUIDITY() == 1000, "Invalid pair address provided.");
    
    pairs[numOfPairs] = PairAddresses({
      tokenA: tokenA,
      tokenB: tokenB,
      pair: pair,
      lastUpdateTimeStamp: 0
    });

    numOfPairs += 1;

    emit PairAdded(pair, tokenA, tokenB);
  }

  /// @dev Returns a random number within the given range;
  function getRandomNumber(uint range) external returns (uint randomNumber) {
    require(numOfPairs > 0, "No Uniswap pairs available to draw randomness from.");
    
    bool acceptableEntropy;
    uint blockSignature = uint(keccak256(abi.encodePacked(msg.sender, uint(blockhash(block.number - 1)))));

    for(uint i = 0; i < numOfPairs; i++) {
      PairAddresses memory pairInfo = pairs[i];
      (uint reserveA, uint reserveB, uint lastUpdateTimeStamp) = getReserves(pairInfo.pair, pairInfo.tokenA, pairInfo.tokenB);
      
      uint randomMod = (reserveA + reserveB) % 73;
      blockSignature += randomMod;

      if(lastUpdateTimeStamp > pairInfo.lastUpdateTimeStamp) {
        acceptableEntropy = true;
        
        pairInfo.lastUpdateTimeStamp = lastUpdateTimeStamp;
        pairs[i] = pairInfo;
      }
    }

    require(acceptableEntropy, "Cannot generate a sufficiently random number.");
    randomNumber = blockSignature % range;
    
    emit RandomNumber(msg.sender, randomNumber);
  }
  
  /// @notice See `UniswapV2Library.sol`
  function getReserves(
    address pair, 
    address tokenA, 
    address tokenB
  ) internal view returns (uint reserveA, uint reserveB, uint lastUpdateTimeStamp) {
    (address token0,) = sortTokens(tokenA, tokenB);
    (uint reserve0, uint reserve1, uint blockTimestampLast) = IUniswapV2Pair(pair).getReserves();
    (reserveA, reserveB, lastUpdateTimeStamp) = tokenA == token0 ? (reserve0, reserve1, blockTimestampLast) : (reserve1, reserve0, blockTimestampLast);
  }

  /// @notice See `UniswapV2Library.sol`
  function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
    require(tokenA != tokenB, 'UniswapV2Library: IDENTICAL_ADDRESSES');
    (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    require(token0 != address(0), 'UniswapV2Library: ZERO_ADDRESS');
  }
}