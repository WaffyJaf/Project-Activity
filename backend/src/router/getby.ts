import express, { Request, Response } from "express";
import { getProjectByUser,getPostByUser , getParticipantsByProjectId } from "../controllers/getbycontroller";

const router = express.Router();



router.get("/:ms_id", async (req: Request, res: Response) => {
  await getProjectByUser(req, res);
});

router.get("/post/:ms_id", async (req: Request, res: Response) => {
  await getPostByUser(req, res);
});

router.get("/participants/:project_id", async (req: Request, res: Response) => {
  await getParticipantsByProjectId(req, res);
});







export default router;
