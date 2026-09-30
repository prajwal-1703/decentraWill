import { CryptoService } from '../../src/common/crypto.service';

describe('CryptoService Unit Tests', () => {
  let cryptoService: CryptoService;

  beforeAll(() => {
    cryptoService = new CryptoService();
  });

  describe('Argon2 Password Hashing', () => {
    it('should hash and correctly verify passwords', async () => {
      const password = 'StrongTestPassword!2026';
      const hash = await cryptoService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$argon2id$')).toBe(true);

      const isValid = await cryptoService.verifyPassword(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await cryptoService.verifyPassword(hash, 'WrongPassword');
      expect(isInvalid).toBe(false);
    });
  });

  describe('SHA-256 Hashing', () => {
    it('should calculate reproducible deterministic hashes', () => {
      const data = 'DecentraWill Authoritative Testament Payload';
      const hash1 = cryptoService.sha256(data);
      const hash2 = cryptoService.sha256(data);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);

      // Modified single character must produce completely different hash
      const hashModified = cryptoService.sha256(data + 'x');
      expect(hashModified).not.toBe(hash1);
    });
  });

  describe('Envelope Encryption (AES-256-GCM)', () => {
    it('should encrypt with DEK and decrypt back to original plaintext', () => {
      const originalText = 'Confidential Last Will Clause: Assets to Family';
      const originalBuffer = Buffer.from(originalText, 'utf8');

      const envelope = cryptoService.encryptEnvelope(originalBuffer);

      expect(envelope.encryptedContent).toBeDefined();
      expect(envelope.encryptedDek).toBeDefined();
      expect(envelope.dekIv).toBeDefined();
      expect(envelope.sha256).toBe(cryptoService.sha256(originalBuffer));

      const decryptedBuffer = cryptoService.decryptEnvelope(
        envelope.encryptedContent,
        envelope.encryptedDek,
        envelope.dekIv,
        envelope.authTag
      );

      expect(decryptedBuffer.toString('utf8')).toBe(originalText);
    });

    it('should fail decryption if encrypted bytes are tampered', () => {
      const buffer = Buffer.from('Sensitive Legal Data', 'utf8');
      const envelope = cryptoService.encryptEnvelope(buffer);

      // Corrupt one byte of the ciphertext
      const corrupted = Buffer.from(envelope.encryptedContent);
      corrupted[corrupted.length - 1] ^= 0xff;

      expect(() => {
        cryptoService.decryptEnvelope(corrupted, envelope.encryptedDek, envelope.dekIv, envelope.authTag);
      }).toThrow();
    });
  });

  describe('Chained Audit Hash', () => {
    it('should compute cryptographic event chain where previous hash affects current hash', () => {
      const genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
      const event1 = { action: 'ESTATE_CREATED', estateId: 'estate-1' };
      const hash1 = cryptoService.calculateAuditHash(genesisHash, event1);

      const event2 = { action: 'WILL_FINALIZED', versionNo: 1 };
      const hash2 = cryptoService.calculateAuditHash(hash1, event2);

      expect(hash1).not.toBe(genesisHash);
      expect(hash2).not.toBe(hash1);

      // If previous event hash is altered, hash2 must completely fail validation
      const tamperedHash1 = '1111111111111111111111111111111111111111111111111111111111111111';
      const recalculatedHash2 = cryptoService.calculateAuditHash(tamperedHash1, event2);
      expect(recalculatedHash2).not.toBe(hash2);
    });
  });
});
