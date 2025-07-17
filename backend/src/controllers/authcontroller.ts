import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


const prisma = new PrismaClient();
export default prisma;


export type UserRole = 'admin' | 'organizer' | 'user';

export interface User {
  id: number;
  ms_id: string;
  givenName: string;
  surname: string;
  jobTitle: string;
  department: string;
  displayName: string;
  role: UserRole;
  created_at: Date;
}

const JWT_SECRET = process.env.JWT_SECRET || 'waffy04143';

function generateQrCodeId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export const microsoftCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  console.log('microsoftCallback: Received code:', code);

  if (!code) {
    console.error('microsoftCallback: Missing code');
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    // 1. แลก Token
    const tokenRes = await fetch(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('Token request failed:', errorText);
      return res.status(500).json({ error: 'Token request failed', detail: errorText });
    }

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      console.error('Token error:', tokenData.error_description);
      return res.status(500).json({ error: 'Token error', detail: tokenData.error_description });
    }

    // 2. ดึงข้อมูลผู้ใช้
    const userInfoRes = await fetch('https://graph.microsoft.com/v1.0/me?$select=displayName,givenName,surname,jobTitle,department,userPrincipalName', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoRes.ok) {
      const errorText = await userInfoRes.text();
      console.error('User info request failed:', errorText);
      return res.status(500).json({ error: 'User info request failed', detail: errorText });
    }

    const userInfo = await userInfoRes.json();
    console.log('Full Microsoft UserInfo:', JSON.stringify(userInfo, null, 2));

    if (userInfo.error) {
      console.error('User info error:', userInfo.error.message);
      return res.status(500).json({ error: 'User info error', detail: userInfo.error.message });
    }

    const ms_id = userInfo.userPrincipalName;

    // 3. เช็กหรือสร้างผู้ใช้ใน DB
    let user = await prisma.users_up.findUnique({ where: { ms_id } });

    if (!user) {
  user = await prisma.users_up.create({
    data: {
      ms_id,
      givenName: userInfo.givenName ?? '',
      surname: userInfo.surname ?? '',
      jobTitle: userInfo.jobTitle ?? '',
      department: userInfo.department ?? '',
      displayName: userInfo.displayName ?? '',
      role: 'user' as UserRole,
      qrCodeId: generateQrCodeId(),
      created_at: new Date(),
    },
  });
  console.log('User created:', user);
} else {
  // ✅ อัปเดตข้อมูลล่าสุดจาก Microsoft
  user = await prisma.users_up.update({
    where: { ms_id },
    data: {
      givenName: userInfo.givenName ?? '',
      surname: userInfo.surname ?? '',
      jobTitle: userInfo.jobTitle ?? '',
      department: userInfo.department ?? '',
      displayName: userInfo.displayName ?? '',
    },
  });
  console.log('User updated:', user);
}


    // 4. สร้าง JWT
    const token = jwt.sign({ ms_id: user.ms_id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    console.log('JWT generated:', token);

    return res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
  } catch (err: any) {
    console.error('microsoftCallback: Unhandled Error:', err?.message || err);
    return res.status(500).json({ error: 'Authentication failed', detail: err?.message });
  }
};


