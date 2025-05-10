import express, { Request, Response } from "express";
import { SearchUsers , ActivityRecord } from "../controllers/activityhourcontroller";

const router = express.Router();

router.get("/search-users", async (req: Request, res: Response) => {
  await SearchUsers(req, res);
});

router.post("/activityrecord", async (req: Request, res: Response) => {
  await ActivityRecord(req, res);
});

export default router;