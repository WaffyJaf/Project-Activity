import express, { Request, Response } from "express";
import {
  createRoleRequest,
  listRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  cancelMyRoleRequest,
} from '../controllers/roleChangecontroller';

const router = express.Router();

// ผู้ใช้ส่งคำร้องขอเปลี่ยนสิทธิ์
router.post("/role-requests", async (req: Request, res: Response) => {
  await createRoleRequest(req, res);
});

//แอดมินดูรายการคำร้อง (ค้น/กรอง/แบ่งหน้า)
router.get("/role-requests", async (req: Request, res: Response) => {
  await listRoleRequests(req, res);
});

// แอดมินอนุมัติคำร้อง
router.post("/role-requests/:id/approve", async (req: Request, res: Response) => {
  await approveRoleRequest(req, res);
});

// แอดมินปฏิเสธคำร้อง
router.post("/role-requests/:id/reject", async (req: Request, res: Response) => {
  await rejectRoleRequest(req, res);
});

// ผู้ใช้ยกเลิกคำร้องของตนเอง
router.post("/role-requests/:id/cancel", async (req: Request, res: Response) => {
  await cancelMyRoleRequest(req, res);
});

export default router;


