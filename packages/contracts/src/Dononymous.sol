// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseHook} from "v4-periphery/BaseHook.sol";

import {Hooks} from "@uniswap/v4-core/contracts/libraries/Hooks.sol";
import {IPoolManager} from "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/contracts/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/contracts/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/contracts/types/BalanceDelta.sol";

import {ERC1155} from "openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";

contract Dononymous is BaseHook, ERC1155 {
    using PoolIdLibrary for PoolKey;

    // mapping organization => share of fee
    mapping(address organization => uint256 share) organizationShare;

    constructor(
        IPoolManager _poolManager,
        string memory _uri
    ) BaseHook(_poolManager) ERC1155(_uri) {}

    function getHooksCalls() public pure override returns (Hooks.Calls memory) {
        return
            Hooks.Calls({
                beforeInitialize: false,
                afterInitialize: false,
                beforeModifyPosition: true,
                afterModifyPosition: false,
                beforeSwap: false,
                afterSwap: false,
                beforeDonate: false,
                afterDonate: false
            });
    }

    // Main functionality
    function provideDonut() public {
        // add liquidity
    }

    // Hook
    function beforeModifyPosition(
        address,
        PoolKey calldata,
        IPoolManager.ModifyPositionParams calldata,
        bytes calldata
    ) external override poolManagerOnly returns (bytes4) {
        // verify identity

        return BaseHook.beforeModifyPosition.selector;
    }

    // Helper
    function _handleModifyPosition(
        PoolKey calldata key,
        IPoolManager.ModifyPositionParams memory params,
        bytes calldata hookData
    ) public {
        BalanceDelta delta = poolManager.modifyPosition(key, params, bytes(""));
    }
}
