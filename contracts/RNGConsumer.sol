// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import './IDexRNG.sol';

contract RNGConsumer is Ownable {

  uint public range = 100;
  uint public randomNumber;
  bool public acceptableEntropy;

  IDexRNG internal priceRNG;

  event RandomNumber(uint randomNumber);
  event Success(address bountyHunter, uint randomNumber);
  event TryAgain(address bountyHunter, uint randomNumber);

  constructor(address _priceRNG) {
    priceRNG = IDexRNG(_priceRNG);
  }

  /// @dev Sets the address of the Price RNG.
  function setPriceRNG(address _priceRNG) external onlyOwner {
    priceRNG = IDexRNG(_priceRNG);
  }

  /// @dev Gets a random number from the Price RNG.
  function random(uint predictedRandomNumber) external {
    (randomNumber, acceptableEntropy) = priceRNG.getRandomNumber(range);

    if(predictedRandomNumber == randomNumber && acceptableEntropy) {
      emit Success(msg.sender, randomNumber);
    } else {
      emit TryAgain(msg.sender, randomNumber);
    }

    emit RandomNumber(randomNumber);
  }
}