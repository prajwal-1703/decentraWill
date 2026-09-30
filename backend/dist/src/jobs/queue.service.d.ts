import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
export declare class QueueService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private redisConnection;
    private queues;
    onModuleInit(): void;
    getQueue(name: string): Queue | null;
    addJob(queueName: string, jobName: string, data: any, opts?: any): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
