// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../../contracts/Semaphore.sol";

contract MockSemaphoreHook is Semaphore {
    constructor(address _semaphoreAddress) Semaphore(_semaphoreAddress) {}
}
