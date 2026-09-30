export declare const configuration: () => {
    port: number;
    nodeEnv: string;
    appUrl: string;
    corsOrigin: string;
    databaseUrl: string;
    redisUrl: string;
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
        stepUpExpiresIn: string;
    };
    encryption: {
        masterKey: string;
    };
    storage: {
        provider: string;
        localDir: string;
        minio: {
            endpoint: string;
            port: number;
            useSSL: boolean;
            accessKey: string;
            secretKey: string;
            bucket: string;
        };
    };
    blockchain: {
        rpcUrl: string;
        chainId: number;
        signerKey: string;
        contracts: {
            willRegistry: string;
            integrityAnchor: string;
            attestationRegistry: string;
            assetRegistry: string;
            governanceRegistry: string;
            assetTransferManager: string;
        };
    };
};
