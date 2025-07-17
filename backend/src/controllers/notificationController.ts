import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
const notificationService = new NotificationService();

export const getNotificationsByMsId = async (req: Request, res: Response) => {
  const { ms_id } = req.query;
  if (!ms_id) {
    return res.status(400).json({ message: 'ms_id จำเป็นต้องระบุ' });
  }

  try {
    const notifications = await notificationService.getNotificationsByMsId(ms_id as string);
    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลการแจ้งเตือน', error: error.message });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const notification = await notificationService.markNotificationAsRead(Number(id));
    res.status(200).json({ message: 'อัปเดตการแจ้งเตือนสำเร็จ', data: notification });
  } catch (error: any) {
    res.status(500).json({ message: 'ไม่สามารถอัปเดตการแจ้งเตือน', error: error.message });
  }
};
