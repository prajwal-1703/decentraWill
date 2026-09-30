import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(userId: string, limit?: number, cursor?: string): Promise<{
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
