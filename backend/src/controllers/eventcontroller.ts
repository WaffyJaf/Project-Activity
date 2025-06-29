import { Request, response, Response } from "express";
import {Prisma, PrismaClient} from "@prisma/client"
import multer from "multer";
import path from "path";

const prisma = new PrismaClient();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join('D:/ActivityUP/backend/uploads')); 
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); 
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ไม่เกิน 5MB
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
  
      if (extname && mimetype) {
        return cb(null, true); // อนุญาตให้ไฟล์ที่เป็นภาพ
      } else {
        return cb(new Error("Only image files are allowed!")); // ถ้าไม่ใช่ไฟล์ภาพจะให้เกิดข้อผิดพลาด
      }
    },
  }).single("image"); 

  export const uploadImage = (req: Request, res: Response) => {
    upload(req, res, (err) => {
      if (err instanceof Error) {
        return res.status(400).json({ message: err.message }); 
      }
      console.log("File received:", req.file);
  
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // สร้าง URL ของไฟล์ที่อัปโหลด
      return res.status(200).json({ imageUrl }); // ส่ง URL ของไฟล์กลับไป
    });
  };

  export const eventPost = async (req: Request, res: Response) => {
  const { project_id, post_content, imge_url, location_post, post_datetime, hour_post, ms_id, registration_start, registration_end } = req.body;

  // Validate required fields
  if (!project_id || !post_content || !ms_id) {
    return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน: ต้องระบุ project_id, post_content, และ ms_id" });
  }

  // Validate dates
  const postDate = new Date(post_datetime);
  if (isNaN(postDate.getTime())) {
    return res.status(400).json({ message: 'วันที่และเวลาที่ส่งมาไม่ถูกต้อง' });
  }

  // Validate registration period if provided
  let regStart: Date | null = null;
  let regEnd: Date | null = null;
  if (registration_start && registration_end) {
    regStart = new Date(registration_start);
    regEnd = new Date(registration_end);
    if (isNaN(regStart.getTime()) || isNaN(regEnd.getTime())) {
      return res.status(400).json({ message: 'วันที่ลงทะเบียนไม่ถูกต้อง' });
    }
    if (regStart >= regEnd) {
      return res.status(400).json({ message: 'วันที่เริ่มลงทะเบียนต้องมาก่อนวันที่สิ้นสุด' });
    }
    if (regStart < new Date()) {
      return res.status(400).json({ message: 'วันที่เริ่มลงทะเบียนต้องอยู่ในอนาคต' });
    }
  }

  try {
    // Verify project_id exists and is associated with ms_id
    const project = await prisma.project_activity.findFirst({
      where: {
        project_id: Number(project_id),
        ms_id: ms_id,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'ไม่พบโครงการที่เชื่อมโยงกับ ms_id นี้' });
    }

    const newEvent = await prisma.event_posts.create({
      data: {
        project_id: Number(project_id),
        post_content,
        imge_url,
        location_post,
        post_datetime: postDate,
        hour_post: hour_post ? Number(hour_post) : null,
        ms_id,
        registration_start: regStart || null, // Store registration period
        registration_end: regEnd || null,     // Store registration period
      },
    });

    console.log("✅ Save to database");
    return res.status(201).json({ message: "Event post saved successfully", data: newEvent });
  } catch (error) {
    console.error("❌ Error saving to database:", error);
    return res.status(500).json({ message: "Error saving to database", error });
  }
};
    
export const registerActivity = async (req: Request, res: Response) => {
  const { post_id, student_id, student_name, faculty } = req.body;

  if (!post_id || !student_id || !student_name || !faculty) {
    return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
  }

  try {
    const newRegister = await prisma.registration_activity.create({
      data: {
        post_id: Number(post_id),
        student_id,
        student_name,
        faculty,
      },
    });
    console.log("Saved to database:", newRegister);
    res.status(201).json({ message: "ลงทะเบียนสำเร็จ", data: newRegister });
  } catch (error) {
    console.error("!!! Error saving to database !!!", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึก", error });
  }
};

  
  export const getregisACtivity = async (req: Request, res: Response) => {
    const { post_id } = req.params;
  
    try {
      // ตรวจสอบว่า post_id เป็นตัวเลข
      const postId = Number(post_id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "ID กิจกรรมต้องเป็นตัวเลข" });
      }
  
      // ดึงข้อมูลผู้ลงทะเบียนจาก registration_activity
      const registrations = await prisma.registration_activity.findMany({
        where: { post_id: postId },
        select: {
          register_id: true,
          post_id: true,
          student_id: true,
          student_name: true,
          faculty: true,
        },
      });
  
      // คืน array ว่างหากไม่มีผู้ลงทะเบียน
      return res.status(200).json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ลงทะเบียน" });
    }
  };
  
  

  export const getEventActivity = async (req: Request, res: Response) => {
    try {
      const getevent = await prisma.event_posts.findMany({
        select: {
          post_id: true,
          post_content: true,
          post_date: true,
          post_datetime: true,
          hour_post: true,
          location_post:true,
          post_status: true,
          imge_url: true,
        },
        orderBy: {
          post_date: 'desc', // เรียงลำดับโพสต์จากใหม่ไปเก่า
        },
      });
  
      // ถ้าไม่พบโพสต์กิจกรรมใด ๆ
      if (getevent.length === 0) {
        return res.status(404).json({ message: 'ไม่พบ POST กิจกรรม' });
      }
  
      // ส่งข้อมูลกลับในรูปแบบ JSON
      return res.status(200).json(getevent);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์:", error);
  
      // ถ้ามีข้อผิดพลาดใด ๆ เกิดขึ้น ให้ตอบกลับด้วยสถานะ 500
      return res.status(500).json({
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์',
        error: error instanceof Error ? error.message : error,
      });
    }
  };
