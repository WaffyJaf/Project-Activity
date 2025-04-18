import express, { Request, Response } from "express";
import { createProjectActivity, updateProjectActivity , getProjectActivity, getProjectActivityByID } from "../controllers/pjectcontroller"; 

const router = express.Router();


router.post("/createproject", async (req: Request, res: Response) => {
  await createProjectActivity(req, res);
});

router.patch("/statusproject/:project_id", async (req: Request, res: Response) => {
  await updateProjectActivity(req, res);
});

router.get("/getproject", async (req: Request, res: Response) => {
  await getProjectActivity(req, res);
});

router.get("/projectid/:id", async (req: Request, res: Response) => {
  await getProjectActivityByID(req, res);
});

export default router;
