// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

abstract contract Semaphore {
    ISemaphore public semaphore;
    mapping(address => uint256) public organizationGroup;

    constructor(address _semaphoreAddress) {
        semaphore = ISemaphore(_semaphoreAddress);
        // Organization Group 0 will be ourselves
        semaphore.createGroup(0, 20, address(this));
    }

    function initOrganization(address _organization, uint256 _groupId, uint256 _depth) external {
        semaphore.createGroup(_groupId, _depth, address(this));
        organizationGroup[_organization] = _groupId;
    }

    function joinService(uint256 _groupId, uint256 _identityCommitment) external {
        semaphore.addMember(_groupId, _identityCommitment);
    }

    function verifyWithdraw(
        uint256 _groupId,
        uint256 _feedback,
        uint256 _merkleTreeRoot,
        uint256 _nullifierHash,
        uint256 _externalNullifier,
        uint256[8] calldata _proof
    ) external {
        semaphore.verifyProof(_groupId, _merkleTreeRoot, _feedback, _nullifierHash, _externalNullifier, _proof);
    }
}
