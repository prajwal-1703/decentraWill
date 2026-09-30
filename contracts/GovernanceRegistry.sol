// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GovernanceRegistry
 * @notice Anchors decisions and proofs of estate governance votes.
 */
contract GovernanceRegistry {
    enum ProposalState { PENDING, PASSED, REJECTED, EXECUTED }

    struct ProposalRecord {
        bytes32 proposalHash;
        bytes32 estateHash;
        ProposalState state;
        uint32 votesFor;
        uint32 votesAgainst;
        uint256 concludedAt;
        bytes32 resolutionHash;
    }

    address public owner;
    mapping(bytes32 => ProposalRecord) public proposals;

    event ProposalResolved(bytes32 indexed proposalHash, bytes32 indexed estateHash, ProposalState state, uint32 votesFor, uint32 votesAgainst, bytes32 resolutionHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function recordProposalResolution(
        bytes32 proposalHash,
        bytes32 estateHash,
        ProposalState state,
        uint32 votesFor,
        uint32 votesAgainst,
        bytes32 resolutionHash
    ) external onlyOwner {
        require(proposals[proposalHash].concludedAt == 0, "Proposal already recorded");

        proposals[proposalHash] = ProposalRecord({
            proposalHash: proposalHash,
            estateHash: estateHash,
            state: state,
            votesFor: votesFor,
            votesAgainst: votesAgainst,
            concludedAt: block.timestamp,
            resolutionHash: resolutionHash
        });

        emit ProposalResolved(proposalHash, estateHash, state, votesFor, votesAgainst, resolutionHash);
    }

    function getProposal(bytes32 proposalHash) external view returns (ProposalRecord memory) {
        return proposals[proposalHash];
    }
}
