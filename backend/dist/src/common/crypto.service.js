"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const argon2 = require("argon2");
let CryptoService = class CryptoService {
    constructor() {
        const rawKey = process.env.MASTER_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
        this.masterKey = Buffer.from(rawKey.padStart(64, '0').slice(0, 64), 'hex');
    }
    async hashPassword(password) {
        return argon2.hash(password, { type: argon2.argon2id });
    }
    async verifyPassword(hash, plain) {
        try {
            return await argon2.verify(hash, plain);
        }
        catch {
            return false;
        }
    }
    sha256(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    encryptEnvelope(buffer) {
        const sha256 = this.sha256(buffer);
        const dek = crypto.randomBytes(32);
        const docIv = crypto.randomBytes(12);
        const docCipher = crypto.createCipheriv('aes-256-gcm', dek, docIv);
        const encryptedContent = Buffer.concat([docCipher.update(buffer), docCipher.final()]);
        const docAuthTag = docCipher.getAuthTag();
        const packagedContent = Buffer.concat([docIv, docAuthTag, encryptedContent]);
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
    decryptEnvelope(encryptedPackage, encryptedDekBase64, dekIvBase64, authTagBase64) {
        const dekIv = Buffer.from(dekIvBase64, 'base64');
        const wrappedDek = Buffer.from(encryptedDekBase64, 'base64');
        const dekAuthTag = Buffer.from(authTagBase64, 'base64');
        const dekDecipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, dekIv);
        dekDecipher.setAuthTag(dekAuthTag);
        const dek = Buffer.concat([dekDecipher.update(wrappedDek), dekDecipher.final()]);
        const docIv = encryptedPackage.subarray(0, 12);
        const docAuthTag = encryptedPackage.subarray(12, 28);
        const ciphertext = encryptedPackage.subarray(28);
        const docDecipher = crypto.createDecipheriv('aes-256-gcm', dek, docIv);
        docDecipher.setAuthTag(docAuthTag);
        return Buffer.concat([docDecipher.update(ciphertext), docDecipher.final()]);
    }
    calculateAuditHash(previousHash, eventData) {
        const canonical = JSON.stringify(eventData, Object.keys(eventData).sort());
        return this.sha256(previousHash + canonical);
    }
    generateSecureToken(bytes = 32) {
        return crypto.randomBytes(bytes).toString('hex');
    }
};
exports.CryptoService = CryptoService;
exports.CryptoService = CryptoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CryptoService);
//# sourceMappingURL=crypto.service.js.map