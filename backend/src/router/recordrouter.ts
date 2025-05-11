import express, { Request, Response } from "express";
import { SearchUsers , ActivityRecord,ActivityRecordMobile,JoinActivity } from "../controllers/activityhourcontroller";

const router = express.Router();

router.get("/search-users", async (req: Request, res: Response) => {
  await SearchUsers(req, res);
});

router.post("/activityrecord", async (req: Request, res: Response) => {
  await ActivityRecord(req, res);
});

router.post("/activityrecord2", async (req: Request, res: Response) => {
  await ActivityRecordMobile(req, res);
});

router.post("/joinactivity", async (req: Request, res: Response) => {
  await JoinActivity(req, res);
});

export default router;