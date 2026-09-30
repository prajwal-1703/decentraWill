import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface NotificationPayload {
  userId: string;
  estateId?: string;
  type: string;
  channel?: string;
  subject: string;
  message: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendNotification(payload: NotificationPayload) {
    this.logger.log(`Dispatching notification to ${payload.userId}: [${payload.type}] ${payload.subject}`);

    return this.prisma.notification.create({
      data: {
        userId: payload.userId,
        estateId: payload.estateId,
        type: payload.type,
        channel: payload.channel || 'EMAIL',
        subject: payload.subject,
        message: payload.message,
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  async getUserNotifications(userId: string, limit: number = 20, cursor?: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }
}
