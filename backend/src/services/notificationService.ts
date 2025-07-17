import { PrismaClient, notifications } from '@prisma/client';
import { FirebaseService } from './firebasecontroller';

const prisma = new PrismaClient();
const firebaseService = new FirebaseService();

export class NotificationService {
  async createAndSendNotification(
    ms_id: string,
    title: string,
    body?: string,
    data?: Record<string, string>
  ): Promise<notifications> {
    if (!ms_id || !title) {
      throw new Error('ms_id และ title จำเป็นต้องระบุ');
    }

    try {
      // สร้างการแจ้งเตือนในฐานข้อมูล
      const notification = await prisma.notifications.create({
        data: {
          ms_id,
          title,
          body,
          read: false,
          created_at: new Date(),
        },
      });

      // ดึง device tokens สำหรับผู้ใช้
      const tokens = await prisma.device_tokens.findMany({
        where: { ms_id },
        select: { token: true },
      });

      if (tokens.length > 0) {
        const tokenList = tokens.map(t => t.token);
        await firebaseService.sendMulticastNotification(tokenList, title, body || '', data);
      }

      return notification;
    } catch (error: any) {
      throw new Error(`ไม่สามารถสร้างหรือส่งการแจ้งเตือน: ${error.message}`);
    }
  }

  async getNotificationsByMsId(ms_id: string): Promise<notifications[]> {
    try {
      const notifications = await prisma.notifications.findMany({
        where: { ms_id },
        orderBy: { created_at: 'desc' },
      });
      return notifications;
    } catch (error: any) {
      throw new Error(`ไม่สามารถดึงข้อมูลการแจ้งเตือน: ${error.message}`);
    }
  }

  async markNotificationAsRead(id: number): Promise<notifications> {
    try {
      const notification = await prisma.notifications.update({
        where: { id },
        data: { read: true },
      });
      return notification;
    } catch (error: any) {
      throw new Error(`ไม่สามารถอัปเดตการแจ้งเตือน: ${error.message}`);
    }
  }
}