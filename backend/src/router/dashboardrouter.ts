import express, { Request, Response } from "express";
import { getDashboardStats, getActivities } from '../controllers/dashboardcontroller';
const router = express.Router();



router.get("/dashboard", async (req: Request, res: Response) => {
  await getDashboardStats(req, res);
});

router.get("/dashboard/activities", async (req: Request, res: Response) => {
  await getActivities(req, res);
});


export default router;
