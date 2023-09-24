//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

abstract contract DononymousSemaphore is Ownable {
    ISemaphore public semaphore;
    mapping(address => uint256) public organizationGroup;

    constructor(address semaphoreAddress) {
        semaphore = ISemaphore(semaphoreAddress);
        // Organization Group 0 will be ourselves
        semaphore.createGroup(0, 20, address(this));
    }

    function initOrganization(address _organization, uint256 _groupId, uint256 _depth) external onlyOwner {
        organizationGroup[_organization] = _groupId;
        semaphore.createGroup(_groupId, _depth, address(this));
    }

    function joinService(uint256 _groupId, uint256 _identityCommitment) public {
        semaphore.addMember(_groupId, _identityCommitment);
    }

    function verifyWithdraw(
        uint256 _groupId,
        uint256 _feedback,
        uint256 _merkleTreeRoot,
        uint256 _nullifierHash,
        uint256 _externalNullifier,
        uint256[8] memory _proof
    ) public {
        semaphore.verifyProof(_groupId, _merkleTreeRoot, _feedback, _nullifierHash, _externalNullifier, _proof);
    }
}
