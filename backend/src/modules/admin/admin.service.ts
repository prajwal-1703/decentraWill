import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly blockchain: BlockchainService,
    private readonly documents: DocumentsService
  ) {}

  async getHealthStatus() {
    let dbStatus = 'DOWN';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'UP';
    } catch {
      dbStatus = 'DOWN';
    }

    return {
      status: dbStatus === 'UP' ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        storage: 'UP',
        redis: 'UP',
        blockchain: 'UP',
      },
    };
  }

  async verifyAuditChain() {
    return this.audit.verifyChain();
  }

  async getSecurityEvents(limit: number = 50) {
    return this.prisma.securityEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async reconcileBlockchain() {
    return this.blockchain.reconcile();
  }

  async exceptionalDocumentAccess(adminUserId: string, documentId: string, reason: string, ipAddress?: string) {
    // Exceptional access is ALWAYS audited with reason, actor, timestamp, and target
    await this.audit.logEvent({
      actorId: adminUserId,
      eventType: 'ADMIN_EXCEPTIONAL_DOCUMENT_ACCESS',
      resourceType: 'DOCUMENT',
      resourceId: documentId,
      metadata: { reason },
      ipAddress,
    });

    return this.documents.downloadDocument(adminUserId, documentId, ipAddress);
  }
}
