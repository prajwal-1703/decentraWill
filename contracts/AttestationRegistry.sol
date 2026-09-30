// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AttestationRegistry
 * @notice Stores cryptographic proofs and references of participant attestations (witnesses, advocates).
 */
contract AttestationRegistry {
    enum AttestationType { ADVOCATE, WITNESS, EXECUTOR, TESTATOR }

    struct Attestation {
        bytes32 versionHash;
        address attestor;
        AttestationType attestationType;
        bytes32 signatureHash;
        uint256 timestamp;
    }

    address public owner;
    // attestationId (keccak256(versionHash, attestor, attestationType)) -> Attestation
    mapping(bytes32 => Attestation) public attestations;

    event AttestationRecorded(
        bytes32 indexed attestationId,
        bytes32 indexed versionHash,
        address indexed attestor,
        AttestationType attestationType,
        bytes32 signatureHash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function recordAttestation(
        bytes32 versionHash,
        address attestor,
        AttestationType attestationType,
        bytes32 signatureHash
    ) external onlyOwner returns (bytes32 attestationId) {
        attestationId = keccak256(abi.encodePacked(versionHash, attestor, uint8(attestationType)));
        require(attestations[attestationId].timestamp == 0, "Attestation already recorded");

        attestations[attestationId] = Attestation({
            versionHash: versionHash,
            attestor: attestor,
            attestationType: attestationType,
            signatureHash: signatureHash,
            timestamp: block.timestamp
        });

        emit AttestationRecorded(attestationId, versionHash, attestor, attestationType, signatureHash, block.timestamp);
    }

    function verifyAttestation(bytes32 attestationId) external view returns (bool) {
        return attestations[attestationId].timestamp > 0;
    }
}
