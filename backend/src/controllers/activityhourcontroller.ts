import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface RegistrationResponse {
  status: 'success' | 'error';
  data?: {
    registrations: Array<{
      register_id: number;
      post_id: number | null;
      student_id: string;
      student_name: string;
      faculty: string;
      project_id: number | null;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
  code?: string;
}

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
        error: 'รายชื่อนี้บันทึกไปแล้ว',
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
    console.log('Received qr_code_data:', qr_code_data); 
    console.log('Received user_id:', user_id); 

    // แปลง qr_code_data เป็น project_id
    const project_id = parseInt(qr_code_data);
    if (isNaN(project_id)) {
      console.log('Invalid qr_code_data format:', qr_code_data); 
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
      console.log('Project not found for project_id:', project_id); 
      return res.status(404).json({
        status: 'error',
        error: 'Project not found',
        code: 'PROJECT_NOT_FOUND',
      });
    }
    console.log('Found project:', projectExists);

    // ค้นหา ms_id จาก user_id (qrCodeId)
    const user = await prisma.users_up.findUnique({ where: { qrCodeId: user_id } });
    if (!user) {
      console.log('User not found for qrCodeId:', user_id); 
      return res.status(404).json({
        status: 'error',
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const ms_id = user.ms_id;
    // ตรวจสอบความยาว ms_id
    if (ms_id.length > 10) {
      console.log('ms_id too long:', ms_id); 
      return res.status(400).json({
        status: 'error',
        error: 'ms_id exceeds maximum length of 10 characters',
        code: 'INVALID_MS_ID_LENGTH',
      });
    }
    console.log('Found ms_id:', ms_id); 

    // ตรวจสอบบันทึกซ้ำ
    const existingActivity = await prisma.activity_record.findFirst({
      where: { project_id, ms_id },
    });

    if (existingActivity) {
      console.log('Activity already recorded:', { project_id, ms_id }); 
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


export const getRegistrationsByProject = async (req: Request, res: Response) => {
  const { project_id } = req.params;

  // Validate project_id
  if (!project_id || isNaN(Number(project_id))) {
    return res.status(400).json({ message: "project_id ไม่ถูกต้อง" });
  }

  try {
    // Check if project_id exists in project_activity
    const project = await prisma.project_activity.findUnique({
      where: { project_id: Number(project_id) },
    });

    if (!project) {
      return res.status(404).json({ message: "ไม่พบ project_id นี้" });
    }

    // Fetch registrations by joining with event_posts
    const registrations = await prisma.registration_activity.findMany({
      where: {
        event_posts: {
          project_id: Number(project_id),
        },
      },
      include: {
        event_posts: {
          select: {
            post_id: true,
            post_content: true,
            post_date: true,
            location_post: true,
          },
        },
        project_activity: {
          select: {
            project_id: true,
            project_name: true,
            project_description: true,
          },
        },
      },
      orderBy: {
        register_id: 'asc', // Sort by register_id for consistency
      },
    });

    if (registrations.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลการลงทะเบียนสำหรับ project_id นี้" });
    }

    // Format response to include only relevant fields
    const formattedRegistrations = registrations.map(reg => ({
      register_id: reg.register_id,
      post_id: reg.post_id,
      student_id: reg.student_id,
      student_name: reg.student_name,
      faculty: reg.faculty,
      post_content: reg.event_posts?.post_content,
      post_date: reg.event_posts?.post_date,
      location_post: reg.event_posts?.location_post,
      project_name: reg.project_activity?.project_name,
    }));

    res.status(200).json({
      message: "ดึงข้อมูลสำเร็จ",
      data: formattedRegistrations,
      total: registrations.length,
    });
  } catch (error) {
    console.error("!!! Error fetching registrations !!!", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error });
  } finally {
    await prisma.$disconnect();
  }
};

export const getUserByMsId = async (req: Request, res: Response) => {
  const { ms_id } = req.params;
  try {
    const user = await prisma.users_up.findUnique({
      where: { ms_id },
      include: {
        activity_record: {
          include: {
            project_activity: {
              select: {
                project_name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    const transformedUser = {
      ...user,
      activity_record: user.activity_record.map((record) => ({
        id: record.id,
        project_id: record.project_id,
        project_name: record.project_activity?.project_name ?? 'Unknown Project',
        ms_id: record.ms_id,
        joined_at: record.joined_at,
        project_activity: record.project_activity, 
      })),
    };

    res.json(transformedUser);
  } catch (error) {
    console.error(`Error fetching user ${ms_id}:`, error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
};

export const getRegistrationByStudentId = async (req: Request, res: Response) => {
  const { student_id } = req.params;

  try {
    const registrations = await prisma.registration_activity.findMany({
      where: { student_id },
      include: {
        project_activity: {
          select: {
            project_name: true,
          },
        },
        event_posts: {
          select: {
            post_id: true,
            post_content: true,
            location_post: true,
            hour_post: true,
            post_datetime: true,
          },
        },
      },
    });

    if (registrations.length === 0) {
      return res.status(404).json({ error: 'No registration history found for this student' });
    }

    const transformed = registrations.map((r) => ({
      register_id: r.register_id,
      student_id: r.student_id,
      student_name: r.student_name,
      faculty: r.faculty,
      project_name: r.project_activity?.project_name ?? 'Unknown Project',
      event: r.event_posts
        ? {
            post_id: r.event_posts.post_id,
            content: r.event_posts.post_content,
            location: r.event_posts.location_post,
            datetime: r.event_posts.post_datetime,
          }
        : null,
    }));

    res.json(transformed);
  } catch (error) {
    console.error(`Error fetching registration history for student_id ${student_id}:`, error);
    res.status(500).json({ error: 'Failed to fetch registration history' });
  }
};









