import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private redisConnection: IORedis | null = null;
  private queues = new Map<string, Queue>();

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
    try {
      this.redisConnection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
      this.redisConnection.on('error', (err) => {
        this.logger.warn(`Redis connection error: ${err.message}. Jobs will run in fallback mode.`);
      });
    } catch (err: any) {
      this.logger.warn(`Failed to connect Redis: ${err.message}`);
    }
  }

  getQueue(name: string): Queue | null {
    if (!this.redisConnection) return null;
    if (!this.queues.has(name)) {
      this.queues.set(name, new Queue(name, { connection: this.redisConnection }));
    }
    return this.queues.get(name)!;
  }

  async addJob(queueName: string, jobName: string, data: any, opts?: any): Promise<void> {
    const queue = this.getQueue(queueName);
    if (queue) {
      await queue.add(jobName, data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 200,
        ...opts,
      });
    } else {
      this.logger.log(`Direct execution fallback for job ${queueName}:${jobName}`);
    }
  }

  async onModuleDestroy() {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    if (this.redisConnection) {
      await this.redisConnection.quit();
    }
  }
}
