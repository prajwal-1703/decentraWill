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
var OutboxService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const queue_service_1 = require("./queue.service");
let OutboxService = OutboxService_1 = class OutboxService {
    constructor(prisma, queueService) {
        this.prisma = prisma;
        this.queueService = queueService;
        this.logger = new common_1.Logger(OutboxService_1.name);
    }
    async createEvent(tx, aggregateType, aggregateId, eventType, payload, correlationId) {
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
                if (event.aggregateType === 'WILL_VERSION' && event.eventType === 'FINALIZED') {
                    await this.queueService.addJob('blockchain-anchor', 'anchor-version', {
                        versionId: event.aggregateId,
                        ...event.payload,
                        correlationId: event.correlationId,
                    });
                }
                else if (event.aggregateType === 'DOCUMENT' && event.eventType === 'UPLOADED') {
                    await this.queueService.addJob('document-scan', 'scan-document', {
                        documentId: event.aggregateId,
                        correlationId: event.correlationId,
                    });
                }
                else if (event.aggregateType === 'NOTIFICATION') {
                    await this.queueService.addJob('notifications', 'send-notification', {
                        notificationId: event.aggregateId,
                        ...event.payload,
                        correlationId: event.correlationId,
                    });
                }
                await this.prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: { status: 'COMPLETED', processedAt: new Date() },
                });
            }
            catch (err) {
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
};
exports.OutboxService = OutboxService;
exports.OutboxService = OutboxService = OutboxService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService])
], OutboxService);
//# sourceMappingURL=outbox.service.js.map