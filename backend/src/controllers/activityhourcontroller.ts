import { Request, Response } from 'express';
import { PrismaClient , activity_record_evaluation_status  } from '@prisma/client';
const prisma = new PrismaClient();

interface RegistrationResponse {
  status: 'success' | 'error';
  data?: {
    registrations: Array<{
      register_id: number;
      post_id: number | null;
      ms_id: string;
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


function getAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 8 ? `${year}/${(year + 1).toString().slice(-2)}` 
                    : `${year - 1}/${year.toString().slice(-2)}`;
}

function getCurrentTerm() {
  const month = new Date().getMonth() + 1;
  if (month >= 8 && month <= 12) return 1; // ภาคเรียนที่ 1
  if (month >= 1 && month <= 5) return 2;  // ภาคเรียนที่ 2
  return 3;                                // ภาคฤดูร้อน
}

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
    const result = await prisma.$transaction(async (tx) => {
      // ตรวจสอบ project และ user
      const [projectExists, userExists] = await Promise.all([
        tx.project_activity.findUnique({
          where: { project_id },
          select: { project_id: true, hours: true, has_evaluation: true, project_name: true },
        }),
        tx.users_up.findUnique({ where: { ms_id } }),
      ]);

      if (!projectExists) {
        return {
          status: 'error',
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND',
          httpStatus: 404,
        };
      }

      if (!userExists) {
        return {
          status: 'error',
          error: 'User not found',
          code: 'USER_NOT_FOUND',
          httpStatus: 404,
        };
      }

      if (!projectExists.hours) {
        return {
          status: 'error',
          error: 'Project does not have hours defined',
          code: 'INVALID_HOURS',
          httpStatus: 400,
        };
      }

      // ตรวจสอบบันทึกซ้ำ
      const existingActivity = await tx.activity_record.findFirst({
        where: { project_id, ms_id },
      });

      if (existingActivity) {
        return {
          status: 'duplicate',
          error: 'รายชื่อนี้บันทึกไปแล้ว',
          code: 'ALREADY_RECORDED',
          httpStatus: 400,
        };
      }

      // สร้าง activity_record
      const activity = await tx.activity_record.create({
        data: {
          project_id,
          ms_id,
          joined_at: new Date(),
          evaluation_status: projectExists.has_evaluation
            ? activity_record_evaluation_status.PENDING
            : activity_record_evaluation_status.COMPLETED,
        },
      });

      // ถ้าไม่ต้องประเมิน อัปเดต totalActivityHours
      if (!projectExists.has_evaluation) {
      // อัปเดตยอดรวมใน users_up
      await tx.users_up.update({
        where: { ms_id },
        data: {
          totalActivityHours: { increment: projectExists.hours },
        },
      });

      // ✨ เพิ่มการบันทึกลง activity_hours_log
      await tx.activity_hours_log.create({
        data: {
          ms_id,
          project_id,
          hours_added: projectExists.hours,
          effective_date: new Date(),            // วันที่เพิ่มชั่วโมง
          academic_year: getAcademicYear(),      // เขียนฟังก์ชันคำนวณปีการศึกษา
          term: getCurrentTerm(),                // เขียนฟังก์ชันคำนวณเทอม
        },
      });

        // (ไม่บังคับ) สร้างการแจ้งเตือน
        await tx.notifications.create({
          data: {
            ms_id,
            title: "ชั่วโมงกิจกรรมถูกเพิ่ม",
            body: `คุณได้รับ ${projectExists.hours} ชั่วโมงจากโครงการ ${projectExists.project_name}`,
            read: false,
            created_at: new Date(),
          },
        });
      }

      // จัดการ joined_at
      const activityResponse = {
        ...activity,
        joined_at: activity.joined_at ? activity.joined_at.toISOString() : null,
      };

      return {
        status: 'success',
        message: 'Activity recorded successfully',
        data: { activity: activityResponse },
        httpStatus: 201,
      };
    });

    // ส่ง response จากผลลัพธ์ใน transaction
    return res.status(result.httpStatus).json(result);
  } catch (err: any) {
    console.error("❌ ActivityRecord error:", err);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to record activity',
      code: 'INTERNAL_SERVER_ERROR',
    });
  } finally {
    await prisma.$disconnect();
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
    const result = await prisma.$transaction(async (tx) => {
      // ค้นหา ms_id จาก qr_code_id
      const user = await tx.users_up.findUnique({ where: { qrCodeId: qr_code_id } });
      if (!user) {
        return {
          status: 'error',
          error: 'User not found',
          code: 'USER_NOT_FOUND',
          httpStatus: 404,
        };
      }

      const ms_id = user.ms_id;
      // ตรวจสอบความยาว ms_id
      if (ms_id.length > 10) {
        return {
          status: 'error',
          error: 'ms_id exceeds maximum length of 10 characters',
          code: 'INVALID_MS_ID_LENGTH',
          httpStatus: 400,
        };
      }

      // ตรวจสอบ project
      const projectExists = await tx.project_activity.findUnique({
        where: { project_id },
        select: { project_id: true, hours: true, has_evaluation: true, project_name: true },
      });
      if (!projectExists) {
        return {
          status: 'error',
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND',
          httpStatus: 404,
        };
      }

      // ตรวจสอบว่า hours มีค่า
      if (!projectExists.hours) {
        return {
          status: 'error',
          error: 'Project does not have hours defined',
          code: 'INVALID_HOURS',
          httpStatus: 400,
        };
      }

      // ตรวจสอบบันทึกซ้ำ
      const existingActivity = await tx.activity_record.findFirst({
        where: { project_id, ms_id },
      });
      if (existingActivity) {
        return {
          status: 'duplicate',
          error: 'Activity already recorded',
          code: 'ALREADY_RECORDED',
          httpStatus: 400,
        };
      }

      // บันทึก activity
      const activity = await tx.activity_record.create({
        data: {
          project_id,
          ms_id,
          joined_at: new Date(),
          evaluation_status: projectExists.has_evaluation
            ? activity_record_evaluation_status.PENDING
            : activity_record_evaluation_status.COMPLETED,
        },
      });

      // ถ้าไม่ต้องประเมิน อัปเดต totalActivityHours
      if (!projectExists.has_evaluation) {
        await tx.users_up.update({
          where: { ms_id },
          data: {
            totalActivityHours: { increment: projectExists.hours },
          },
        });

        // (ไม่บังคับ) สร้างการแจ้งเตือน
        await tx.notifications.create({
          data: {
            ms_id,
            title: "ชั่วโมงกิจกรรมถูกเพิ่ม",
            body: `คุณได้รับ ${projectExists.hours} ชั่วโมงจากโครงการ ${projectExists.project_name}`,
            read: false,
            created_at: new Date(),
          },
        });
      }

      const activityResponse = {
        ...activity,
        joined_at: activity.joined_at ? activity.joined_at.toISOString() : null,
      };

      return {
        status: 'success',
        message: 'Activity recorded successfully',
        data: { activity: activityResponse },
        httpStatus: 201,
      };
    });

    // ส่ง response จากผลลัพธ์ใน transaction
    return res.status(result.httpStatus).json(result);
  } catch (error) {
    console.error('ActivityRecordMobile error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to record activity',
      code: 'INTERNAL_SERVER_ERROR',
    });
  } finally {
    await prisma.$disconnect();
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

    const result = await prisma.$transaction(async (tx) => {
      // ตรวจสอบ project
      const projectExists = await tx.project_activity.findUnique({
        where: { project_id },
        select: { project_id: true, hours: true, has_evaluation: true, project_name: true },
      });
      if (!projectExists) {
        console.log('Project not found for project_id:', project_id);
        return {
          status: 'error',
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND',
          httpStatus: 404,
        };
      }
      console.log('Found project:', projectExists);

      // ตรวจสอบว่า hours มีค่า
      if (!projectExists.hours) {
        console.log('Project does not have hours defined:', project_id);
        return {
          status: 'error',
          error: 'Project does not have hours defined',
          code: 'INVALID_HOURS',
          httpStatus: 400,
        };
      }

      // ค้นหา ms_id จาก user_id (qrCodeId)
      const user = await tx.users_up.findUnique({ where: { qrCodeId: user_id } });
      if (!user) {
        console.log('User not found for qrCodeId:', user_id);
        return {
          status: 'error',
          error: 'User not found',
          code: 'USER_NOT_FOUND',
          httpStatus: 404,
        };
      }

      const ms_id = user.ms_id;
      // ตรวจสอบความยาว ms_id
      if (ms_id.length > 10) {
        console.log('ms_id too long:', ms_id);
        return {
          status: 'error',
          error: 'ms_id exceeds maximum length of 10 characters',
          code: 'INVALID_MS_ID_LENGTH',
          httpStatus: 400,
        };
      }
      console.log('Found ms_id:', ms_id);

      // ตรวจสอบบันทึกซ้ำ
      const existingActivity = await tx.activity_record.findFirst({
        where: { project_id, ms_id },
      });
      if (existingActivity) {
        console.log('Activity already recorded:', { project_id, ms_id });
        return {
          status: 'duplicate',
          error: 'Activity already recorded',
          code: 'ALREADY_RECORDED',
          httpStatus: 400,
        };
      }

      // บันทึก activity
      const activity = await tx.activity_record.create({
        data: {
          project_id,
          ms_id,
          joined_at: new Date(),
          evaluation_status: projectExists.has_evaluation
            ? activity_record_evaluation_status.PENDING
            : activity_record_evaluation_status.COMPLETED,
        },
      });

      // ถ้าไม่ต้องประเมิน อัปเดต totalActivityHours
      if (!projectExists.has_evaluation) {
        await tx.users_up.update({
          where: { ms_id },
          data: {
            totalActivityHours: { increment: projectExists.hours },
          },
        });

        // (ไม่บังคับ) สร้างการแจ้งเตือน
        await tx.notifications.create({
          data: {
            ms_id,
            title: "ชั่วโมงกิจกรรมถูกเพิ่ม",
            body: `คุณได้รับ ${projectExists.hours} ชั่วโมงจากโครงการ ${projectExists.project_name}`,
            read: false,
            created_at: new Date(),
          },
        });
      }

      const activityResponse = {
        ...activity,
        joined_at: activity.joined_at ? activity.joined_at.toISOString() : null,
      };

      return {
        status: 'success',
        message: 'Activity joined successfully',
        data: { activity: activityResponse },
        httpStatus: 201,
      };
    });

    // ส่ง response จากผลลัพธ์ใน transaction
    return res.status(result.httpStatus).json(result);
  } catch (error) {
    console.error('JoinActivity error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to join activity',
      code: 'INTERNAL_SERVER_ERROR',
    });
  } finally {
    await prisma.$disconnect();
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
      ms_id: reg.ms_id,
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

//รายชื่อผู้เข้าร่วมทั้งหมด
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
                has_evaluation: true,
                evaluation_form_url: true,
                hours: true, // เพิ่มการดึง hours
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const transformedUser = {
      ...user,
      activity_record: user.activity_record.map((record) => ({
        id: record.id,
        project_id: record.project_id,
        project_name: record.project_activity?.project_name ?? "Unknown Project",
        ms_id: record.ms_id,
        joined_at: record.joined_at,
        evaluation_status: record.evaluation_status,
        hours: record.project_activity?.hours ?? 0,
        has_evaluation: record.project_activity?.has_evaluation ?? false,
        evaluation_form_url: record.project_activity?.evaluation_form_url ?? null,
      })),
    };

    res.json(transformedUser);
  } catch (error) {
    console.error(`Error fetching user ${ms_id}:`, error);
    res.status(500).json({ error: "Failed to fetch user activity" });
  } finally {
    await prisma.$disconnect();
  }
};

