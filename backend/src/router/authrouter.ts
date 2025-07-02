import express, { Request, Response } from "express";
import {login, getUsers , microsoftCallback , getUser} from "../controllers/authcontroller";
import {updateRole} from "../controllers/authcontroller"


const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
  await login(req, res);
});

router.get("/microsoft/callback", async (req: Request, res: Response) => {
  await microsoftCallback(req, res);
});

router.post("/updaterole", async (req: Request, res: Response) => {
  await updateRole(req, res); 
});

router.get("/getusers", async (req: Request, res: Response) => {
  await getUsers(req, res);
});

router.get("/getuser", async (req: Request, res: Response) => {
  await getUser(req, res);
});


export default router;