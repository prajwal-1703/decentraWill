import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto.service';
import { SecuritySeverity } from '@prisma/client';

export interface CreateAuditDto {
  estateId?: string;
  actorId?: string;
  eventType: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  correlationId?: string;
}

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService
  ) {}

  async logEvent(dto: CreateAuditDto) {
    // 1. Fetch latest audit event to get previousHash
    const lastEvent = await this.prisma.auditEvent.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { currentHash: true },
    });

    const previousHash = lastEvent?.currentHash || '0000000000000000000000000000000000000000000000000000000000000000';

    const eventPayload = {
      estateId: dto.estateId || null,
      actorId: dto.actorId || null,
      eventType: dto.eventType,
      resourceType: dto.resourceType,
      resourceId: dto.resourceId,
      metadata: dto.metadata || {},
      correlationId: dto.correlationId || null,
      timestamp: new Date().toISOString(),
    };

    const currentHash = this.crypto.calculateAuditHash(previousHash, eventPayload);

    return this.prisma.auditEvent.create({
      data: {
        estateId: dto.estateId,
        actorId: dto.actorId,
        eventType: dto.eventType,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        metadata: dto.metadata || {},
        previousHash,
        currentHash,
        ipAddress: dto.ipAddress,
        correlationId: dto.correlationId,
      },
    });
  }

  async logSecurityEvent(
    severity: SecuritySeverity,
    eventType: string,
    description: string,
    userId?: string,
    ipAddress?: string,
    metadata?: Record<string, any>
  ) {
    return this.prisma.securityEvent.create({
      data: {
        severity,
        eventType,
        description,
        userId,
        ipAddress,
        metadata: metadata || {},
      },
    });
  }

  async verifyChain(): Promise<{ valid: boolean; verifiedCount: number; brokenEventId?: string }> {
    const events = await this.prisma.auditEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (const evt of events) {
      if (evt.previousHash !== previousHash) {
        return { valid: false, verifiedCount: events.indexOf(evt), brokenEventId: evt.id };
      }
      previousHash = evt.currentHash;
    }

    return { valid: true, verifiedCount: events.length };
  }

  async getEstateAuditTrail(estateId: string, limit: number = 50, cursor?: string) {
    return this.prisma.auditEvent.findMany({
      where: { estateId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: { id: true, email: true },
        },
      },
    });
  }
}