export const getUser = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  console.log('getUser: Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('getUser: Missing or invalid token format');
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { ms_id: string; role: string };
    console.log('getUser: Token decoded:', decoded);

    const user = await prisma.users_up.findUnique({ where: { ms_id: decoded.ms_id } });

    if (!user) {
      console.error('getUser: User not found:', decoded.ms_id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('getUser: User found:', user);

    return res.json({
      id: user.id,
      ms_id: user.ms_id,
      givenName: user.givenName,
      surname: user.surname,
      jobTitle: user.jobTitle,
      department: user.department,
      displayName: user.displayName,
      role: user.role,
      created_at: user.created_at ? user.created_at.toISOString() : null,
    });
  } catch (err: any) {
    console.error('getUser: Token validation failed:', err?.message || err);
    return res.status(401).json({ error: 'Invalid or expired token', detail: err?.message });
  }
};



export const getUsers = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  console.log('getUsers: Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('getUsers: Missing or invalid token');
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { ms_id: string; role: string };
    console.log('getUsers: Token decoded:', decoded);

    // ตรวจสอบบทบาทของ user ที่ขอข้อมูล (optional)
   if (decoded.role !== 'admin' && decoded.role !== 'organizer') {
  return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
}
    const users = await prisma.users_up.findMany({
      select: {
        id: true,
        ms_id: true,
        givenName: true,
        surname: true,
        jobTitle: true,
        department: true,
        displayName: true,
        role: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // แปลงวันที่เป็น string
    const usersFormatted = users.map(user => ({
      ...user,
      created_at: user.created_at ? user.created_at.toISOString() : null,
    }));

    console.log('getUsers: Users found:', usersFormatted.length);
    return res.json(usersFormatted);
  } catch (err: any) {
    console.error('getUsers: Error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  console.log('/auth/me: Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { ms_id: string };

    const user = await prisma.users_up.findUnique({
      where: { ms_id: decoded.ms_id },
      select: {
        ms_id: true,
        givenName: true,
        surname: true,
        displayName: true,
        jobTitle: true,
        department: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      ...user,
      created_at: user.created_at?.toISOString(),
    });
  } catch (err: any) {
    console.error('/auth/me: Error verifying token', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};



export const login = async (req: Request, res: Response) => {
  try {
    const { ms_id } = req.body;

    console.log('Received request body:', req.body); // Debug: ตรวจสอบ request body

    // Validate ms_id
    if (!ms_id) {
      return res.status(400).json({ error: 'MS_ID is required' });
    }

    if (typeof ms_id !== 'string' || ms_id.trim().length === 0) { 
      return res.status(400).json({ error: 'Invalid MS_ID format' });
    }

    // ค้นหาผู้ใช้หรือสร้างใหม่
    let user = await prisma.users_up.findUnique({ where: { ms_id } });

    if (!user) {
      user = await prisma.users_up.create({
        data: {
          ms_id,
          givenName: `NATTITA`,
          surname: 'DERAI',
          jobTitle: 'Student',
          department: 'เทคโนโลยีสารสนเทศ',
          displayName: `NATTITA DARAI`,
          role: 'admin',
          qrCodeId: generateQrCodeId(),
        },
      });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      {  ms_id: user.ms_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ส่งข้อมูลผู้ใช้กลับไป
    return res.status(200).json({
      token,
      user: {
        
        ms_id: user.ms_id,
        givenName: user.givenName ?? '',
        surname: user.surname ?? '',
        jobTitle: user.jobTitle ?? '',
        department: user.department ?? '',
        displayName: user.displayName ?? '',
        role: user.role,
        qrCodeId: user.qrCodeId ?? '',
        created_at: user.created_at ? user.created_at.toISOString() : new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};





export const updateRole = async (req: Request, res: Response) => {
  try {
    console.log("Request Body:", req.body); // เพิ่มการ log เพื่อตรวจสอบข้อมูลที่ได้รับจาก frontend

    const { userId, role } = req.body;

    // ตรวจสอบว่า userId และ role ถูกต้องหรือไม่
    if (typeof userId !== 'string' || typeof role !== 'string') {
      return res.status(400).json({ message: 'Invalid input types' });
    }

    const validRoles: UserRole[] = ['admin', 'organizer', 'user'];

    if (!validRoles.includes(role as UserRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await prisma.users_up.findUnique({
      where: { ms_id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.users_up.update({
      where: { ms_id: userId },
      data: { role: role as UserRole },
    });

    return res.status(200).json({
      message: 'Role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('[UpdateRole Error]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


interface DeviceTokenRequest {
  ms_id: string;
  token: string;
}


export const saveDeviceToken = async (req: Request, res: Response) => {
  try {
    console.log('🔵 Content-Type:', req.headers['content-type']);
    console.log('🔵 Raw request body:', req.body);
    console.log('🔵 typeof req.body:', typeof req.body);

    const { ms_id, token }: DeviceTokenRequest = req.body;
    console.log('🟢 Parsed ms_id:', ms_id);
    console.log('🟢 Parsed token:', token);

    // Validate request body
    if (!ms_id || !token) {
      console.warn('⚠️ Missing ms_id or token:', { ms_id, token });
      return res.status(400).json({ error: 'ms_id and token are required' });
    }

    if (typeof ms_id !== 'string' || ms_id.trim().length === 0) {
      console.warn('⚠️ Invalid ms_id format:', ms_id);
      return res.status(400).json({ error: 'Invalid ms_id format' });
    }

    if (typeof token !== 'string' || token.trim().length === 0) {
      console.warn('⚠️ Invalid token format:', token);
      return res.status(400).json({ error: 'Invalid token format' });
    }

    // Verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ Missing or invalid Authorization header:', authHeader);
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const authToken = authHeader.split(' ')[1];
    try {
      jwt.verify(authToken, JWT_SECRET);
    } catch (error) {
      console.warn('⚠️ JWT verification failed:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const user = await prisma.users_up.findUnique({ where: { ms_id } });
    if (!user) {
      console.warn('⚠️ User not found:', ms_id);
      return res.status(404).json({ error: 'User not found' });
    }

    const existingToken = await prisma.device_tokens.findFirst({
      where: { ms_id, token },
    });

    if (existingToken) {
      console.log('🟡 Device token already exists');
      return res.status(200).json({ message: 'Device token already exists' });
    } else {
      await prisma.device_tokens.upsert({
        where: {
          ms_id_token: {
            ms_id,
            token,
          },
        },
        update: {}, // ถ้าไม่ต้องอัปเดตอะไร
        create: {
          ms_id,
          token,
          createdAt: new Date(),
        },
      });

      console.log('✅ Device token saved or updated');
    }

    return res.status(201).json({ message: 'Device token saved successfully' });
  } catch (error: any) {
    console.error('❌ Device token error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};










