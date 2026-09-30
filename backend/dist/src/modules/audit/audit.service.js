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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const crypto_service_1 = require("../../common/crypto.service");
let AuditService = class AuditService {
    constructor(prisma, crypto) {
        this.prisma = prisma;
        this.crypto = crypto;
    }
    async logEvent(dto) {
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
    async logSecurityEvent(severity, eventType, description, userId, ipAddress, metadata) {
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
    async verifyChain() {
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
    async getEstateAuditTrail(estateId, limit = 50, cursor) {
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
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService])
], AuditService);
//# sourceMappingURL=audit.service.js.map