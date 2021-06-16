// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDexRNG {
  /// @dev Returns a random number within the given range;
  function getRandomNumber(uint range) external returns (uint randomNumber, bool acceptableEntropy);

  /// @dev View function - non state changing random number function.
  function viewRandomNumber(uint range) external view returns (uint randomNumber);
}