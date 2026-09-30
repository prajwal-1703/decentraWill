import { PrismaService } from '../database/prisma.service';
import { QueueService } from './queue.service';
import { Prisma } from '@prisma/client';
export declare class OutboxService {
    private readonly prisma;
    private readonly queueService;
    private readonly logger;
    constructor(prisma: PrismaService, queueService: QueueService);
    createEvent(tx: Prisma.TransactionClient | PrismaService, aggregateType: string, aggregateId: string, eventType: string, payload: any, correlationId?: string): Promise<{
        id: string;
        eventType: string;
        correlationId: string | null;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OutboxStatus;
        aggregateType: string;
        aggregateId: string;
        payload: Prisma.JsonValue;
        retryCount: number;
        processedAt: Date | null;
    }>;
    processPendingEvents(): Promise<void>;
}
