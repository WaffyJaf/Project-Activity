import { Request, Response } from "express";
import { PrismaClient, project_activity_project_status } from "@prisma/client";

const prisma = new PrismaClient();

export const createProjectActivity = async (req: Request, res: Response) => {
  const { project_name, project_description, project_datetime , department, location, budget, hours } = req.body;

  if (!project_name || !project_description || !project_datetime || !department || !location || !budget || !hours) {
    return res.status(400).json({ Message: "ข้อมูลไม่ครบถ้วน" });
  }

    
  const projectDate = new Date(project_datetime);
  if (isNaN(projectDate.getTime())) {
      return res.status(400).json({ Message: "วันที่และเวลาที่ส่งมาไม่ถูกต้อง" });
  }
  
    try{
    const newProject = await prisma.project_activity.create({
      data:{
        project_name,          
        project_description,           
        department,                                 
        location,                                    
        budget,                                  
        hours,
        project_datetime: projectDate,               

      },
    });

    console.log("save to database successfully");
    res.status(201).json({message: "Project activity created successfully"});

  } catch (error) {
    console.error("!!! Error save to database !!!!", error);
    return res.status(500).json({ message: "Error save to database", error });
  }

};



export const updateProjectActivity = async (req: Request, res: Response) => {
  const { project_id } = req.params;
  const { project_status } = req.body;

  // ตรวจสอบข้อมูลที่ส่งมา
  if (!project_id || isNaN(Number(project_id))) {
    return res.status(400).json({ message: "project_id ไม่ครบถ้วนหรือไม่ใช่ตัวเลข" });
  }
  if (!project_status || typeof project_status !== 'string') {
    return res.status(400).json({ message: "project_status ไม่ครบถ้วนหรือไม่ใช่สตริง" });
  }

  // ตรวจสอบว่า project_status เป็นค่าที่ถูกต้องใน enum
  const validStatuses = Object.values(project_activity_project_status); // ["pending", "approved", "rejected"]
  if (!validStatuses.includes(project_status as project_activity_project_status)) {
    return res.status(400).json({
      message: `project_status ต้องเป็นหนึ่งใน: ${validStatuses.join(', ')}`,
    });
  }

  try {
    const projectIdNum = Number(project_id);

    // ค้นหาโครงการ
    const existingProject = await prisma.project_activity.findUnique({
      where: { project_id: projectIdNum },
    });

    if (!existingProject) {
      return res.status(404).json({ message: "ไม่พบโครงการ" });
    }

    // อัปเดตสถานะ
    const updatedProject = await prisma.project_activity.update({
      where: { project_id: projectIdNum },
      data: {
        project_status: { set: project_status as project_activity_project_status },
        approval_datetime: new Date(), 
      },
    });

    return res.status(200).json({ message: "อัปเดตสถานะสำเร็จ", data: updatedProject });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ", error });
  } finally {
    await prisma.$disconnect();
  }
};



export const getProjectActivity = async(req:Request,res:Response) => {
  try{
    const getproject = await prisma.project_activity.findMany({
      select: {
        project_id: true,
        project_name: true,
        created_date: true,
        project_status:true,
        approval_datetime: true,
        project_datetime: true,
      },
      orderBy:{
        created_date: 'desc',
      },
    });
    if(getproject.length == 0){
      return res.status(404).json({message: 'ไม่พบโครงการ'});
    }
    res.status(200).json(getproject);
  }catch(error){
  console.error("!!! เกิดข้อผิดพลาดในการดึงข้อมูลโครงการ' !!!",error);
  return res.status(500).json({message: "!!! เกิดข้อผิดพลาดในการดึงข้อมูลโครงการ' !!!",error});
  }
};

export const getProjectActivityByID = async(req: Request,res: Response) => {
  try{
    const{ id } =  req.params;
    console.log("Received ID:", id);
    if(!id) {
      return res.status(400).json({message: "'ไม่พบ ID โครงการ'"});
    }

    const projectId = Number(id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "ID โครงการต้องเป็นตัวเลข" });
    }

    const getprojectid = await prisma.project_activity.findUnique({
      where:{
        project_id: projectId,
      },

      select:{
        project_id: true,
        project_name: true,
        project_status: true,
        approval_datetime: true,
        project_description: true,
        department: true,
        location: true,
        budget: true,
        hours: true,
        created_date: true,
        project_datetime: true,

      }  
    });

    if (!getprojectid) {
      return res.status(404).json({ message: "ไม่พบโครงการตาม ID ที่ระบุ" });
    }

    res.status(200).json(getprojectid);

  }catch(error) {
    console.error("!!! เกิดข้อผิดพลาดในการดึงข้อมูลโครงการตาม ID !!!", error);
    return res.status(500).json({ message: "!!! เกิดข้อผิดพลาดในการดึงข้อมูลโครงการตาม ID !!!", error });
  }
};









