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
    const { project_id, post_content, imge_url } = req.body;
  
    if (!project_id || !post_content) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" }); 
    }
  
    try {
     
      const newEvent = await prisma.event_posts.create({
        data: {
          project_id: Number(project_id), 
          post_content,
          imge_url, 
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
    const { project_id, post_id, student_id, student_name, faculty } = req.body;
  
    if (!project_id || !post_id || !student_id || !student_name || !faculty) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
    }
  
    try {
      const newRegister = await prisma.registration_activity.create({
        data: {
          project_id: Number(project_id), 
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
      // ตรวจสอบว่า post_id เป็นตัวเลขหรือไม่
      const postId = Number(post_id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "ID โครงการต้องเป็นตัวเลข" });
      }
  
      // ดึงข้อมูลจาก registration_activity ตาม post_id
      const getregis = await prisma.registration_activity.findMany({
        where: {
          post_id: postId, 
        },
      });
  
      if (getregis.length === 0) {
        return res.status(404).json({ message: "ไม่พบข้อมูลผู้ลงทะเบียน" });
      }
  
      // ดึงข้อมูล project_activity ตาม post_id
      const getprojectid = await prisma.registration_activity.findMany({
        where: {
          post_id: postId, // ใช้ post_id ในการค้นหา
        },
        select: {
          post_id: true,
          student_id: true,
          student_name: true,
          faculty: true,
        },
      });
  
      if (!getprojectid) {
        return res.status(404).json({ message: "ไม่พบข้อมูลโครงการที่เกี่ยวข้อง" });
      }
  
      // ส่งผลลัพธ์ข้อมูลผู้ลงทะเบียนพร้อมข้อมูลโครงการ
      res.status(200).json({ registrations: getregis, projectDetails: getprojectid });
    } catch (error) {
      console.error("!!! Error fetching registrations !!!", error);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error });
    } finally {
      await prisma.$disconnect();
    }
  };
  
  
  

export const getEventActivity = async (req: Request, res: Response) => {
  try {
    const getevent = await prisma.event_posts.findMany({
      select: {
        post_id: true,
        post_content: true,
        post_date: true,
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




        
    