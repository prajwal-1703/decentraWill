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
exports.ProofOfLifeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const exceptions_1 = require("../../common/exceptions");
let ProofOfLifeService = class ProofOfLifeService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async respondCheck(userId, estateId) {
        const cycle = await this.prisma.proofOfLifeCycle.findFirst({
            where: { estateId, testatorId: userId },
        });
        if (!cycle)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Proof-of-life cycle not found for estate');
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
    async getStatus(userId, estateId) {
        const cycle = await this.prisma.proofOfLifeCycle.findFirst({
            where: { estateId },
            include: { checks: { orderBy: { scheduledAt: 'desc' }, take: 10 } },
        });
        if (!cycle)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Proof-of-life not initialized');
        return cycle;
    }
    async simulateMissedCheck(estateId) {
        const cycle = await this.prisma.proofOfLifeCycle.findFirst({ where: { estateId } });
        if (!cycle)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Proof-of-life not found');
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
        if (escalated) {
            await this.audit.logSecurityEvent('HIGH', 'PROOF_OF_LIFE_ESCALATION_TRIGGERED', `Multiple missed proof-of-life checks for estate ${estateId}. Initiating participant verification inquiry.`, cycle.testatorId);
        }
        return updated;
    }
};
exports.ProofOfLifeService = ProofOfLifeService;
exports.ProofOfLifeService = ProofOfLifeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ProofOfLifeService);
//# sourceMappingURL=proof-of-life.service.js.map