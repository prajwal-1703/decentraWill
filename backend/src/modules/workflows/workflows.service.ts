import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, NotFoundException, ConflictException } from '../../common/exceptions';
import { TaskStatus, RoleType } from '@prisma/client';

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async triggerWorkflow(userId: string, estateId: string, type: string, metadata?: any) {
    const membership = await this.prisma.estateMembership.findFirst({
      where: { estateId, userId, status: 'ACTIVE' },
    });
    if (!membership) throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to trigger workflow');

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
              assignedRole: RoleType.ADVOCATE,
              status: TaskStatus.PENDING,
            },
            {
              title: 'Executor Activation Acknowledgment',
              type: 'EXECUTOR_ACKNOWLEDGMENT',
              assignedRole: RoleType.EXECUTOR,
              status: TaskStatus.PENDING,
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

  async getWorkflow(userId: string, workflowId: string) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: workflowId },
      include: { tasks: true, estate: true },
    });
    if (!instance) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Workflow instance not found');

    const membership = await this.prisma.estateMembership.findFirst({
      where: { estateId: instance.estateId, userId, status: 'ACTIVE' },
    });
    if (!membership) throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'Unauthorized to view workflow');

    return instance;
  }

  async approveTask(userId: string, taskId: string, actionDetails?: any) {
    const task = await this.prisma.workflowTask.findUnique({
      where: { id: taskId },
      include: { workflowInstance: true },
    });
    if (!task) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Task not found');

    if (task.status === TaskStatus.APPROVED) {
      throw new ConflictException('TASK_ALREADY_APPROVED', 'Task has already been approved');
    }

    // Role check
    const membership = await this.prisma.estateMembership.findFirst({
      where: {
        estateId: task.workflowInstance.estateId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      throw new ForbiddenException('ESTATE_ACCESS_DENIED', 'User has no active membership in estate');
    }

    if (task.assignedRole && membership.role !== task.assignedRole && membership.role !== RoleType.ADMIN) {
      throw new ForbiddenException('ROLE_UNAUTHORIZED', `Only ${task.assignedRole} can approve this task`);
    }

    const updatedTask = await this.prisma.workflowTask.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.APPROVED,
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

  async rejectTask(userId: string, taskId: string, reason?: string) {
    const task = await this.prisma.workflowTask.findUnique({
      where: { id: taskId },
      include: { workflowInstance: true },
    });
    if (!task) throw new NotFoundException('RESOURCE_NOT_FOUND', 'Task not found');

    const updatedTask = await this.prisma.workflowTask.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.REJECTED,
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
}
