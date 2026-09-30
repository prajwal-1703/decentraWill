// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AssetRegistry
 * @notice Stores minimal references for registered blockchain-native estate assets.
 */
contract AssetRegistry {
    enum AssetType { NATIVE_ETH, ERC20, ERC721, ERC1155, CUSTOM }

    struct AssetRecord {
        bytes32 estateHash;
        AssetType assetType;
        address tokenAddress;
        uint256 tokenId;
        bytes32 metadataHash;
        uint256 registeredAt;
    }

    address public owner;
    mapping(bytes32 => AssetRecord) public assets; // keyed by assetHash

    event AssetRegistered(bytes32 indexed assetHash, bytes32 indexed estateHash, AssetType assetType, address tokenAddress, uint256 tokenId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerAsset(
        bytes32 assetHash,
        bytes32 estateHash,
        AssetType assetType,
        address tokenAddress,
        uint256 tokenId,
        bytes32 metadataHash
    ) external onlyOwner {
        require(assets[assetHash].registeredAt == 0, "Asset already registered");

        assets[assetHash] = AssetRecord({
            estateHash: estateHash,
            assetType: assetType,
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            metadataHash: metadataHash,
            registeredAt: block.timestamp
        });

        emit AssetRegistered(assetHash, estateHash, assetType, tokenAddress, tokenId);
    }

    function getAsset(bytes32 assetHash) external view returns (AssetRecord memory) {
        return assets[assetHash];
    }
}
