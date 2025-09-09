import express, { Request, Response } from "express";
import { getHours } from "../controllers/hourscontroller";

const router = express.Router();



router.get("/hours/:msId?", async (req: Request, res: Response) => {
  await getHours(req, res);
});


export default router;
