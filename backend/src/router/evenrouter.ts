import express, { Request, Response } from "express";
import { eventPost , getEventActivity , uploadImage ,updateEvent, deleteEvent, registerActivity, getregisACtivity, deleteRegis, addRegis } from "../controllers/eventcontroller";


const router = express.Router();

router.post("/postevent", async (req: Request, res: Response) => {
  await eventPost(req, res);
});

router.post("/uploadimage", async (req: Request, res: Response) => {
  await uploadImage(req, res);
});

router.post("/regisactivity", async (req: Request, res: Response) => {
  await registerActivity(req, res);
});

router.get("/getevent", async (req: Request, res: Response) => {
  await getEventActivity(req, res);
});

router.get("/getregisactivity/:post_id", async (req: Request, res: Response) => {
  await getregisACtivity(req, res);
});

router.put("/updatepost/:post_id", async (req: Request, res: Response) => {
  await updateEvent(req, res);
});

router.delete("/deletepost/:post_id", async (req: Request, res: Response) => {
  await deleteEvent(req, res); 
});

router.delete("/deleteregis/:register_id", async (req: Request, res: Response) => {
  await deleteRegis(req, res); 
});

router.post("/addregis", async (req: Request, res: Response) => {
  await addRegis(req, res);
});

export default router;