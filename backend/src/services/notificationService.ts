import { PrismaClient, notifications, Prisma } from '@prisma/client';
import { FirebaseService } from './firebasecontroller';

const prisma = new PrismaClient();
const firebaseService = new FirebaseService();

export class NotificationService {
  async createAndSendNotification(
    ms_id: string,
    title: string,
    body?: string,
    opts?: {
      eventId?: number;
      data?: Record<string, string>;
    }
  ): Promise<notifications> {
    if (!ms_id || !title) {
      throw new Error('ms_id และ title จำเป็นต้องระบุ');
    }

    if (title.length > 255) {
      throw new Error('title ต้องไม่เกิน 255 ตัวอักษร');
    }

    try {
      // Prepare JSON data for DB (Prisma.InputJsonValue allows null/undefined)
      const dbJson: Prisma.InputJsonValue | undefined = opts?.eventId
        ? { event_id: opts.eventId, ...(opts?.data ?? {}) }
        : opts?.data;

      // Ensure FCM data is a string map
      const fcmData: Record<string, string> | undefined = opts?.eventId
        ? { event_id: String(opts.eventId), ...(opts?.data ?? {}) }
        : opts?.data;

      // Create notification in DB
      const notification = await prisma.notifications.create({
        data: {
          ms_id,
          title,
          body: body ?? null, // Explicitly set null for consistency
          read: false,
          created_at: new Date(),
          event_post_id: opts?.eventId ?? null,
          data: dbJson,
        },
      });

      // Fetch device tokens for the user
      const tokens = await prisma.device_tokens.findMany({
        where: { ms_id },
        select: { token: true },
      });

      // Send push notification if tokens exist
      if (tokens.length > 0) {
        await firebaseService.sendMulticastNotification(
          tokens.map(t => t.token),
          title,
          body ?? '', // Ensure body is a string for FCM
          fcmData
        );
      }

      return notification;
    } catch (error: any) {
      throw new Error(`ไม่สามารถสร้างหรือส่งการแจ้งเตือน: ${error.message}`);
    } finally {
      await prisma.$disconnect(); // Ensure Prisma client disconnects
    }
  }

  async getNotificationsByMsId(ms_id: string): Promise<notifications[]> {
    if (!ms_id) {
      throw new Error('ms_id จำเป็นต้องระบุ');
    }

    try {
      const list = await prisma.notifications.findMany({
        where: { ms_id },
        orderBy: { created_at: 'desc' },
      });
      return list;
    } catch (error: any) {
      throw new Error(`ไม่สามารถดึงข้อมูลการแจ้งเตือน: ${error.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }

  async markNotificationAsRead(id: number): Promise<notifications> {
    if (!id) {
      throw new Error('id จำเป็นต้องระบุ');
    }

    try {
      const notification = await prisma.notifications.update({
        where: { id },
        data: { read: true },
      });
      return notification;
    } catch (error: any) {
      throw new Error(`ไม่สามารถอัปเดตการแจ้งเตือน: ${error.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }
}