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
  if (!project_id || !ms_id || typeof project_id !== 'number' || typeof ms_id !== 'string') {
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
      data: {
        project_id,
        ms_id,
        joined_at: new Date(),
      },
    });

    // จัดการ joined_at
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

export const ActivityRecordMobile = async (req: Request, res: Response) => {
  const { project_id, qr_code_id } = req.body;

  // ตรวจสอบ input
  if (!project_id || !qr_code_id || typeof project_id !== 'number' || typeof qr_code_id !== 'string') {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid or missing project_id or qr_code_id',
      code: 'INVALID_INPUT',
    });
  }

  try {
    // ค้นหา ms_id จาก qr_code_id
    const user = await prisma.users_up.findUnique({ where: { qrCodeId: qr_code_id } });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const ms_id = user.ms_id;
    // ตรวจสอบความยาว ms_id
    if (ms_id.length > 10) {
      return res.status(400).json({
        status: 'error',
        error: 'ms_id exceeds maximum length of 10 characters',
        code: 'INVALID_MS_ID_LENGTH',
      });
    }

    // ตรวจสอบ project
    const projectExists = await prisma.project_activity.findUnique({ where: { project_id } });
    if (!projectExists) {
      return res.status(404).json({
        status: 'error',
        error: 'Project not found',
        code: 'PROJECT_NOT_FOUND',
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
      data: {
        project_id,
        ms_id,
        joined_at: new Date(),
      },
    });

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

export const JoinActivity = async (req: Request, res: Response) => {
  const { qr_code_data, user_id } = req.body;

  // ตรวจสอบ input
  if (!qr_code_data || !user_id || typeof qr_code_data !== 'string' || typeof user_id !== 'string') {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid or missing qr_code_data or user_id',
      code: 'INVALID_INPUT',
    });
  }

  try {
    console.log('Received qr_code_data:', qr_code_data); // Debug
    console.log('Received user_id:', user_id); // Debug

    // แปลง qr_code_data เป็น project_id
    const project_id = parseInt(qr_code_data);
    if (isNaN(project_id)) {
      console.log('Invalid qr_code_data format:', qr_code_data); // Debug
      return res.status(400).json({
        status: 'error',
        error: 'Invalid qr_code_data format',
        code: 'INVALID_QR_CODE',
      });
    }

    // ตรวจสอบ project
    const projectExists = await prisma.project_activity.findUnique({
      where: { project_id },
    });
    if (!projectExists) {
      console.log('Project not found for project_id:', project_id); // Debug
      return res.status(404).json({
        status: 'error',
        error: 'Project not found',
        code: 'PROJECT_NOT_FOUND',
      });
    }
    console.log('Found project:', projectExists); // Debug

    // ค้นหา ms_id จาก user_id (qrCodeId)
    const user = await prisma.users_up.findUnique({ where: { qrCodeId: user_id } });
    if (!user) {
      console.log('User not found for qrCodeId:', user_id); // Debug
      return res.status(404).json({
        status: 'error',
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const ms_id = user.ms_id;
    // ตรวจสอบความยาว ms_id
    if (ms_id.length > 10) {
      console.log('ms_id too long:', ms_id); // Debug
      return res.status(400).json({
        status: 'error',
        error: 'ms_id exceeds maximum length of 10 characters',
        code: 'INVALID_MS_ID_LENGTH',
      });
    }
    console.log('Found ms_id:', ms_id); // Debug

    // ตรวจสอบบันทึกซ้ำ
    const existingActivity = await prisma.activity_record.findFirst({
      where: { project_id, ms_id },
    });

    if (existingActivity) {
      console.log('Activity already recorded:', { project_id, ms_id }); // Debug
      return res.status(400).json({
        status: 'duplicate',
        error: 'Activity already recorded',
        code: 'ALREADY_RECORDED',
      });
    }

    // บันทึก activity
    const activity = await prisma.activity_record.create({
      data: {
        project_id,
        ms_id,
        joined_at: new Date(),
      },
    });

    const activityResponse = {
      ...activity,
      joined_at: activity.joined_at ? activity.joined_at.toISOString() : null,
    };

    return res.status(201).json({
      status: 'success',
      message: 'Activity joined successfully',
      data: { activity: activityResponse },
    });
  } catch (error) {
    console.error('JoinActivity error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to join activity',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

