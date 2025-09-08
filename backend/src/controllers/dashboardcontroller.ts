import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DashboardStats {
  totalActivities: number;
  activitiesByFaculty: { faculty: string; count: number }[];
  activitiesByStatus: { status: string; count: number }[];
  activitiesByDepartment: { department: string | null; count: number }[];
}

// === ADD: helpers สำหรับช่วงเวลา/ปีการศึกษา ===
const toAD = (y: number) => (y > 2400 ? y - 543 : y); // รองรับ พ.ศ.
const getAcademicYearRange = (ayStr?: string): { from: Date; to: Date } | null => {
  if (!ayStr) return null;
  const ay = toAD(parseInt(ayStr, 10));
  if (Number.isNaN(ay)) return null;
  const from = new Date(Date.UTC(ay, 5, 1, 0, 0, 0));         // Jun 1, ay
  const to   = new Date(Date.UTC(ay + 1, 4, 31, 23, 59, 59)); // May 31, ay+1
  return { from, to };
};
const getRangeFromQuery = (req: Request): { from?: Date; to?: Date } => {
  const { from, to, ay } = req.query as { from?: string; to?: string; ay?: string };

  // ถ้ามี ay ให้มาก่อน
  const ayRange = getAcademicYearRange(ay);
  if (ayRange) return ayRange;

  // รองรับ from/to แบบ ISO
  let fromDate: Date | undefined;
  let toDate: Date | undefined;
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) fromDate = d;
  }
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) toDate = d;
  }
  return { from: fromDate, to: toDate };
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // === ADD: อ่านช่วงวันจาก query (ay หรือ from/to)
    const { from, to } = getRangeFromQuery(req);

    // where สำหรับ project_activity (ครอบคลุมทั้ง created_date และ project_datetime)
    const projectDateWhere =
      from || to
        ? {
            OR: [
              {
                created_date: {
                  ...(from ? { gte: from } : {}),
                  ...(to ? { lte: to } : {}),
                },
              },
              {
                project_datetime: {
                  ...(from ? { gte: from } : {}),
                  ...(to ? { lte: to } : {}),
                },
              },
            ],
          }
        : {};

    // where สำหรับ registration_activity: อิงวันจาก event_posts หรือ project_activity
    const registrationWhere =
      from || to
        ? {
            OR: [
              // จากวันของโพสต์กิจกรรม (event_posts)
              {
                event_posts: {
                  is: {
                    OR: [
                      {
                        post_datetime: {
                          ...(from ? { gte: from } : {}),
                          ...(to ? { lte: to } : {}),
                        },
                      },
                      {
                        post_date: {
                          ...(from ? { gte: from } : {}),
                          ...(to ? { lte: to } : {}),
                        },
                      },
                    ],
                  },
                },
              },
              // หรือจากวันของโครงการ (project_activity)
              {
                project_activity: {
                  is: {
                    OR: [
                      {
                        project_datetime: {
                          ...(from ? { gte: from } : {}),
                          ...(to ? { lte: to } : {}),
                        },
                      },
                      {
                        created_date: {
                          ...(from ? { gte: from } : {}),
                          ...(to ? { lte: to } : {}),
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {};

    const totalActivities = await prisma.project_activity.count({
      where: projectDateWhere,
    });

    const activitiesByFaculty = await prisma.registration_activity.groupBy({
      by: ['faculty'],
      where: registrationWhere, // === ADD
      _count: { faculty: true },
    });

    const activitiesByStatus = await prisma.project_activity.groupBy({
      by: ['project_status'],
      where: projectDateWhere, // === ADD
      _count: { project_status: true },
    });

    const activitiesByDepartment = await prisma.project_activity.groupBy({
    by: ['department'],
    where: projectDateWhere, // ถ้ามี where ช่วงวันอยู่แล้ว ใช้ร่วมได้
    _count: { department: true },
  });

    const stats: DashboardStats = {
      totalActivities,
      activitiesByFaculty: activitiesByFaculty.map((item) => ({
        faculty: item.faculty,
        count: item._count.faculty,
      })),
      activitiesByStatus: activitiesByStatus.map((item) => ({
        status: item.project_status,
        count: item._count.project_status,
      })),
      activitiesByDepartment: activitiesByDepartment.map(i => ({
         department: i.department, count: i._count.department })),
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActivities = async (req: Request, res: Response) => {
  // === ADD: รองรับ from/to/ay
  const { faculty, status, department, page = '1', limit = '10' } = req.query as {
    faculty?: string;
    status?: string;
    department?: string;
    page?: string;
    limit?: string;
  };
  const { from, to } = getRangeFromQuery(req);

  try {
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // where หลักของ project_activity
    const where: any = {};

    if (faculty) {
      // registration_activity.some.faculty = faculty
      where.registration_activity = {
        some: { faculty: { equals: faculty } },
      };
    }

    if (status) {
      where.project_status = status;
    }

    if (department) {
    where.department = department as string;
  }

    // === ADD: กรองตามช่วงวันบน project_activity (created_date/project_datetime)
    if (from || to) {
      where.OR = [
        {
          created_date: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        },
        {
          project_datetime: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        },
      ];
    }

    const activities = await prisma.project_activity.findMany({
      where,
      skip,
      take: parseInt(limit, 10),
      include: {
        registration_activity: true,
        event_posts: true,
        user: true,
      },
      orderBy: { created_date: 'desc' },
    });

    const total = await prisma.project_activity.count({ where });

    res.json({
      activities,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};