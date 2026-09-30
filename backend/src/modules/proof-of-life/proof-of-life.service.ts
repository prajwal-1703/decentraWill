import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, NotFoundException } from '../../common/exceptions';

@Injectable()
export class ProofOfLifeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async respondCheck(userId: string, estateId: string) {
    const cycle = await this.prisma.proofOfLifeCycle.findFirst({
      where: { estateId, testatorId: userId },
    });
    if (!cycle) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Proof-of-life cycle not found for estate');

    const nextCheck = new Date(Date.now() + cycle.intervalDays * 24 * 60 * 60 * 1000);

    const updated = await this.prisma.proofOfLifeCycle.update({
      where: { id: cycle.id },
      data: {
        lastCheckAt: new Date(),
        nextCheckAt: nextCheck,
        missedChecksCount: 0,
        status: 'ACTIVE',
        escalated: false,
      },
    });

    await this.prisma.proofOfLifeCheck.create({
      data: {
        cycleId: cycle.id,
        scheduledAt: cycle.nextCheckAt,
        respondedAt: new Date(),
        status: 'CONFIRMED',
      },
    });

    await this.audit.logEvent({
      actorId: userId,
      estateId,
      eventType: 'PROOF_OF_LIFE_CONFIRMED',
      resourceType: 'PROOF_OF_LIFE',
      resourceId: cycle.id,
      metadata: { nextCheckAt: nextCheck },
    });

    return updated;
  }

  async getStatus(userId: string, estateId: string) {
    const cycle = await this.prisma.proofOfLifeCycle.findFirst({
      where: { estateId },
      include: { checks: { orderBy: { scheduledAt: 'desc' }, take: 10 } },
    });
    if (!cycle) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Proof-of-life not initialized');
    return cycle;
  }

  async simulateMissedCheck(estateId: string) {
    const cycle = await this.prisma.proofOfLifeCycle.findFirst({ where: { estateId } });
    if (!cycle) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Proof-of-life not found');

    const missedCount = cycle.missedChecksCount + 1;
    const escalated = missedCount >= 2;

    const updated = await this.prisma.proofOfLifeCycle.update({
      where: { id: cycle.id },
      data: {
        missedChecksCount: missedCount,
        status: escalated ? 'ESCALATED' : 'MISSED',
        escalated,
      },
    });

    await this.prisma.proofOfLifeCheck.create({
      data: {
        cycleId: cycle.id,
        scheduledAt: new Date(),
        status: 'MISSED',
      },
    });

    await this.audit.logEvent({
      estateId,
      eventType: escalated ? 'PROOF_OF_LIFE_ESCALATED' : 'PROOF_OF_LIFE_MISSED',
      resourceType: 'PROOF_OF_LIFE',
      resourceId: cycle.id,
      metadata: { missedChecksCount: missedCount, escalated },
    });

    // If escalated, open an inquiry task / notification for Advocate and Executor
    if (escalated) {
      await this.audit.logSecurityEvent(
        'HIGH',
        'PROOF_OF_LIFE_ESCALATION_TRIGGERED',
        `Multiple missed proof-of-life checks for estate ${estateId}. Initiating participant verification inquiry.`,
        cycle.testatorId
      );
    }

    return updated;
  }
}
