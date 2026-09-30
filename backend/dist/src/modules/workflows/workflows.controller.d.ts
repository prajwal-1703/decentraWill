import { WorkflowsService } from './workflows.service';
export declare class WorkflowsController {
    private readonly workflowsService;
    constructor(workflowsService: WorkflowsService);
    triggerWorkflow(userId: string, estateId: string, type: string, metadata: any): Promise<{
        tasks: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.TaskStatus;
            type: string;
            title: string;
            assignedRole: import(".prisma/client").$Enums.RoleType | null;
            assignedUserId: string | null;
            actionDetails: import("@prisma/client/runtime/library").JsonValue | null;
            completedAt: Date | null;
            workflowInstanceId: string;
        }[];
    } & {
        id: string;
        estateId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        type: string;
        state: string;
        startedAt: Date;
        endedAt: Date | null;
    }>;
    getWorkflow(userId: string, workflowId: string): Promise<{
        estate: {
            id: string;
            createdAt: Date;
            name: string;
            description: string | null;
            status: string;
            updatedAt: Date;
            ownerId: string;
        };
        tasks: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.TaskStatus;
            type: string;
            title: string;
            assignedRole: import(".prisma/client").$Enums.RoleType | null;
            assignedUserId: string | null;
            actionDetails: import("@prisma/client/runtime/library").JsonValue | null;
            completedAt: Date | null;
            workflowInstanceId: string;
        }[];
    } & {
        id: string;
        estateId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        type: string;
        state: string;
        startedAt: Date;
        endedAt: Date | null;
    }>;
    approveTask(userId: string, taskId: string, actionDetails: any): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        type: string;
        title: string;
        assignedRole: import(".prisma/client").$Enums.RoleType | null;
        assignedUserId: string | null;
        actionDetails: import("@prisma/client/runtime/library").JsonValue | null;
        completedAt: Date | null;
        workflowInstanceId: string;
    }>;
    rejectTask(userId: string, taskId: string, reason: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        type: string;
        title: string;
        assignedRole: import(".prisma/client").$Enums.RoleType | null;
        assignedUserId: string | null;
        actionDetails: import("@prisma/client/runtime/library").JsonValue | null;
        completedAt: Date | null;
        workflowInstanceId: string;
    }>;
}
