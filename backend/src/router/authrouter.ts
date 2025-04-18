import express, { Request, Response } from "express";
import {login, updateRole, getUsers} from "../controllers/authcontroller"


const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
  await login(req, res);
});

router.post("/updaterole", async (req: Request, res: Response) => {
  await updateRole(req, res);
});

router.get("/getusers", async (req: Request, res: Response) => {
  await getUsers(req, res);
});

export default router;