export const getRegistrationByStudentId = async (req: Request, res: Response) => {
  const { ms_id } = req.params;

  try {
    const registrations = await prisma.registration_activity.findMany({
      where: { ms_id},
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
      ms_id: r.ms_id,
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
    console.error(`Error fetching registration history for student_id ${ms_id}:`, error);
    res.status(500).json({ error: 'Failed to fetch registration history' });
  }
};

export const updateEvaluation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { evaluation_status } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "id ไม่ครบถ้วนหรือไม่ใช่ตัวเลข" });
  }
  if (!evaluation_status || typeof evaluation_status !== 'string') {
    return res.status(400).json({ message: "evaluation_status ไม่ครบถ้วนหรือไม่ใช่สตริง" });
  }

  const validStatuses = Object.values(activity_record_evaluation_status);
  if (!validStatuses.includes(evaluation_status as activity_record_evaluation_status)) {
    return res.status(400).json({
      message: `evaluation_status ต้องเป็นหนึ่งใน: ${validStatuses.join(', ')}`,
    });
  }

  try {
    const IdNum = Number(id);

    const result = await prisma.$transaction(async (tx) => {
      const existingRecord = await tx.activity_record.findUnique({
        where: { id: IdNum },
        include: {
          project_activity: true,
          users_up: true,
        },
      });

      if (!existingRecord) {
        throw new Error("ไม่พบ activity_record");
      }

      // ตรวจสอบว่าโครงการไม่ต้องประเมิน
      if (!existingRecord.project_activity.has_evaluation) {
        throw new Error("โครงการนี้ไม่ต้องประเมิน ชั่วโมงถูกเพิ่มอัตโนมัติแล้ว");
      }

      if (
        existingRecord.evaluation_status === activity_record_evaluation_status.COMPLETED &&
        evaluation_status === activity_record_evaluation_status.COMPLETED
      ) {
        throw new Error("ชั่วโมงกิจกรรมนี้ถูกเพิ่มไปแล้ว");
      }

      const updatedRecord = await tx.activity_record.update({
        where: { id: IdNum },
        data: {
          evaluation_status: evaluation_status as activity_record_evaluation_status,
        },
      });

      if (evaluation_status === activity_record_evaluation_status.COMPLETED) {
        const hoursToAdd = existingRecord.project_activity.hours;
        if (!hoursToAdd) {
          throw new Error("ไม่พบจำนวนชั่วโมงใน project_activity");
        }

        // อัปเดต totalActivityHours
        await tx.users_up.update({
          where: { ms_id: existingRecord.ms_id },
          data: {
            totalActivityHours: { increment: hoursToAdd },
          },
        });

        // ✨ เพิ่มการบันทึกลง activity_hours_log
        await tx.activity_hours_log.create({
          data: {
            ms_id: existingRecord.ms_id,
            project_id: existingRecord.project_id,
            hours_added: hoursToAdd,
            effective_date: new Date(),
            academic_year: getAcademicYear(), // helper function คำนวณปีการศึกษา
            term: getCurrentTerm(),           // helper function คำนวณภาคเรียน
          },
        });

        // (ไม่บังคับ) สร้างการแจ้งเตือน
        await tx.notifications.create({
          data: {
            ms_id: existingRecord.ms_id,
            title: "ชั่วโมงกิจกรรมถูกเพิ่ม",
            body: `คุณได้รับ ${hoursToAdd} ชั่วโมงจากโครงการ ${existingRecord.project_activity.project_name}`,
            read: false,
            created_at: new Date(),
          },
        });
      }

      return updatedRecord;
    });

    return res.status(200).json({ message: "อัปเดตการประเมินสำเร็จ", data: result });
  } catch (error: any) {
  return res.status(500).json({
    message: "เกิดข้อผิดพลาดในการอัปเดตการประเมิน",
    error: error.message,
  });
  } finally {
    await prisma.$disconnect();
  }
};











