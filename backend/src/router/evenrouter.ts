import express, { Request, Response } from "express";
import { eventPost } from "../controllers/eventcontroller";


const router = express.Router();

router.post("/postevent", async (req: Request, res: Response) => {
  await eventPost(req, res);
});

export default router;