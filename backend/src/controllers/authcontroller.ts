import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

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

export const login = async (req: Request, res: Response) => {
  try {
    const { ms_id } = req.body;

    if (!ms_id) {
      return res.status(400).json({ message: 'MS_ID is required' });
    }

    // ค้นหาผู้ใช้หรือสร้างใหม่ถ้ายังไม่มี
    let user = await prisma.users_up.findUnique({ where: { ms_id } });

    if (!user) {
      user = await prisma.users_up.create({
        data: {
          ms_id,
          givenName: `User ${ms_id}`,
          surname: 'Unknown',
          jobTitle: 'Student',
          department: 'Technology',
          displayName: `User ${ms_id}`,
          role: 'user',
        },
      });
    }

    // ส่งข้อมูลผู้ใช้กลับไป
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        ms_id: user.ms_id,
        givenName: user.givenName ?? '',
        surname: user.surname ?? '',
        jobTitle: user.jobTitle ?? '',
        department: user.department ?? '',
        displayName: user.displayName ?? '',
        role: user.role as UserRole,
        created_at: user.created_at ?? new Date(),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
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





