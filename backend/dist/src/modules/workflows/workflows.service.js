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
exports.WorkflowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const exceptions_1 = require("../../common/exceptions");
const client_1 = require("@prisma/client");
let WorkflowsService = class WorkflowsService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async triggerWorkflow(userId, estateId, type, metadata) {
        const membership = await this.prisma.estateMembership.findFirst({
            where: { estateId, userId, status: 'ACTIVE' },
        });
        if (!membership)
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to trigger workflow');
        const policy = await this.prisma.workflowPolicy.findFirst({
            where: { estateId, isActive: true },
        });
        const instance = await this.prisma.workflowInstance.create({
            data: {
                estateId,
                type,
                state: 'ACTIVE',
                metadata: metadata || {},
                tasks: {
                    create: [
                        {
                            title: 'Advocate Verification & Review',
                            type: 'ADVOCATE_REVIEW',
                            assignedRole: client_1.RoleType.ADVOCATE,
                            status: client_1.TaskStatus.PENDING,
                        },
                        {
                            title: 'Executor Activation Acknowledgment',
                            type: 'EXECUTOR_ACKNOWLEDGMENT',
                            assignedRole: client_1.RoleType.EXECUTOR,
                            status: client_1.TaskStatus.PENDING,
                        },
                    ],
                },
            },
            include: { tasks: true },
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId,
            eventType: 'WORKFLOW_STARTED',
            resourceType: 'WORKFLOW',
            resourceId: instance.id,
            metadata: { type },
        });
        return instance;
    }
    async getWorkflow(userId, workflowId) {
        const instance = await this.prisma.workflowInstance.findUnique({
            where: { id: workflowId },
            include: { tasks: true, estate: true },
        });
        if (!instance)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Workflow instance not found');
        const membership = await this.prisma.estateMembership.findFirst({
            where: { estateId: instance.estateId, userId, status: 'ACTIVE' },
        });
        if (!membership)
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to view workflow');
        return instance;
    }
    async approveTask(userId, taskId, actionDetails) {
        const task = await this.prisma.workflowTask.findUnique({
            where: { id: taskId },
            include: { workflowInstance: true },
        });
        if (!task)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Task not found');
        if (task.status === client_1.TaskStatus.APPROVED) {
            throw new exceptions_1.ConflictException('TASK_ALREADY_APPROVED', 'Task has already been approved');
        }
        const membership = await this.prisma.estateMembership.findFirst({
            where: {
                estateId: task.workflowInstance.estateId,
                userId,
                status: 'ACTIVE',
            },
        });
        if (!membership) {
            throw new exceptions_1.ForbiddenException('ESTATE_ACCESS_DENIED', 'User has no active membership in estate');
        }
        if (task.assignedRole && membership.role !== task.assignedRole && membership.role !== client_1.RoleType.ADMIN) {
            throw new exceptions_1.ForbiddenException('ROLE_UNAUTHORIZED', `Only ${task.assignedRole} can approve this task`);
        }
        const updatedTask = await this.prisma.workflowTask.update({
            where: { id: taskId },
            data: {
                status: client_1.TaskStatus.APPROVED,
                actionDetails: actionDetails || {},
                completedAt: new Date(),
            },
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId: task.workflowInstance.estateId,
            eventType: 'TASK_APPROVED',
            resourceType: 'TASK',
            resourceId: task.id,
            metadata: { taskType: task.type },
        });
        return updatedTask;
    }
    async rejectTask(userId, taskId, reason) {
        const task = await this.prisma.workflowTask.findUnique({
            where: { id: taskId },
            include: { workflowInstance: true },
        });
        if (!task)
            throw new exceptions_1.NotFoundException('RESOURCE_NOT_FOUND', 'Task not found');
        const updatedTask = await this.prisma.workflowTask.update({
            where: { id: taskId },
            data: {
                status: client_1.TaskStatus.REJECTED,
                actionDetails: { reason },
                completedAt: new Date(),
            },
        });
        await this.audit.logEvent({
            actorId: userId,
            estateId: task.workflowInstance.estateId,
            eventType: 'TASK_REJECTED',
            resourceType: 'TASK',
            resourceId: task.id,
            metadata: { reason },
        });
        return updatedTask;
    }
};
exports.WorkflowsService = WorkflowsService;
exports.WorkflowsService = WorkflowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], WorkflowsService);
//# sourceMappingURL=workflows.service.js.map