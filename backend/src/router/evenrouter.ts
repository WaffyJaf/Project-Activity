import express, { Request, Response } from "express";
import { eventPost , getEventActivity , uploadImage ,updateEvent, deleteEvent } from "../controllers/eventcontroller";


const router = express.Router();

router.post("/postevent", async (req: Request, res: Response) => {
  await eventPost(req, res);
});

router.post("/uploadimage", async (req: Request, res: Response) => {
  await uploadImage(req, res);
});

router.get("/getevent", async (req: Request, res: Response) => {
  await getEventActivity(req, res);
});

router.put("/updatepost/:post_id", async (req: Request, res: Response) => {
  await updateEvent(req, res);
});

router.delete("/deletepost/:post_id", async (req: Request, res: Response) => {
  await deleteEvent(req, res); 
});



export default router;