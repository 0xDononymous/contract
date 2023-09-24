// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IPoolManager} from "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/contracts/types/Currency.sol";

interface IInternalPoolManager is IPoolManager {
    function collectHookFees(address recipient, Currency currency, uint256 amount) external;
}
