// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title WillRegistry
 * @notice Maintains minimal on-chain references for DecentraWill estates and will versions.
 * No raw wills or PII are stored on-chain.
 */
contract WillRegistry {
    enum WillState { DRAFT, ACTIVE, SUPERSEDED, ACTIVATION_PENDING, RELEASED, CLOSED, ARCHIVED }

    struct WillRecord {
        bytes32 estateHash;
        string versionRef;
        bytes32 documentHash;
        WillState state;
        uint256 timestamp;
        address registeredBy;
    }

    address public owner;
    mapping(bytes32 => WillRecord) public wills; // keyed by versionHash (keccak256(estateId + versionRef))
    mapping(bytes32 => bytes32) public activeWillForEstate; // estateHash -> versionHash

    event WillRegistered(bytes32 indexed versionHash, bytes32 indexed estateHash, string versionRef, bytes32 documentHash, uint256 timestamp);
    event WillStateUpdated(bytes32 indexed versionHash, WillState newState, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    function registerWill(
        bytes32 versionHash,
        bytes32 estateHash,
        string calldata versionRef,
        bytes32 documentHash
    ) external onlyOwner {
        require(wills[versionHash].timestamp == 0, "Already registered");

        // Mark previous active will superseded if exists
        bytes32 prevActive = activeWillForEstate[estateHash];
        if (prevActive != bytes32(0)) {
            wills[prevActive].state = WillState.SUPERSEDED;
            emit WillStateUpdated(prevActive, WillState.SUPERSEDED, block.timestamp);
        }

        wills[versionHash] = WillRecord({
            estateHash: estateHash,
            versionRef: versionRef,
            documentHash: documentHash,
            state: WillState.ACTIVE,
            timestamp: block.timestamp,
            registeredBy: msg.sender
        });

        activeWillForEstate[estateHash] = versionHash;

        emit WillRegistered(versionHash, estateHash, versionRef, documentHash, block.timestamp);
    }

    function updateWillState(bytes32 versionHash, WillState newState) external onlyOwner {
        require(wills[versionHash].timestamp != 0, "Will not found");
        wills[versionHash].state = newState;
        emit WillStateUpdated(versionHash, newState, block.timestamp);
    }

    function getWill(bytes32 versionHash) external view returns (WillRecord memory) {
        return wills[versionHash];
    }
}
