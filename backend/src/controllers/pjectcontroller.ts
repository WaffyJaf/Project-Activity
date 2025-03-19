import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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
        project_status: 'pending',                

      },
    });

    console.log("save to database successfully");
    res.status(201).json({message: "Project activity created successfully"});

  } catch (error) {
    console.error("!!! Error save to database !!!!", error);
    return res.status(500).json({ message: "Error save to database", error });
  }

};


export const updateProjectActivity = async (req: Request,res: Response) =>{
  const {project_id, project_status} = req.body;

  if(!project_id || !project_status){
    return res.status(400).json({Message: "ข้อมูลไม่ครบถ้วน",});

  }

  try{
    const updateProject = await prisma.project_activity.update({
      where: {project_id},
      data: {project_status},
    });

    console.log("Update to database");
    res.status(200).json({message: "Update to database",project_id,project_status});

  }catch(error){
    console.error("!!! Erroe Update to Status !!!",error);
    return res.status(500).json({message: "!!! Erroe Update to Status !!!",error});
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
        project_description: true,
        department: true,
        location: true,
        budget: true,
        hours: true,
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









