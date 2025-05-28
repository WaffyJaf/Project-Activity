import express, { Request, Response } from "express";
import { getProjectByUser,getPostByUser } from "../controllers/getbycontroller";

const router = express.Router();



router.get("/:ms_id", async (req: Request, res: Response) => {
  await getProjectByUser(req, res);
});

router.get("/post/:ms_id", async (req: Request, res: Response) => {
  await getPostByUser(req, res);
});







export default router;
