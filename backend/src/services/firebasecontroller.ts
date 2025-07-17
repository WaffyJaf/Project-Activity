import admin from 'firebase-admin';
import path from 'path';

// โหลด service account
const serviceAccount = require(path.resolve(__dirname, '../../activity-7f7f1-firebase-adminsdk-fbsvc-9040751b95.json'));

// เริ่มต้น Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export class FirebaseService {
  // ส่งการแจ้งเตือนไปยัง token เดียว
  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<string> {
    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    };

    try {
      const response = await admin.messaging().send(message);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  // ส่งการแจ้งเตือนไปยังหลาย token พร้อมกัน
  async sendMulticastNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<string> {
    const stringifiedData: Record<string, string> = {};
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        stringifiedData[key] = String(value);
      });
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      data: stringifiedData,
      tokens,
    };

    try {
      // ใช้ sendMulticast หรือ sendEachForMulticast ตามเวอร์ชัน SDK
     const response = await admin.messaging().sendEachForMulticast(message);
      return JSON.stringify(response);
    } catch (error: any) {
      throw new Error(`Failed to send multicast notification: ${error.message}`);
    }
  }
}