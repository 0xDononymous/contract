// SPDX-License-Identifier: MIT
pragma solidity 0.8.4 || 0.8.19;

import "./DononymousSemaphore.sol";

contract MockSemaphoreHook is DononymousSemaphore {
    constructor(address _semaphoreAddress) DononymousSemaphore(_semaphoreAddress) {}
}
