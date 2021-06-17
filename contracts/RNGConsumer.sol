// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import './IDexRNG.sol';

/**
 * This contract is meant to be used for the DEX RNG bounty by NFT Labs.
 * You can find the bounty at - https://gitcoin.com/xxx
 * DEX RNG address - 0x0000000000000000000000000000000000000000
 */

contract RNGConsumer is Ownable {

  uint public range = 100;
  uint public randomNumber;
  bool public acceptableEntropy;

  IDexRNG internal dexRNG;

  event RandomNumber(uint randomNumber);
  event Success(address bountyHunter, uint randomNumber);
  event TryAgain(address bountyHunter, uint randomNumber);

  constructor(address _dexRNG) {
    dexRNG = IDexRNG(_dexRNG);
  }

  /// @dev Sets the address of the DEX RNG.
  function setdexRNG(address _dexRNG) external onlyOwner {
    dexRNG = IDexRNG(_dexRNG);
  }

  /// @dev Gets a random number from the DEX RNG.
  function random(uint predictedRandomNumber) external {
    (randomNumber, acceptableEntropy) = dexRNG.getRandomNumber(range);

    if(predictedRandomNumber == randomNumber && acceptableEntropy) {
      emit Success(msg.sender, randomNumber);
    } else {
      emit TryAgain(msg.sender, randomNumber);
    }

    emit RandomNumber(randomNumber);
  }
}