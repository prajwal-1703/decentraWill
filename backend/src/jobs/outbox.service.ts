import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { QueueService } from './queue.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService
  ) {}

  /**
   * Appends an outbox event within a transaction (or standalone)
   */
  async createEvent(
    tx: Prisma.TransactionClient | PrismaService,
    aggregateType: string,
    aggregateId: string,
    eventType: string,
    payload: any,
    correlationId?: string
  ) {
    return tx.outboxEvent.create({
      data: {
        aggregateType,
        aggregateId,
        eventType,
        payload,
        correlationId,
        status: 'PENDING',
      },
    });
  }

  /**
   * Process pending outbox events and dispatch them to BullMQ
   */
  async processPendingEvents() {
    const events = await this.prisma.outboxEvent.findMany({
      where: { status: 'PENDING' },
      take: 50,
      orderBy: { createdAt: 'asc' },
    });

    for (const event of events) {
      try {
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'PROCESSING' },
        });

        // Route to queue based on aggregateType / eventType
        if (event.aggregateType === 'WILL_VERSION' && event.eventType === 'FINALIZED') {
          await this.queueService.addJob('blockchain-anchor', 'anchor-version', {
            versionId: event.aggregateId,
            ...(event.payload as any),
            correlationId: event.correlationId,
          });
        } else if (event.aggregateType === 'DOCUMENT' && event.eventType === 'UPLOADED') {
          await this.queueService.addJob('document-scan', 'scan-document', {
            documentId: event.aggregateId,
            correlationId: event.correlationId,
          });
        } else if (event.aggregateType === 'NOTIFICATION') {
          await this.queueService.addJob('notifications', 'send-notification', {
            notificationId: event.aggregateId,
            ...(event.payload as any),
            correlationId: event.correlationId,
          });
        }

        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'COMPLETED', processedAt: new Date() },
        });
      } catch (err: any) {
        this.logger.error(`Error processing outbox event ${event.id}: ${err.message}`);
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: 'FAILED',
            retryCount: { increment: 1 },
          },
        });
      }
    }
  }
}
