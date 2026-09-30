// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IntegrityAnchor
 * @notice Anchors cryptographic hashes of will documents/versions and events on-chain.
 */
contract IntegrityAnchor {
    struct Anchor {
        bytes32 docHash;
        string versionRef;
        uint256 timestamp;
        address anchoredBy;
    }

    address public owner;
    mapping(bytes32 => Anchor) public anchors;

    event HashAnchored(bytes32 indexed docHash, string versionRef, uint256 timestamp, address indexed anchoredBy);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function anchorHash(bytes32 docHash, string calldata versionRef) external onlyOwner {
        require(anchors[docHash].timestamp == 0, "Hash already anchored");

        anchors[docHash] = Anchor({
            docHash: docHash,
            versionRef: versionRef,
            timestamp: block.timestamp,
            anchoredBy: msg.sender
        });

        emit HashAnchored(docHash, versionRef, block.timestamp, msg.sender);
    }

    function verifyHash(bytes32 docHash) external view returns (bool exists, uint256 timestamp, string memory versionRef) {
        Anchor memory a = anchors[docHash];
        if (a.timestamp > 0) {
            return (true, a.timestamp, a.versionRef);
        }
        return (false, 0, "");
    }
}
