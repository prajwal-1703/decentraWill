"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
let QueueService = QueueService_1 = class QueueService {
    constructor() {
        this.logger = new common_1.Logger(QueueService_1.name);
        this.redisConnection = null;
        this.queues = new Map();
    }
    onModuleInit() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
        try {
            this.redisConnection = new ioredis_1.default(redisUrl, { maxRetriesPerRequest: null });
            this.redisConnection.on('error', (err) => {
                this.logger.warn(`Redis connection error: ${err.message}. Jobs will run in fallback mode.`);
            });
        }
        catch (err) {
            this.logger.warn(`Failed to connect Redis: ${err.message}`);
        }
    }
    getQueue(name) {
        if (!this.redisConnection)
            return null;
        if (!this.queues.has(name)) {
            this.queues.set(name, new bullmq_1.Queue(name, { connection: this.redisConnection }));
        }
        return this.queues.get(name);
    }
    async addJob(queueName, jobName, data, opts) {
        const queue = this.getQueue(queueName);
        if (queue) {
            await queue.add(jobName, data, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: 100,
                removeOnFail: 200,
                ...opts,
            });
        }
        else {
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
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)()
], QueueService);
//# sourceMappingURL=queue.service.js.map