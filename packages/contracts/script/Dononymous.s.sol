// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import {Hooks} from "@uniswap/v4-core/contracts/libraries/Hooks.sol";
import {PoolManager} from "@uniswap/v4-core/contracts/PoolManager.sol";
import {IPoolManager} from "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import {PoolModifyPositionTest} from "@uniswap/v4-core/contracts/test/PoolModifyPositionTest.sol";
import {PoolSwapTest} from "@uniswap/v4-core/contracts/test/PoolSwapTest.sol";
import {PoolDonateTest} from "@uniswap/v4-core/contracts/test/PoolDonateTest.sol";
import {Dononymous} from "../src/Dononymous.sol";
import {HookMiner} from "../test/utils/HookMiner.sol";

/// @notice Forge script for deploying v4 & hooks to **anvil**
/// @dev This script only works on an anvil RPC because v4 exceeds bytecode limits
contract CounterScript is Script {
    address constant CREATE2_DEPLOYER = address(0x4e59b44847b379578588920cA78FbF26c0B4956C);
    address constant semaphore = address(0);

    function setUp() public {}

    function run() public {
        vm.broadcast();
        // uncomment for local use
        //PoolManager manager = new PoolManager(500000);
        // arbi
        address poolManagerAddress = 0x693B1C9fBb10bA64F0d97AE042Ee32aE9Eb5610D;

        // hook contracts must have specific flags encoded in the address
        uint160 flags = uint160(Hooks.BEFORE_MODIFY_POSITION_FLAG);

        // Mine a salt that will produce a hook address with the correct flags
        (address hookAddress, bytes32 salt) = HookMiner.find(
            CREATE2_DEPLOYER,
            flags,
            1000,
            type(Dononymous).creationCode,
            abi.encode(
                poolManagerAddress,
                "ipfs://QmWwRQH4yoBSK8zKoyt1kSZNb2iQuU87t3TCVekBXxn8vT/",
                0x3d8975383228DAFAfDb4ba090fA8B1077119f3AE,
                semaphore
            )
        );

        // Deploy the hook using CREATE2
        vm.broadcast();
        Dononymous dono = new Dononymous{salt: salt}(
            IPoolManager(poolManagerAddress),
            "ipfs://QmWwRQH4yoBSK8zKoyt1kSZNb2iQuU87t3TCVekBXxn8vT/",
            0x3d8975383228DAFAfDb4ba090fA8B1077119f3AE,
            semaphore
        );
        require(address(dono) == hookAddress, "DononymousScript: hook address mismatch");

        // Additional helpers for interacting with the pool
        vm.startBroadcast();
        new PoolModifyPositionTest(IPoolManager( poolManagerAddress));
        new PoolSwapTest(IPoolManager( poolManagerAddress));
        new PoolDonateTest(IPoolManager( poolManagerAddress));
        vm.stopBroadcast();
    }
}
