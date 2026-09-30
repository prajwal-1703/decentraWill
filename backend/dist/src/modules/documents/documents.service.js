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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const crypto_service_1 = require("../../common/crypto.service");
const storage_service_1 = require("./storage.service");
const malware_scanner_service_1 = require("./malware-scanner.service");
const audit_service_1 = require("../audit/audit.service");
const exceptions_1 = require("../../common/exceptions");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
let DocumentsService = class DocumentsService {
    constructor(prisma, crypto, storage, scanner, audit) {
        this.prisma = prisma;
        this.crypto = crypto;
        this.storage = storage;
        this.scanner = scanner;
        this.audit = audit;
    }
    async uploadDocument(userId, estateId, file, versionId, ipAddress, correlationId) {
        const membership = await this.prisma.estateMembership.findFirst({
            where: { estateId, userId, status: 'ACTIVE' },
        });
        if (!membership) {
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Cannot upload documents to an estate without membership');
        }
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            throw new exceptions_1.DomainException('FILE_TOO_LARGE', 'Uploaded document exceeds maximum allowed size of 50MB');
        }
        const scan = await this.scanner.scan(file.buffer);
        if (!scan.isClean) {
            await this.audit.logSecurityEvent('HIGH', 'MALWARE_DETECTED', `File ${file.originalname} contained malware signature`, userId, ipAddress);
            throw new exceptions_1.DomainException('DOCUMENT_QUARANTINED', `Document rejected by malware scanner: ${scan.threatDetails}`);
        }
        const { encryptedContent, encryptedDek, dekIv, authTag, sha256 } = this.crypto.encryptEnvelope(file.buffer);
        const objectKey = `doc_${(0, uuid_1.v4)()}_${Date.now()}`;
        await this.storage.putObject(objectKey, encryptedContent);
        const doc = await this.prisma.document.create({
            data: {
                estateId,
                versionId,
                objectKey,
                originalName: file.originalname,
                mimeType: file.mimetype,
                sizeBytes: file.size,
                status: client_1.DocumentStatus.AVAILABLE,
                sha256,
                encryptedDek,
                dekIv,
                authTag,
                isQuarantined: false,
                scanResult: 'CLEAN',
                uploadedBy: userId,
            },
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId,
            eventType: 'DOCUMENT_UPLOADED',
            resourceType: 'DOCUMENT',
            resourceId: doc.id,
            metadata: { originalName: doc.originalName, sha256: doc.sha256, sizeBytes: doc.sizeBytes },
            ipAddress,
            correlationId,
        });
        return doc;
    }
    async downloadDocument(userId, documentId, ipAddress, correlationId) {
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!doc)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Document not found');
        const membership = await this.prisma.estateMembership.findFirst({
            where: { estateId: doc.estateId, userId, status: 'ACTIVE' },
        });
        const activeGrant = await this.prisma.accessGrant.findFirst({
            where: {
                estateId: doc.estateId,
                userId,
                resourceType: 'DOCUMENT',
                resourceId: documentId,
                status: 'ACTIVE',
                expiresAt: { gt: new Date() },
            },
        });
        if (!membership && !activeGrant) {
            await this.audit.logSecurityEvent('MEDIUM', 'UNAUTHORIZED_DOWNLOAD_ATTEMPT', `User ${userId} attempted download of ${documentId}`, userId, ipAddress);
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'You do not have authorization to download this document');
        }
        if (doc.isQuarantined || doc.status === client_1.DocumentStatus.QUARANTINED) {
            throw new exceptions_1.ForbiddenException('DOCUMENT_QUARANTINED', 'This document is currently quarantined');
        }
        const encryptedBytes = await this.storage.getObject(doc.objectKey);
        let decryptedBytes;
        try {
            decryptedBytes = this.crypto.decryptEnvelope(encryptedBytes, doc.encryptedDek, doc.dekIv, doc.authTag || '');
        }
        catch (err) {
            throw new exceptions_1.DomainException('DECRYPTION_FAILED', 'Failed to decrypt document bytes');
        }
        const currentSha256 = this.crypto.sha256(decryptedBytes);
        if (currentSha256 !== doc.sha256) {
            await this.audit.logSecurityEvent('CRITICAL', 'DOCUMENT_INTEGRITY_FAILED', `SHA-256 mismatch on document ${documentId}`, userId, ipAddress);
            throw new exceptions_1.DomainException('DOCUMENT_INTEGRITY_FAILED', 'Document integrity check failed: content does not match recorded SHA-256 hash');
        }
        await this.audit.logEvent({
            actorId: userId,
            estateId: doc.estateId,
            eventType: 'DOCUMENT_DOWNLOADED',
            resourceType: 'DOCUMENT',
            resourceId: doc.id,
            ipAddress,
            correlationId,
        });
        return {
            buffer: decryptedBytes,
            fileName: doc.originalName,
            mimeType: doc.mimeType,
            sha256: doc.sha256,
        };
    }
    async verifyDocumentIntegrity(documentId) {
        const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
        if (!doc)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Document not found');
        const encryptedBytes = await this.storage.getObject(doc.objectKey);
        let decrypted;
        try {
            decrypted = this.crypto.decryptEnvelope(encryptedBytes, doc.encryptedDek, doc.dekIv, doc.authTag || '');
        }
        catch (err) {
            return {
                documentId,
                verified: false,
                reason: 'Decryption failed - ciphertext or authentication tag corrupted',
                recordedSha256: doc.sha256,
                actualSha256: null,
            };
        }
        const actualSha256 = this.crypto.sha256(decrypted);
        const matches = actualSha256 === doc.sha256;
        return {
            documentId,
            verified: matches,
            recordedSha256: doc.sha256,
            actualSha256,
            reason: matches ? 'Integrity verified' : 'SHA-256 mismatch detected',
        };
    }
    async corruptDocumentForTest(documentId) {
        const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
        if (!doc)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Document not found');
        await this.storage.corruptObjectForTest(doc.objectKey);
        return { success: true, message: 'Document object corrupted for testing' };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService,
        storage_service_1.StorageService,
        malware_scanner_service_1.MalwareScannerService,
        audit_service_1.AuditService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map