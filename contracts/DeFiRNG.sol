// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import "@openzeppelin/contracts/access/Ownable.sol";

contract DeFiRNG is Ownable {

  uint public currentPairIndex;

  struct PairAddresses {
    address tokenA;
    address tokenB;
    address pair;

    uint lastUpdateTimeStamp;
  }

  mapping(uint => PairAddresses) public pairs;
  mapping(address => uint) public pairIndex;
  mapping(address => bool) public active;

  event RandomNumber(address indexed requester, uint randomNumber);
  event PairAdded(address pair, address tokenA, address tokenB);
  event PairActiveStatus(address pair, bool active);

  constructor() {}

  /// @dev Add a UniswapV2 pair to draw randomness from.
  function addPair(
    address pair, 
    address tokenA, 
    address tokenB
  ) external onlyOwner {
    require(IUniswapV2Pair(pair).MINIMUM_LIQUIDITY() == 1000, "Invalid pair address provided.");
    require(pairIndex[pair] == 0, "This pair already exists.");
    
    currentPairIndex += 1;

    pairs[currentPairIndex] = PairAddresses({
      tokenA: tokenA,
      tokenB: tokenB,
      pair: pair,
      lastUpdateTimeStamp: 0
    });

    pairIndex[pair] = currentPairIndex;
    active[pair] = true;

    emit PairAdded(pair, tokenA, tokenB);
  }

  /// @dev Sets whether a UniswapV2 pair is actively used as a source of randomness.
  function changePairStatus(address pair, bool activeStatus) external onlyOwner {
    require(pairIndex[pair] != 0, "Cannot deactivate a pair that does not exist.");

    active[pair] = activeStatus;
    
    emit PairActiveStatus(pair, activeStatus);
  }

  /// @dev Returns a random number within the given range;
  function getRandomNumber(uint range) external returns (uint randomNumber, bool acceptableEntropy) {
    require(currentPairIndex > 0, "No Uniswap pairs available to draw randomness from.");
    
    uint blockSignature = uint(keccak256(abi.encodePacked(msg.sender, uint(blockhash(block.number - 1)))));

    for(uint i = 1; i < currentPairIndex; i++) {

      if(!active[pairs[i].pair]) {
        continue;
      }

      PairAddresses memory pairInfo = pairs[i];

      (uint reserveA, uint reserveB, uint lastUpdateTimeStamp) = getReserves(pairInfo.pair, pairInfo.tokenA, pairInfo.tokenB);
      
      uint randomMod = (reserveA + reserveB) % (range + 73);
      blockSignature += randomMod;

      if(lastUpdateTimeStamp > pairInfo.lastUpdateTimeStamp) {
        acceptableEntropy = true;
        
        pairInfo.lastUpdateTimeStamp = lastUpdateTimeStamp;
        pairs[i] = pairInfo;
      }
    }

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