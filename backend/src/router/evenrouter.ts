import express, { Request, Response } from "express";
import { eventPost , getEventActivity } from "../controllers/eventcontroller";


const router = express.Router();

router.post("/postevent", async (req: Request, res: Response) => {
  await eventPost(req, res);
});

router.get("/getevent", async (req: Request, res: Response) => {
  await getEventActivity(req, res);
});

export default router;