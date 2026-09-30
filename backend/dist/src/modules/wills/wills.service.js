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
exports.WillsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const crypto_service_1 = require("../../common/crypto.service");
const audit_service_1 = require("../audit/audit.service");
const outbox_service_1 = require("../../jobs/outbox.service");
const exceptions_1 = require("../../common/exceptions");
const client_1 = require("@prisma/client");
let WillsService = class WillsService {
    constructor(prisma, crypto, audit, outbox) {
        this.prisma = prisma;
        this.crypto = crypto;
        this.audit = audit;
        this.outbox = outbox;
    }
    async createWill(userId, dto) {
        const membership = await this.prisma.estateMembership.findFirst({
            where: {
                estateId: dto.estateId,
                userId,
                status: 'ACTIVE',
                role: { in: [client_1.RoleType.TESTATOR, client_1.RoleType.ADVOCATE, client_1.RoleType.ADMIN] },
            },
        });
        if (!membership) {
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Only Testator or Advocate can create a will in this estate');
        }
        const will = await this.prisma.$transaction(async (tx) => {
            const w = await tx.will.create({
                data: {
                    estateId: dto.estateId,
                    title: dto.title,
                    mode: dto.mode || 'TESTATOR_LED',
                    status: client_1.WillStatus.DRAFT,
                },
            });
            await tx.willVersion.create({
                data: {
                    willId: w.id,
                    estateId: dto.estateId,
                    versionNo: 1,
                    status: client_1.WillStatus.DRAFT,
                },
            });
            return w;
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId: dto.estateId,
            eventType: 'WILL_CREATED',
            resourceType: 'WILL',
            resourceId: will.id,
            metadata: { title: will.title },
        });
        return will;
    }
    async createVersion(userId, willId, dto) {
        const will = await this.prisma.will.findUnique({ where: { id: willId } });
        if (!will)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Will not found');
        const membership = await this.prisma.estateMembership.findFirst({
            where: {
                estateId: will.estateId,
                userId,
                status: 'ACTIVE',
                role: { in: [client_1.RoleType.TESTATOR, client_1.RoleType.ADVOCATE, client_1.RoleType.ADMIN] },
            },
        });
        if (!membership)
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to create will version');
        const latest = await this.prisma.willVersion.findFirst({
            where: { estateId: will.estateId },
            orderBy: { versionNo: 'desc' },
        });
        const nextVersionNo = (latest?.versionNo || 0) + 1;
        const version = await this.prisma.$transaction(async (tx) => {
            const v = await tx.willVersion.create({
                data: {
                    willId,
                    estateId: will.estateId,
                    versionNo: nextVersionNo,
                    status: client_1.WillStatus.DRAFT,
                    documentId: dto.documentId,
                },
            });
            if (dto.clauses && dto.clauses.length > 0) {
                for (const c of dto.clauses) {
                    await tx.willClause.create({
                        data: {
                            versionId: v.id,
                            clauseNo: c.clauseNo,
                            title: c.title,
                            content: c.content,
                            metadata: c.metadata,
                        },
                    });
                }
            }
            return v;
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId: will.estateId,
            eventType: 'VERSION_CREATED',
            resourceType: 'WILL_VERSION',
            resourceId: version.id,
            metadata: { versionNo: version.versionNo },
        });
        return version;
    }
    async addClause(userId, versionId, dto) {
        const version = await this.prisma.willVersion.findUnique({ where: { id: versionId } });
        if (!version)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Will version not found');
        if (version.status !== client_1.WillStatus.DRAFT && version.status !== client_1.WillStatus.VERIFICATION_PENDING) {
            throw new exceptions_1.ConflictException('WILL_FINALIZED', 'Finalized will versions cannot be modified');
        }
        return this.prisma.willClause.create({
            data: {
                versionId,
                clauseNo: dto.clauseNo,
                title: dto.title,
                content: dto.content,
                metadata: dto.metadata,
            },
        });
    }
    async getVersion(userId, versionId) {
        const version = await this.prisma.willVersion.findUnique({
            where: { id: versionId },
            include: {
                will: true,
                clauses: { orderBy: { clauseNo: 'asc' } },
                documents: true,
                attestations: { include: { user: { select: { id: true, email: true, profile: true } } } },
                blockchainAnchors: true,
            },
        });
        if (!version)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Will version not found');
        const membership = await this.prisma.estateMembership.findFirst({
            where: { estateId: version.estateId, userId, status: 'ACTIVE' },
        });
        if (!membership) {
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to view this will version');
        }
        return version;
    }
    async finalizeVersion(userId, versionId, dto, idempotencyKey, correlationId) {
        const version = await this.prisma.willVersion.findUnique({
            where: { id: versionId },
            include: {
                clauses: true,
                documents: true,
                attestations: true,
            },
        });
        if (!version)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Will version not found');
        if (version.status === client_1.WillStatus.FINALIZED || version.status === client_1.WillStatus.ACTIVE) {
            throw new exceptions_1.ConflictException('VERSION_ALREADY_FINALIZED', 'This version is already finalized and immutable');
        }
        const membership = await this.prisma.estateMembership.findFirst({
            where: {
                estateId: version.estateId,
                userId,
                status: 'ACTIVE',
                role: { in: [client_1.RoleType.TESTATOR, client_1.RoleType.ADMIN] },
            },
        });
        if (!membership) {
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Only the Testator can finalize a will version');
        }
        const policy = await this.prisma.workflowPolicy.findFirst({
            where: { estateId: version.estateId, isActive: true },
        });
        if (policy) {
            if (policy.requiredAdvocate) {
                const hasAdvocate = version.attestations.some((a) => a.role === client_1.RoleType.ADVOCATE && a.status === 'ACCEPTED');
                if (!hasAdvocate) {
                    throw new exceptions_1.DomainException('ATTESTATION_REQUIRED', 'Policy requires accepted advocate attestation before finalization');
                }
            }
            const testatorMembership = await this.prisma.estateMembership.findFirst({
                where: { estateId: version.estateId, role: client_1.RoleType.TESTATOR, status: 'ACTIVE' },
            });
            if (testatorMembership) {
                const isTestatorAlsoAdvocate = await this.prisma.estateMembership.findFirst({
                    where: {
                        estateId: version.estateId,
                        userId: testatorMembership.userId,
                        role: client_1.RoleType.ADVOCATE,
                        status: 'ACTIVE',
                    },
                });
                if (isTestatorAlsoAdvocate) {
                    const independentAdvocate = version.attestations.find((a) => a.role === client_1.RoleType.ADVOCATE && a.status === 'ACCEPTED' && a.userId !== testatorMembership.userId);
                    if (!independentAdvocate) {
                        throw new exceptions_1.DomainException('INDEPENDENT_CO_ADVOCATE_REQUIRED', 'When the testator acts as advocate for their own will, at least one additional independent co-advocate attestation is legally required before finalization');
                    }
                }
            }
            const advocateUserIds = version.attestations
                .filter((a) => a.role === client_1.RoleType.ADVOCATE && a.status === 'ACCEPTED')
                .map((a) => a.userId);
            const witnessUserIds = version.attestations
                .filter((a) => a.role === client_1.RoleType.WITNESS && a.status === 'ACCEPTED')
                .map((a) => a.userId);
            const dualRoleUser = advocateUserIds.find((id) => witnessUserIds.includes(id));
            if (dualRoleUser) {
                throw new exceptions_1.DomainException('CONFLICT_OF_INTEREST', 'An individual cannot serve as both advocate and witness on the same will contract');
            }
            if (policy.requiredWitnesses > 0) {
                const witnessCount = version.attestations.filter((a) => a.role === client_1.RoleType.WITNESS && a.status === 'ACCEPTED').length;
                if (witnessCount < policy.requiredWitnesses) {
                    throw new exceptions_1.DomainException('ATTESTATION_REQUIRED', `Policy requires at least ${policy.requiredWitnesses} accepted witness attestations (found ${witnessCount})`);
                }
            }
        }
        const payloadToHash = {
            estateId: version.estateId,
            willId: version.willId,
            versionNo: version.versionNo,
            clauses: version.clauses.map((c) => ({ no: c.clauseNo, title: c.title, content: c.content })),
            documents: version.documents.map((d) => ({ id: d.id, sha256: d.sha256 })),
            attestations: version.attestations.map((a) => ({ userId: a.userId, role: a.role, type: a.type })),
        };
        const sha256 = this.crypto.sha256(JSON.stringify(payloadToHash));
        try {
            const finalized = await this.prisma.$transaction(async (tx) => {
                await tx.willVersion.updateMany({
                    where: { estateId: version.estateId, status: client_1.WillStatus.ACTIVE },
                    data: { status: client_1.WillStatus.SUPERSEDED },
                });
                const updatedVersion = await tx.willVersion.update({
                    where: { id: versionId },
                    data: {
                        status: client_1.WillStatus.ACTIVE,
                        sha256,
                        finalizedAt: new Date(),
                    },
                });
                await tx.will.update({
                    where: { id: version.willId },
                    data: { status: client_1.WillStatus.ACTIVE },
                });
                await tx.blockchainAnchor.create({
                    data: {
                        estateId: version.estateId,
                        versionId: version.id,
                        anchorType: 'WILL_FINALIZATION',
                        status: client_1.BlockchainStatus.PENDING,
                        documentHash: sha256,
                        versionRef: `v${version.versionNo}`,
                    },
                });
                await this.outbox.createEvent(tx, 'WILL_VERSION', version.id, 'FINALIZED', {
                    estateId: version.estateId,
                    versionNo: version.versionNo,
                    sha256,
                }, correlationId);
                return updatedVersion;
            });
            await this.audit.logEvent({
                actorId: userId,
                estateId: version.estateId,
                eventType: 'VERSION_FINALIZED',
                resourceType: 'WILL_VERSION',
                resourceId: finalized.id,
                metadata: { versionNo: finalized.versionNo, sha256 },
                correlationId,
            });
            return {
                versionId: finalized.id,
                status: finalized.status,
                sha256: finalized.sha256,
                blockchainAnchorStatus: client_1.BlockchainStatus.PENDING,
                correlationId: correlationId || `req_${Date.now()}`,
            };
        }
        catch (err) {
            if (err.code === 'P2002' || err.message?.includes('unique')) {
                throw new exceptions_1.ConflictException('ACTIVE_VERSION_EXISTS', 'A conflicting active will version already exists');
            }
            throw err;
        }
    }
    async getBlockchainProof(versionId) {
        const anchor = await this.prisma.blockchainAnchor.findFirst({
            where: { versionId, anchorType: 'WILL_FINALIZATION' },
        });
        if (!anchor) {
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'No blockchain anchor found for this version');
        }
        return anchor;
    }
};
exports.WillsService = WillsService;
exports.WillsService = WillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService])
], WillsService);
//# sourceMappingURL=wills.service.js.map