import { Request, Response } from "express";
import {Prisma, PrismaClient} from "@prisma/client"
const prisma = new PrismaClient();


export const getProjectByUser = async (req: Request, res: Response) => {
  const { ms_id } = req.params; 

  if (!ms_id || typeof ms_id !== 'string') {
    return res.status(400).json({ message: 'ต้องระบุ ms_id และต้องเป็น string' });
  }

  try {
    const projects = await prisma.project_activity.findMany({
      where: {
        ms_id: ms_id, 
      },
      select: {
        project_id: true,
        project_name: true,
        created_date: true,
        project_status: true,
        approval_datetime: true,
        project_datetime: true,
        qrCodeData: true,
      },
    });

    
    const formattedProjects = projects.map((project) => ({
      ...project,
      created_date: project.created_date ? project.created_date.toISOString() : null,
      approval_datetime: project.approval_datetime ? project.approval_datetime.toISOString() : null,
      project_datetime: project.project_datetime ? project.project_datetime.toISOString() : null,
    }));

    res.status(200).json(formattedProjects);
  } catch (error) {
    console.error('!!! Error fetching projects by user !!!!', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโครงการ', error });
  }
};


export const getPostByUser = async (req: Request, res: Response) => {
  const { ms_id } = req.params;

  if (!ms_id || typeof ms_id !== 'string') {
    return res.status(400).json({ message: 'ต้องระบุ ms_id และต้องเป็น string' });
  }

  try {
    const posts = await prisma.event_posts.findMany({
      where: {
        ms_id: ms_id,
      },
      select: {
        post_id: true,
        post_content: true,
        post_date: true,
        post_datetime: true,
        hour_post: true,
        location_post: true,
        post_status: true,
        imge_url: true,
      },
      orderBy: {
        post_datetime: 'desc',
      },
    });

    // แปลง format วันที่ให้เป็น string (ISO)
    const formattedPosts = posts.map((post) => ({
      ...post,
      post_date: post.post_date ? post.post_date.toISOString() : null,
      post_datetime: post.post_datetime ? post.post_datetime.toISOString() : null,
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('!!! Error fetching posts by user !!!!', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์', error });
  }
};

export const getParticipantsByProjectId = async (req: Request, res: Response) => {
  try {
    const { project_id } = req.params;
    console.log("Received Project ID for participants:", project_id);

    if (!project_id) {
      return res.status(400).json({ message: "ไม่พบ ID โครงการ" });
    }

    const projectId = Number(project_id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "ID โครงการต้องเป็นตัวเลข" });
    }

    const participants = await prisma.activity_record.findMany({
      where: {
        project_id: projectId,
      },
      select: {
        id:true,
        ms_id: true,
        joined_at: true,
        evaluation_status: true,
        users_up: {
          select: {
            ms_id: true,
            givenName: true,
            surname: true,
            department:true,
          },
        },
      },
    });

    if (!participants.length) {
      return res.status(200).json({ message: "ไม่มีผู้เข้าร่วมในโครงการนี้", data: [] });
    }

    res.status(200).json({ data: participants });
  } catch (error) {
    console.error("!!! เกิดข้อผิดพลาดในการดึงรายชื่อผู้เข้าร่วม !!!", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงรายชื่อผู้เข้าร่วม", error });
  }
};


