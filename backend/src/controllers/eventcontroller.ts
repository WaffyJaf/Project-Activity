import { Request, Response } from "express";
import {Prisma, PrismaClient} from "@prisma/client"

const prisma = new PrismaClient();


export const eventPost = async (req: Request,res:Response) => {
    const {project_id, post_content, imge_url} = req.body;

    if(!project_id || !post_content){
        return res.status(400).json({message: "ข้อมูลไม่ครบถ้วน",});
    }
    try{
        const newEvent = await prisma.event_posts.create({
            data:{
                project_id,
                post_content,
                imge_url,
            },
        });
        console.log("Save to database");
        res.status(200).json({message: "event post save successfully ", });

    }catch (error){
        console.error("!!! Error Save to database !!!",error);
        return res.status(500).json({message: "Erro save to database",error});
     }
};
    

 

export const registerActivity = async (req: Request,res: Response) =>{
    const {project_id, post_id, student_id, student_name, faculty} = req.body;

    if( !project_id || !post_id || !student_id || !student_name || ! faculty){
        return res.status(400).json({message: "ข้อมูลไม่ครบถ้วน",});
    }

    try{
        const newRegister = await prisma.registration_activity.create({
            data:{
                project_id,
                post_id,
                student_id,
                student_name,
                faculty,
            },
        });
        console.log("Save to database");
        res.status(200).json({message: "event post save successfully ", });

    }catch (error){
        console.error("!!! Error Save to database !!!",error);
        return res.status(500).json({message: "Erro save to database",error});
     }
};
        
    