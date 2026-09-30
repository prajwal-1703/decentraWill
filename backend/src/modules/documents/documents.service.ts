import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto.service';
import { StorageService } from './storage.service';
import { MalwareScannerService } from './malware-scanner.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, NotFoundException, DomainException } from '../../common/exceptions';
import { DocumentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly storage: StorageService,
    private readonly scanner: MalwareScannerService,
    private readonly audit: AuditService
  ) {}

  async uploadDocument(
    userId: string,
    estateId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    versionId?: string,
    ipAddress?: string,
    correlationId?: string
  ) {
    // 1. Verify user belongs to estate
    const membership = await this.prisma.estateMembership.findFirst({
      where: { estateId, userId, status: 'ACTIVE' },
    });
    if (!membership) {
      throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Cannot upload documents to an estate without membership');
    }

    // 2. Size validation (max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new DomainException('FILE_TOO_LARGE', 'Uploaded document exceeds maximum allowed size of 50MB');
    }

    // 3. Malware scanning
    const scan = await this.scanner.scan(file.buffer);
    if (!scan.isClean) {
      await this.audit.logSecurityEvent('HIGH', 'MALWARE_DETECTED', `File ${file.originalname} contained malware signature`, userId, ipAddress);
      throw new DomainException('DOCUMENT_QUARANTINED', `Document rejected by malware scanner: ${scan.threatDetails}`);
    }

    // 4. Calculate SHA-256 and Envelope Encrypt
    const { encryptedContent, encryptedDek, dekIv, authTag, sha256 } = this.crypto.encryptEnvelope(file.buffer);

    // 5. Generate random object key
    const objectKey = `doc_${uuidv4()}_${Date.now()}`;

    // 6. Put into storage provider
    await this.storage.putObject(objectKey, encryptedContent);

    // 7. Store metadata in PostgreSQL
    const doc = await this.prisma.document.create({
      data: {
        estateId,
        versionId,
        objectKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        status: DocumentStatus.AVAILABLE,
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

  async downloadDocument(userId: string, documentId: string, ipAddress?: string, correlationId?: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Document not found');

    // Authorization check: Must be member of estate or have explicit AccessGrant
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
      throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'You do not have authorization to download this document');
    }

    if (doc.isQuarantined || doc.status === DocumentStatus.QUARANTINED) {
      throw new ForbiddenException('DOCUMENT_QUARANTINED', 'This document is currently quarantined');
    }

    // Retrieve encrypted bytes from storage
    const encryptedBytes = await this.storage.getObject(doc.objectKey);

    // Decrypt envelope
    let decryptedBytes: Buffer;
    try {
      decryptedBytes = this.crypto.decryptEnvelope(encryptedBytes, doc.encryptedDek, doc.dekIv, doc.authTag || '');
    } catch (err: any) {
      throw new DomainException('DECRYPTION_FAILED', 'Failed to decrypt document bytes');
    }

    // Integrity check
    const currentSha256 = this.crypto.sha256(decryptedBytes);
    if (currentSha256 !== doc.sha256) {
      await this.audit.logSecurityEvent('CRITICAL', 'DOCUMENT_INTEGRITY_FAILED', `SHA-256 mismatch on document ${documentId}`, userId, ipAddress);
      throw new DomainException('DOCUMENT_INTEGRITY_FAILED', 'Document integrity check failed: content does not match recorded SHA-256 hash');
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

  async verifyDocumentIntegrity(documentId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Document not found');

    const encryptedBytes = await this.storage.getObject(doc.objectKey);

    let decrypted: Buffer;
    try {
      decrypted = this.crypto.decryptEnvelope(encryptedBytes, doc.encryptedDek, doc.dekIv, doc.authTag || '');
    } catch (err) {
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

  async corruptDocumentForTest(documentId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Document not found');
    await this.storage.corruptObjectForTest(doc.objectKey);
    return { success: true, message: 'Document object corrupted for testing' };
  }
}
