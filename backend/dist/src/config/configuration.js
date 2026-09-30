"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
const configuration = () => ({
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    appUrl: process.env.APP_URL || 'http://localhost:4000',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6380',
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'decentrawill_jwt_access_secret_super_secure_key_12345',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'decentrawill_jwt_refresh_secret_super_secure_key_67890',
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        stepUpExpiresIn: process.env.STEP_UP_TOKEN_EXPIRES_IN || '10m',
    },
    encryption: {
        masterKey: process.env.MASTER_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    },
    storage: {
        provider: process.env.STORAGE_PROVIDER || 'local',
        localDir: process.env.STORAGE_LOCAL_DIR || '/home/attacker/Desktop/decentraWill/backend/storage_vault',
        minio: {
            endpoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: parseInt(process.env.MINIO_PORT || '9002', 10),
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
            bucket: process.env.MINIO_BUCKET || 'decentrawill-vault',
        },
    },
    blockchain: {
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'https://rpc.sepolia.org',
        chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '11155111', 10),
        signerKey: process.env.BLOCKCHAIN_SIGNER_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        contracts: {
            willRegistry: process.env.CONTRACT_WILL_REGISTRY || '0x1111111111111111111111111111111111111111',
            integrityAnchor: process.env.CONTRACT_INTEGRITY_ANCHOR || '0x2222222222222222222222222222222222222222',
            attestationRegistry: process.env.CONTRACT_ATTESTATION_REGISTRY || '0x3333333333333333333333333333333333333333',
            assetRegistry: process.env.CONTRACT_ASSET_REGISTRY || '0x4444444444444444444444444444444444444444',
            governanceRegistry: process.env.CONTRACT_GOVERNANCE_REGISTRY || '0x5555555555555555555555555555555555555555',
            assetTransferManager: process.env.CONTRACT_ASSET_TRANSFER_MANAGER || '0x6666666666666666666666666666666666666666',
        },
    },
});
exports.configuration = configuration;
//# sourceMappingURL=configuration.js.map