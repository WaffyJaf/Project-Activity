import express, { Request, Response } from "express";
import {getNotificationsByMsId,markNotificationAsRead} from '../controllers/notificationController';

const router = express.Router();



router.get("/", async (req: Request, res: Response) => {
  await getNotificationsByMsId(req, res);
});


router.put("/:id/read", async (req: Request, res: Response) => {
  await markNotificationAsRead(req, res);
});







export default router;
