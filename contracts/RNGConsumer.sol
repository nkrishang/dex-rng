// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import './IDexRNG.sol';

contract RNGConsumer is Ownable {

  uint public randomNumber;
  bool public acceptableEntropy;

  IDeFiRNG internal priceRNG;

  event PriceRNGSet(address priceRNGAddress);
  event RandomNumber(uint randomNumber);

  constructor(address _priceRNG) {
    priceRNG = IDeFiRNG(_priceRNG);
    emit PriceRNGSet(_priceRNG);
  }

  /// @dev Sets the address of the Price RNG.
  function setPriceRNG(address _priceRNG) external onlyOwner {
    priceRNG = IDeFiRNG(_priceRNG);
    emit PriceRNGSet(_priceRNG);
  }

  /// @dev Gets a random number from the Price RNG.
  function random(uint range) external {
    (randomNumber, acceptableEntropy) = priceRNG.getRandomNumber(range);
    emit RandomNumber(randomNumber);
  }
}