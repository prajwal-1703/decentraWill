// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AssetTransferManager
 * @notice Controlled on-chain execution manager for supported digital asset transfers.
 * Only processes transfers authorized by estate governance and policy gates.
 */
contract AssetTransferManager {
    enum TransferState { SUBMITTED, EXECUTED, CANCELLED }

    struct TransferRecord {
        bytes32 transferCaseHash;
        address token;
        address from;
        address to;
        uint256 amount;
        TransferState state;
        uint256 timestamp;
    }

    address public owner;
    mapping(bytes32 => TransferRecord) public transfers;
    mapping(bytes32 => bool) public executedCases;

    event TransferExecuted(bytes32 indexed transferCaseHash, address indexed token, address indexed to, uint256 amount);
    event NativeEthTransferExecuted(bytes32 indexed transferCaseHash, address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    function recordTransferExecution(
        bytes32 transferCaseHash,
        address token,
        address from,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(!executedCases[transferCaseHash], "Transfer already executed");
        executedCases[transferCaseHash] = true;

        transfers[transferCaseHash] = TransferRecord({
            transferCaseHash: transferCaseHash,
            token: token,
            from: from,
            to: to,
            amount: amount,
            state: TransferState.EXECUTED,
            timestamp: block.timestamp
        });

        emit TransferExecuted(transferCaseHash, token, to, amount);
    }

    function executeNativeTransfer(
        bytes32 transferCaseHash,
        address payable to,
        uint256 amount
    ) external onlyOwner {
        require(!executedCases[transferCaseHash], "Transfer already executed");
        require(address(this).balance >= amount, "Insufficient contract balance");

        executedCases[transferCaseHash] = true;

        transfers[transferCaseHash] = TransferRecord({
            transferCaseHash: transferCaseHash,
            token: address(0),
            from: address(this),
            to: to,
            amount: amount,
            state: TransferState.EXECUTED,
            timestamp: block.timestamp
        });

        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit NativeEthTransferExecuted(transferCaseHash, to, amount);
    }
}
