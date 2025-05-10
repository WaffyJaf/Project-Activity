import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface for user response
interface UserResponse {
  ms_id: string;
  givenName: string;
  surname: string;
  department: string;
}

// Interface for activity record response
interface ActivityRecordResponse {
  id: number;
  project_id: number;
  ms_id: string;
  joined_at: string;
}

// Search users by ms_id
export const SearchUsers = async (req: Request, res: Response) => {
  const { ms_id } = req.query;

  if (typeof ms_id !== 'string' || !ms_id.trim()) {
    return res.status(400).json({ error: 'Valid ms_id query parameter is required' });
  }

  try {
    const users = await prisma.users_up.findMany({
      where: {
        ms_id: {
          startsWith: ms_id,
        },
      },
      select: {
        ms_id: true,
        givenName: true,
        surname: true,
        department: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('SearchUsers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const ActivityRecord = async (req: Request, res: Response) => {
  const { project_id, ms_id } = req.body;

  // ตรวจสอบ input
  if (!project_id || !ms_id || isNaN(project_id) || typeof ms_id !== 'string') {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid or missing project_id or ms_id',
      code: 'INVALID_INPUT',
    });
  }

  try {
    // ตรวจสอบ project และ user
    const [projectExists, userExists] = await Promise.all([
      prisma.project_activity.findUnique({ where: { project_id } }),
      prisma.users_up.findUnique({ where: { ms_id } }),
    ]);

    if (!projectExists) {
      return res.status(404).json({
        status: 'error',
        error: 'Project not found',
        code: 'PROJECT_NOT_FOUND',
      });
    }

    if (!userExists) {
      return res.status(404).json({
        status: 'error',
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // ตรวจสอบบันทึกซ้ำ
    const existingActivity = await prisma.activity_record.findFirst({
      where: { project_id, ms_id },
    });

    if (existingActivity) {
      return res.status(400).json({
        status: 'duplicate',
        error: 'Activity already recorded',
        code: 'ALREADY_RECORDED',
      });
    }

    // บันทึก activity
    const activity = await prisma.activity_record.create({
      data: { project_id, ms_id },
    });

    // จัดการ joined_at ที่อาจเป็น null
    const activityResponse = {
      ...activity,
      joined_at: activity.joined_at ? activity.joined_at.toISOString() : null,
    };

    return res.status(201).json({
      status: 'success',
      message: 'Activity recorded successfully',
      data: { activity: activityResponse },
    });
  } catch (error) {
    console.error('ActivityRecord error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to record activity',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};