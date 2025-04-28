import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

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

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

function generateQrCodeId() {
  return randomBytes(8).toString('hex');
}

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
          givenName: `NATTITA `,
          surname: 'DERAI',
          jobTitle: 'Student',
          department: 'ict',
          displayName: `NATTITA DERAI `,
          role: 'organizer',
          qrCodeId: generateQrCodeId(),
        },
      });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { id: user.id, ms_id: user.ms_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ส่งข้อมูลผู้ใช้กลับไป
    return res.status(200).json({
      token,
      user: {
        id: user.id,
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



// API สำหรับกำหนด role (ใช้สำหรับ admin)
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;
    const validRoles: UserRole[] = ['admin', 'organizer', 'user'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updatedUser = await prisma.users_up.update({
      where: { id: userId },
      data: { role },
    });

    return res.status(200).json({
      message: 'Role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//ดึงข้อมูลผู้ใช้
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users_up.findMany({
      select: {
          id: true,
          ms_id: true,
          givenName:  true,
          surname:  true,
          jobTitle:  true,
          department:  true,
          displayName:  true,
          role:  true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
    return res.status(500).json({
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};





