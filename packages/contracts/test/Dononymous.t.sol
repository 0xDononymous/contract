// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {GasSnapshot} from "forge-gas-snapshot/GasSnapshot.sol";
import {IHooks} from "@uniswap/v4-core/contracts/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/contracts/libraries/Hooks.sol";
import {TickMath} from "@uniswap/v4-core/contracts/libraries/TickMath.sol";
import {IPoolManager} from "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/contracts/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/contracts/types/PoolId.sol";
import {Deployers} from "@uniswap/v4-core/test/foundry-tests/utils/Deployers.sol";
import {CurrencyLibrary, Currency} from "@uniswap/v4-core/contracts/types/Currency.sol";
import {HookTest} from "./utils/HookTest.sol";
import {Dononymous} from "../src/Dononymous.sol";
import {HookMiner} from "./utils/HookMiner.sol";

contract DononymousTest is HookTest, Deployers, GasSnapshot {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;

    PoolKey poolKey;
    PoolId poolId;
    Dononymous dono;

    function setUp() public {
        // creates the pool manager, test tokens, and other utility routers
        HookTest.initHookTestEnv();

        // Deploy the hook to an address with the correct flags
        uint160 flags = uint160(Hooks.BEFORE_MODIFY_POSITION_FLAG);
        (address hookAddress, bytes32 salt) = HookMiner.find(
            address(this),
            flags,
            0,
            type(Dononymous).creationCode,
            abi.encode(address(manager))
        );

        console2.log(hookAddress);

        dono = new Dononymous{salt: salt}(
            IPoolManager(address(manager)),
            "testURL",
            0x3d8975383228DAFAfDb4ba090fA8B1077119f3AE
        );

        console.logAddress(address(hookAddress));
        console.logAddress(address(dono));
        require(
            address(dono) == hookAddress,
            "CounterTest: hook address mismatch"
        );

        // Create the pool
        poolKey = PoolKey(
            Currency.wrap(address(token0)),
            Currency.wrap(address(token1)),
            3000,
            60,
            IHooks(dono)
        );
        poolId = poolKey.toId();
        manager.initialize(poolKey, SQRT_RATIO_1_1, ZERO_BYTES);

        // Provide liquidity to the pool
        modifyPositionRouter.modifyPosition(
            poolKey,
            IPoolManager.ModifyPositionParams(-60, 60, 10 ether),
            bytes("")
        );
        modifyPositionRouter.modifyPosition(
            poolKey,
            IPoolManager.ModifyPositionParams(-120, 120, 10 ether),
            bytes("")
        );
        modifyPositionRouter.modifyPosition(
            poolKey,
            IPoolManager.ModifyPositionParams(
                TickMath.minUsableTick(60),
                TickMath.maxUsableTick(60),
                10 ether
            ),
            bytes("")
        );
    }

    function testModifyPosition() public {
        assertEq(
            dono.organizationShare(0x567fd643E1693581bB4Cf31D6300Cd177e0C5Fc0),
            0
        );

        // Perform a test swap //
        int24 tickLower = -10;
        int24 tickUpper = 10;
        int256 liquidityDelta = 10 ether;
        address org = 0x567fd643E1693581bB4Cf31D6300Cd177e0C5Fc0;
        provideLiquidity(poolKey, tickLower, tickUpper, liquidityDelta, org);
        // ------------------- //

        assertEq(
            dono.organizationShare(0x567fd643E1693581bB4Cf31D6300Cd177e0C5Fc0),
            1
        );
    }
}