export const updateEvent = async (req: Request, res: Response) => {
  const { post_id } = req.params;
  const { post_content, post_status } = req.body;

  if (!post_id) {
    return res.status(400).json({ message: "ไม่มี ID กิจกรรม" });
  }

  try {
    // ค้นหากิจกรรมที่ต้องการอัปเดต
    const existingEvent = await prisma.event_posts.findUnique({
      where: { post_id: Number(post_id) },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: "ไม่พบกิจกรรมที่ต้องการแก้ไข" });
    }

    // อัปเดตข้อมูลกิจกรรม
    const updatedEvent = await prisma.event_posts.update({
      where: { post_id: Number(post_id) },
      data: {
        post_content,
        post_status,
      },
    });

    return res.status(200).json({ message: "อัปเดตกิจกรรมเรียบร้อย", data: updatedEvent });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตกิจกรรม:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตกิจกรรม", error });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  const { post_id } = req.params;  // ใช้ req.params เพื่อรับค่า post_id จาก URL
  
  if (!post_id) {
    return res.status(400).json({ message: "ไม่มี ID กิจกรรม" });
  }

  try {
    const existingEvent = await prisma.event_posts.findUnique({
      where: { post_id: Number(post_id) },  // ใช้ post_id ที่ได้รับจาก URL
    });

    if (!existingEvent) {
      return res.status(404).json({ message: "ไม่พบกิจกรรมที่ต้องการลบ" });
    }

    // ลบกิจกรรม
    await prisma.event_posts.delete({
      where: { post_id: Number(post_id) },
    });

    return res.status(200).json({ message: "ลบกิจกรรมเรียบร้อย" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบกิจกรรม:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบกิจกรรม", error });
  }
};

export const deleteRegis = async (req: Request, res: Response) => {
  const { register_id } = req.params;

  
  if (!register_id) {
    return res.status(400).json({ message: "ไม่พบ register_id ในคำขอ" });
  }

  const parsedRegisterId = Number(register_id);
  if (isNaN(parsedRegisterId)) {
    return res.status(400).json({ message: "register_id ต้องเป็นตัวเลขที่ถูกต้อง" });
  }

  try {
    
    const existingEvent = await prisma.registration_activity.findUnique({
      where: { register_id: parsedRegisterId },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: "ไม่พบการลงทะเบียนที่ต้องการลบ" });
    }

    
    await prisma.registration_activity.delete({
      where: { register_id: parsedRegisterId },
    });

    return res.status(200).json({ message: "ลบการลงทะเบียนเรียบร้อย" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบการลงทะเบียน:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบการลงทะเบียน" });
  }
};

export const addRegis = async (req: Request, res: Response) => {
  const { post_id, student_id, student_name, faculty } = req.body;

  if (!post_id || !student_id?.trim() || !student_name?.trim() || !faculty?.trim()) {
    return res.status(400).json({ message: "กรุณาระบุข้อมูลที่จำเป็นทั้งหมด: post_id, รหัสนักศึกษา, ชื่อ-นามสกุล, คณะ" });
  }

  try {
    const parsedPostId = Number(post_id);
    if (isNaN(parsedPostId)) {
      return res.status(400).json({ message: "post_id ต้องเป็นตัวเลขที่ถูกต้อง" });
    }

    // ตรวจสอบว่ารหัสนักศึกษาเป็นตัวเลข 8 หลัก (ถ้าต้องการ)
    if (!/^\d{8}$/.test(student_id)) {
      return res.status(400).json({ message: "รหัสนักศึกษาต้องเป็นตัวเลข 8 หลัก" });
    }

    const newRegistration = await prisma.registration_activity.create({
      data: {
        post_id: parsedPostId,
        student_id,
        student_name,
        faculty,
      },
    });

    return res.status(201).json({
      message: "เพิ่มผู้ลงทะเบียนเรียบร้อย",
      data: newRegistration,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเพิ่มผู้ลงทะเบียน:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มผู้ลงทะเบียน" });
  }
};



        
    