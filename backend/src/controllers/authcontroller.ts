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

    const tokenData = await tokenRes.json();
    console.log('microsoftCallback: Token response:', tokenData);

    if (tokenData.error) {
      console.error('microsoftCallback: Token error:', tokenData.error_description);
      throw new Error(tokenData.error_description);
    }

    const userInfoRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userInfoRes.json();
    console.log('microsoftCallback: User info:', userInfo);

    if (userInfo.error) {
      console.error('microsoftCallback: User info error:', userInfo.error.message);
      throw new Error(userInfo.error.message);
    }

    const ms_id = userInfo.userPrincipalName;

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
      console.log('microsoftCallback: User created:', user);
    } else {
      console.log('microsoftCallback: User found:', user);
    }

    const token = jwt.sign({ ms_id: user.ms_id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    console.log('microsoftCallback: JWT generated:', token);

    return res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
  } catch (err: any) {
    console.error('microsoftCallback: Error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  console.log('getUser: Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('getUser: Missing or invalid token');
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { ms_id: string; role: string };
    console.log('getUser: Token decoded:', decoded);

    const user = await prisma.users_up.findUnique({ where: { ms_id: decoded.ms_id } });

    if (!user) {
      console.error('getUser: User not found for ms_id:', decoded.ms_id);
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
    console.error('getUser: Error:', err);
    return res.status(401).json({ error: 'Invalid token' });
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









