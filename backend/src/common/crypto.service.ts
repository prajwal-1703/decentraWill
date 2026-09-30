import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

export interface EnvelopeEncryptionResult {
  encryptedContent: Buffer;
  encryptedDek: string; // base64
  dekIv: string;        // base64
  authTag: string;      // base64
  sha256: string;
}

@Injectable()
export class CryptoService {
  private readonly masterKey: Buffer;

  constructor() {
    const rawKey = process.env.MASTER_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    this.masterKey = Buffer.from(rawKey.padStart(64, '0').slice(0, 64), 'hex');
  }

  // --- Password Hashing (Argon2id) ---
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  // --- SHA-256 Integrity ---
  sha256(data: Buffer | string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // --- Envelope Encryption (AES-256-GCM) ---
  encryptEnvelope(buffer: Buffer): EnvelopeEncryptionResult {
    const sha256 = this.sha256(buffer);

    // 1. Generate random 256-bit DEK
    const dek = crypto.randomBytes(32);

    // 2. Encrypt document with DEK using AES-256-GCM
    const docIv = crypto.randomBytes(12);
    const docCipher = crypto.createCipheriv('aes-256-gcm', dek, docIv);
    const encryptedContent = Buffer.concat([docCipher.update(buffer), docCipher.final()]);
    const docAuthTag = docCipher.getAuthTag();

    // Bundle docIv and docAuthTag with the encrypted document bytes
    // Format: [12 bytes IV][16 bytes AuthTag][Ciphertext]
    const packagedContent = Buffer.concat([docIv, docAuthTag, encryptedContent]);

    // 3. Wrap DEK using Master Key with AES-256-GCM
    const dekIv = crypto.randomBytes(12);
    const dekCipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, dekIv);
    const wrappedDek = Buffer.concat([dekCipher.update(dek), dekCipher.final()]);
    const dekAuthTag = dekCipher.getAuthTag();

    return {
      encryptedContent: packagedContent,
      encryptedDek: wrappedDek.toString('base64'),
      dekIv: dekIv.toString('base64'),
      authTag: dekAuthTag.toString('base64'),
      sha256,
    };
  }

  // --- Envelope Decryption ---
  decryptEnvelope(
    encryptedPackage: Buffer,
    encryptedDekBase64: string,
    dekIvBase64: string,
    authTagBase64: string
  ): Buffer {
    // 1. Unwrap DEK using Master Key
    const dekIv = Buffer.from(dekIvBase64, 'base64');
    const wrappedDek = Buffer.from(encryptedDekBase64, 'base64');
    const dekAuthTag = Buffer.from(authTagBase64, 'base64');

    const dekDecipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, dekIv);
    dekDecipher.setAuthTag(dekAuthTag);
    const dek = Buffer.concat([dekDecipher.update(wrappedDek), dekDecipher.final()]);

    // 2. Extract docIv (12 bytes), docAuthTag (16 bytes), and ciphertext from packaged content
    const docIv = encryptedPackage.subarray(0, 12);
    const docAuthTag = encryptedPackage.subarray(12, 28);
    const ciphertext = encryptedPackage.subarray(28);

    const docDecipher = crypto.createDecipheriv('aes-256-gcm', dek, docIv);
    docDecipher.setAuthTag(docAuthTag);
    return Buffer.concat([docDecipher.update(ciphertext), docDecipher.final()]);
  }

  // --- Audit Chained Hash: SHA256(previousHash + canonicalEvent) ---
  calculateAuditHash(previousHash: string, eventData: Record<string, any>): string {
    const canonical = JSON.stringify(eventData, Object.keys(eventData).sort());
    return this.sha256(previousHash + canonical);
  }

  // --- Secure Random Token Generation ---
  generateSecureToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }
}
