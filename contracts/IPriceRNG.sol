// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPriceRNG {
  /// @dev Returns a random number within the given range;
  function getRandomNumber(uint range) external returns (uint randomNumber);
}