import { PrismaService } from '../../database/prisma.service';
export interface NotificationPayload {
    userId: string;
    estateId?: string;
    type: string;
    channel?: string;
    subject: string;
    message: string;
}
export declare class NotificationService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    sendNotification(payload: NotificationPayload): Promise<{
        id: string;
        estateId: string | null;
        createdAt: Date;
        userId: string;
        status: string;
        message: string;
        type: string;
        channel: string;
        subject: string;
        sentAt: Date | null;
    }>;
    getUserNotifications(userId: string, limit?: number, cursor?: string): Promise<{
        id: string;
        estateId: string | null;
        createdAt: Date;
        userId: string;
        status: string;
        message: string;
        type: string;
        channel: string;
        subject: string;
        sentAt: Date | null;
    }[]>;
}
