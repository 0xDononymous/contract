// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/console.sol";

import {IInternalPoolManager} from "../interfaces/IInternalPoolManager.sol";

import {BaseHook} from "v4-periphery/BaseHook.sol";
import {DononymousSemaphore} from "../contracts/DononymousSemaphore.sol";

import {Hooks} from "@uniswap/v4-core/contracts/libraries/Hooks.sol";
import {Pool} from "@uniswap/v4-core/contracts/libraries/Pool.sol";
import {IPoolManager} from "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/contracts/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/contracts/types/PoolId.sol";
import {BalanceDelta, toBalanceDelta} from "@uniswap/v4-core/contracts/types/BalanceDelta.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/contracts/types/Currency.sol";
import {IHookFeeManager} from "@uniswap/v4-core/contracts/interfaces/IHookFeeManager.sol";
import {IFees} from "@uniswap/v4-core//contracts/interfaces/IFees.sol";

import {FixedPointMathLib} from "solmate/utils/FixedPointMathLib.sol";

import {ERC1155} from "openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract Dononymous is BaseHook, ERC1155, IHookFeeManager, DononymousSemaphore {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using Pool for *;
    using FixedPointMathLib for uint256;

    address[] organizationList;
    uint256 totalShare;
    mapping(address organization => uint256 share) public organizationShare;
    mapping(address organization => uint256 balance) public organizationBalance0;
    mapping(address organization => uint256 balance) public organizationBalance1;

    address relayer;
    int256 LIQUIDITY_DELTA = 10 ether;
    int256 DONATION_BASE_0;
    int256 DONATION_BASE_1;

    uint256 public constant CRUMBS = 0;
    uint256 public constant DONUT = 1;

    constructor(IPoolManager _poolManager, string memory _uri, address _relayer, address _semaphoreAddress)
        BaseHook(_poolManager)
        ERC1155(_uri)
        DononymousSemaphore(_semaphoreAddress)
    {
        relayer = _relayer;
    }

    function getHooksCalls() public pure override returns (Hooks.Calls memory) {
        return Hooks.Calls({
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

    function getHookSwapFee(PoolKey calldata key) external view returns (uint8) {
        return uint8(5);
    }

    function getHookWithdrawFee(PoolKey calldata key) external view returns (uint8) {
        return 0;
    }

    // Main functionality
    function provideCrumbs(
        PoolKey calldata key,
        address org,
        int24 _tickLower,
        int24 _tickUpper,
        uint256 _groupId,
        uint256 _identityCommitment
    ) public {
        require(msg.sender == relayer, "Only relayer action");
        // add fund to the smart contract
        infuseFund(key);

        // Setup the modifyPosition parameters
        IPoolManager.ModifyPositionParams memory modifyPositionParams = IPoolManager.ModifyPositionParams({
            tickLower: _tickLower,
            tickUpper: _tickUpper,
            liquidityDelta: LIQUIDITY_DELTA
        });

        BalanceDelta delta = abi.decode(
            poolManager.lock(abi.encodeCall(this._handleModifyPosition, (key, modifyPositionParams, abi.encode(org)))),
            (BalanceDelta)
        );

        joinService(_groupId, _identityCommitment);
    }

    function provideDonut(
        PoolKey calldata key,
        address org,
        bool isCurrency0,
        uint256 amount,
        address NFTreceiver,
        uint256 _groupId,
        uint256 _identityCommitment
    ) public {
        require(msg.sender == relayer, "Only relayer action");
        // add fund to the smart contract
        infuseFund(key);

        if (NFTreceiver != address(0)) {
            _mint(NFTreceiver, DONUT, 1, "");
        }

        address currencyToTransfer = isCurrency0 ? Currency.unwrap(key.currency0) : Currency.unwrap(key.currency1);
        IERC20(currencyToTransfer).transferFrom(relayer, org, amount);

        joinService(_groupId, _identityCommitment);
    }

    function claimFund(PoolKey calldata key) public {
        uint256 amount0 = organizationBalance0[msg.sender];
        organizationBalance0[msg.sender] = 0;
        uint256 amount1 = organizationBalance1[msg.sender];
        organizationBalance1[msg.sender] = 0;
        IERC20(Currency.unwrap(key.currency0)).transfer(msg.sender, amount0);
        IERC20(Currency.unwrap(key.currency1)).transfer(msg.sender, amount1);
    }

    // Hook
    function beforeModifyPosition(
        address,
        PoolKey calldata key,
        IPoolManager.ModifyPositionParams calldata params,
        bytes calldata hookData
    ) external override poolManagerOnly returns (bytes4) {
        address token0 = Currency.unwrap(key.currency0);
        address token1 = Currency.unwrap(key.currency1);
        (
            address _org,
            address _NFTreceiver,
            uint256 _groupId,
            uint256 _feedback,
            uint256 _merkleTreeRoot,
            uint256 _nullifierHash,
            uint256 _externalNullifier,
            uint256[8] memory _proof
        ) = abi.decode(hookData, (address, address, uint256, uint256, uint256, uint256, uint256, uint256[8]));
        uint256 hookDataLength = hookData.length;
        if (params.liquidityDelta > 0) {
            // For provide liquidity
            if (hookDataLength > 0) {
                if (_NFTreceiver != address(0)) {
                    _mint(_NFTreceiver, CRUMBS, 1, "");
                }
                totalShare++;
                organizationShare[_org]++;
            }
        } else {
            // For remove liquidity
            verifyWithdraw(_groupId, _feedback, _merkleTreeRoot, _nullifierHash, _externalNullifier, _proof);

            // Pre Claim Balance
            uint256 preClaimBalance0 = IERC20(token0).balanceOf(address(this));
            uint256 preClaimBalance1 = IERC20(token1).balanceOf(address(this));

            IInternalPoolManager(address(poolManager)).collectHookFees(address(this), key.currency0, 0);
            IInternalPoolManager(address(poolManager)).collectHookFees(address(this), key.currency1, 0);

            // Post Claim Balance
            uint256 postClaimBalance0 = IERC20(token0).balanceOf(address(this));
            uint256 postClaimBalance1 = IERC20(token1).balanceOf(address(this));

            // distribute fee over to the organizations
            for (uint256 i = 0; i < organizationList.length;) {
                uint256 share0 = (postClaimBalance0 - preClaimBalance0).mulDivDown(
                    organizationShare[organizationList[i]], totalShare
                );
                uint256 share1 = (postClaimBalance1 - preClaimBalance1).mulDivDown(
                    organizationShare[organizationList[i]], totalShare
                );

                organizationBalance0[organizationList[i]] += share0;
                organizationBalance1[organizationList[i]] += share1;

                unchecked {
                    i++;
                }
            }

            if (hookDataLength > 0) {
                address org = 0x567fd643E1693581bB4Cf31D6300Cd177e0C5Fc0;
                totalShare--;
                organizationShare[org]--;
            }
        }
        return BaseHook.beforeModifyPosition.selector;
    }

    // Helper
    function _handleModifyPosition(
        PoolKey calldata key,
        IPoolManager.ModifyPositionParams memory params,
        bytes calldata hookData
    ) public returns (BalanceDelta) {
        BalanceDelta delta = poolManager.modifyPosition(key, params, hookData);

        int256 delta0 = delta.amount0();
        int256 delta1 = delta.amount1();

        // settle
        if (delta0 > 0) {
            IERC20(Currency.unwrap(key.currency0)).transfer(address(poolManager), uint256(delta0));
            poolManager.settle(key.currency0);
        }

        if (delta1 > 0) {
            IERC20(Currency.unwrap(key.currency1)).transfer(address(poolManager), uint256(delta1));
            poolManager.settle(key.currency1);
        }

        // take
        if (delta0 < 0) {
            poolManager.take(key.currency0, address(this), uint256(-delta0));
        }

        if (delta1 < 0) {
            poolManager.take(key.currency1, address(this), uint256(-delta1));
        }

        return delta;
    }

    function infuseFund(PoolKey calldata key) public {
        IERC20(Currency.unwrap(key.currency0)).transferFrom(
            relayer, address(this), IERC20(Currency.unwrap(key.currency0)).balanceOf(relayer)
        );
        IERC20(Currency.unwrap(key.currency1)).transferFrom(
            relayer, address(this), IERC20(Currency.unwrap(key.currency1)).balanceOf(relayer)
        );
    }

    function infuseBufferFund(PoolKey calldata key, uint256 amount0, uint256 amount1) public {
        IERC20(Currency.unwrap(key.currency0)).transferFrom(msg.sender, address(this), amount0);
        IERC20(Currency.unwrap(key.currency1)).transferFrom(msg.sender, address(this), amount1);
    }

    function setDonationBase(int256 amount0, int256 amount1) public {
        require(msg.sender == relayer, "Only relayer action");
        DONATION_BASE_0 = amount0;
        DONATION_BASE_1 = amount1;
    }

    function addOrganizations(address org) public {
        require(msg.sender == relayer, "Only relayer action");
        organizationList.push(org);
    }
}
