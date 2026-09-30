export interface EnvelopeEncryptionResult {
    encryptedContent: Buffer;
    encryptedDek: string;
    dekIv: string;
    authTag: string;
    sha256: string;
}
export declare class CryptoService {
    private readonly masterKey;
    constructor();
    hashPassword(password: string): Promise<string>;
    verifyPassword(hash: string, plain: string): Promise<boolean>;
    sha256(data: Buffer | string): string;
    encryptEnvelope(buffer: Buffer): EnvelopeEncryptionResult;
    decryptEnvelope(encryptedPackage: Buffer, encryptedDekBase64: string, dekIvBase64: string, authTagBase64: string): Buffer;
    calculateAuditHash(previousHash: string, eventData: Record<string, any>): string;
    generateSecureToken(bytes?: number): string;
}
