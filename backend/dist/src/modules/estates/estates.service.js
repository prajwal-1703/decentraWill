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
exports.EstatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const crypto_service_1 = require("../../common/crypto.service");
const audit_service_1 = require("../audit/audit.service");
const exceptions_1 = require("../../common/exceptions");
const client_1 = require("@prisma/client");
let EstatesService = class EstatesService {
    constructor(prisma, crypto, audit) {
        this.prisma = prisma;
        this.crypto = crypto;
        this.audit = audit;
    }
    async createEstate(userId, dto) {
        const estate = await this.prisma.$transaction(async (tx) => {
            const est = await tx.estate.create({
                data: {
                    name: dto.name,
                    description: dto.description,
                    ownerId: userId,
                },
            });
            await tx.estateMembership.create({
                data: {
                    estateId: est.id,
                    userId,
                    role: client_1.RoleType.TESTATOR,
                    status: 'ACTIVE',
                },
            });
            await tx.workflowPolicy.create({
                data: {
                    estateId: est.id,
                    requiredAdvocate: true,
                    requiredWitnesses: 2,
                    quorum: 2,
                    threshold: 2,
                    gracePeriodDays: 30,
                    proofOfLifeDays: 90,
                    reminderEveryDays: 7,
                    eligibleRoles: ['ADVOCATE', 'EXECUTOR', 'BENEFICIARY'],
                },
            });
            await tx.proofOfLifeCycle.create({
                data: {
                    estateId: est.id,
                    testatorId: userId,
                    nextCheckAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                },
            });
            return est;
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId: estate.id,
            eventType: 'ESTATE_CREATED',
            resourceType: 'ESTATE',
            resourceId: estate.id,
        });
        return estate;
    }
    async getEstate(userId, estateId) {
        const membership = await this.prisma.estateMembership.findFirst({
            where: { estateId, userId, status: 'ACTIVE' },
        });
        if (!membership) {
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'You do not have active membership in this estate');
        }
        const estate = await this.prisma.estate.findUnique({
            where: { id: estateId },
            include: {
                memberships: {
                    include: {
                        user: {
                            select: { id: true, email: true, profile: { select: { fullName: true } } },
                        },
                    },
                },
                policies: { where: { isActive: true } },
                wills: { include: { versions: { orderBy: { versionNo: 'desc' } } } },
            },
        });
        if (!estate)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Estate not found');
        return estate;
    }
    async listUserEstates(userId) {
        const memberships = await this.prisma.estateMembership.findMany({
            where: { userId, status: 'ACTIVE' },
            include: {
                estate: {
                    include: {
                        wills: {
                            include: {
                                versions: {
                                    orderBy: { versionNo: 'desc' },
                                },
                            },
                        },
                        memberships: {
                            include: {
                                user: {
                                    select: { id: true, email: true, profile: { select: { fullName: true } } },
                                },
                            },
                        },
                    },
                },
            },
        });
        return memberships.map((m) => ({
            estate: m.estate,
            role: m.role,
            joinedAt: m.joinedAt,
        }));
    }
    async inviteParticipant(userId, estateId, dto) {
        const membership = await this.prisma.estateMembership.findFirst({
            where: {
                estateId,
                userId,
                status: 'ACTIVE',
                role: { in: [client_1.RoleType.TESTATOR, client_1.RoleType.ADVOCATE, client_1.RoleType.ADMIN] },
            },
        });
        if (!membership) {
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Only Testator or Advocate can invite participants');
        }
        const targetUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (targetUser) {
            if (dto.role === client_1.RoleType.WITNESS) {
                const isAdvocate = await this.prisma.estateMembership.findFirst({
                    where: { estateId, userId: targetUser.id, role: client_1.RoleType.ADVOCATE, status: 'ACTIVE' },
                });
                if (isAdvocate) {
                    throw new exceptions_1.ConflictException('CONFLICT_OF_INTEREST', 'A legal advocate cannot also be assigned as a witness on the same will contract');
                }
            }
            if (dto.role === client_1.RoleType.ADVOCATE) {
                const isWitness = await this.prisma.estateMembership.findFirst({
                    where: { estateId, userId: targetUser.id, role: client_1.RoleType.WITNESS, status: 'ACTIVE' },
                });
                if (isWitness) {
                    throw new exceptions_1.ConflictException('CONFLICT_OF_INTEREST', 'An attesting witness cannot also be assigned as an advocate on the same will contract');
                }
            }
        }
        const rawToken = this.crypto.generateSecureToken(32);
        const tokenHash = this.crypto.sha256(rawToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const invitation = await this.prisma.participantInvitation.create({
            data: {
                estateId,
                email: dto.email,
                role: dto.role,
                tokenHash,
                expiresAt,
                invitedBy: userId,
            },
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId,
            eventType: 'PARTICIPANT_INVITED',
            resourceType: 'INVITATION',
            resourceId: invitation.id,
            metadata: { email: dto.email, role: dto.role },
        });
        return {
            invitationId: invitation.id,
            email: invitation.email,
            role: invitation.role,
            invitationToken: rawToken,
            expiresAt: invitation.expiresAt,
        };
    }
    async acceptInvitation(userId, rawToken) {
        const tokenHash = this.crypto.sha256(rawToken);
        const invitation = await this.prisma.participantInvitation.findUnique({
            where: { tokenHash },
        });
        if (!invitation) {
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Invalid invitation token');
        }
        if (invitation.isAccepted) {
            throw new exceptions_1.ConflictException('INVITATION_ALREADY_ACCEPTED', 'This invitation has already been accepted');
        }
        if (invitation.expiresAt < new Date()) {
            throw new exceptions_1.ForbiddenException('INVITATION_EXPIRED', 'This invitation has expired');
        }
        if (invitation.role === client_1.RoleType.WITNESS) {
            const existingAdvocate = await this.prisma.estateMembership.findFirst({
                where: { estateId: invitation.estateId, userId, role: client_1.RoleType.ADVOCATE, status: 'ACTIVE' },
            });
            if (existingAdvocate) {
                throw new exceptions_1.ConflictException('CONFLICT_OF_INTEREST', 'An advocate on this contract cannot also accept an appointment as a witness on the same will');
            }
        }
        if (invitation.role === client_1.RoleType.ADVOCATE) {
            const existingWitness = await this.prisma.estateMembership.findFirst({
                where: { estateId: invitation.estateId, userId, role: client_1.RoleType.WITNESS, status: 'ACTIVE' },
            });
            if (existingWitness) {
                throw new exceptions_1.ConflictException('CONFLICT_OF_INTEREST', 'An existing witness on this contract cannot also accept an appointment as an advocate on the same will');
            }
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.estateMembership.upsert({
                where: {
                    estateId_userId_role: {
                        estateId: invitation.estateId,
                        userId,
                        role: invitation.role,
                    },
                },
                update: { status: 'ACTIVE' },
                create: {
                    estateId: invitation.estateId,
                    userId,
                    role: invitation.role,
                    status: 'ACTIVE',
                },
            });
            await tx.participantInvitation.update({
                where: { id: invitation.id },
                data: {
                    isAccepted: true,
                    acceptedAt: new Date(),
                    acceptedBy: userId,
                },
            });
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId: invitation.estateId,
            eventType: 'INVITATION_ACCEPTED',
            resourceType: 'ESTATE',
            resourceId: invitation.estateId,
            metadata: { role: invitation.role },
        });
        return { success: true, estateId: invitation.estateId, role: invitation.role };
    }
    async revokeMembership(requesterId, estateId, membershipId) {
        const requester = await this.prisma.estateMembership.findFirst({
            where: { estateId, userId: requesterId, role: client_1.RoleType.TESTATOR, status: 'ACTIVE' },
        });
        if (!requester) {
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Only Testator can revoke memberships');
        }
        const target = await this.prisma.estateMembership.update({
            where: { id: membershipId },
            data: { status: 'REVOKED' },
        });
        await this.audit.logEvent({
            actorId: requesterId,
            estateId,
            eventType: 'PARTICIPANT_REVOKED',
            resourceType: 'MEMBERSHIP',
            resourceId: target.id,
            metadata: { revokedUserId: target.userId, role: target.role },
        });
        return { success: true, status: 'REVOKED' };
    }
};
exports.EstatesService = EstatesService;
exports.EstatesService = EstatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService,
        audit_service_1.AuditService])
], EstatesService);
//# sourceMappingURL=estates.service.js.map