import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';
import { User, UserRole } from '../types/user';

dotenv.config();

const prisma = new PrismaClient();

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'canceled';
type DecodedJwt = { ms_id: string; role: 'admin' | 'organizer' | 'user' };

const VALID_ROLES: UserRole[] = ['admin', 'organizer', 'user'];
const JWT_SECRET = process.env.JWT_SECRET || 'waffy04143';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        ms_id: string;
        role: UserRole;
      };
    }
  }
}
export {};

function requireAuth(req: Request): DecodedJwt {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }
  const token = auth.split(' ')[1];
  return jwt.verify(token, JWT_SECRET) as DecodedJwt;
}

function getAuth(req: Request): { ms_id: string; role: UserRole } {
  if (req.user?.ms_id && req.user?.role) {
    return { ms_id: req.user.ms_id, role: req.user.role };
  }
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET) as { ms_id: string; role: UserRole };
  return { ms_id: decoded.ms_id, role: decoded.role };
}

export const createRoleRequest = async (req: Request, res: Response) => {
  try {
    const { ms_id } = getAuth(req);

    const requestedRole = String(req.body?.requestedRole ?? '')
      .trim()
      .toLowerCase() as UserRole;
    const requestReason =
      typeof req.body?.reason === 'string' ? req.body.reason.slice(0, 1000) : undefined;

    if (!VALID_ROLES.includes(requestedRole)) {
      return res.status(400).json({ message: 'Invalid requestedRole' });
    }

    const user = await prisma.users_up.findUnique({ where: { ms_id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === requestedRole) {
      return res.status(400).json({ message: 'You already have this role' });
    }

    const pending = await prisma.roleChangeRequest.findFirst({
      where: { userId: ms_id, status: 'pending' },
      select: { id: true },
    });
    if (pending) {
      return res.status(409).json({ message: 'You already have a pending request', requestId: pending.id });
    }

    const created = await prisma.roleChangeRequest.create({
      data: {
        userId: ms_id,
        currentRole: user.role as UserRole,
        requestedRole,
        reason: requestReason,
      },
    });

    return res.status(201).json({ message: 'Request submitted', request: created });
  } catch (err: any) {
    const status = err?.status ?? 500;
    console.error('[createRoleRequest]', err);
    return res.status(status).json({ message: status === 401 ? 'Unauthorized' : 'Internal server error' });
  }
};

export const listRoleRequests = async (req: Request, res: Response) => {
  try {
    const { ms_id, role } = requireAuth(req);
    const isAdmin = role === 'admin';

    const { status, q, page = '1', pageSize = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const sizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    const statusFilter = status ? (String(status).toLowerCase() as RequestStatus) : undefined;

    const where: Prisma.RoleChangeRequestWhereInput = {
      ...(statusFilter ? { status: statusFilter } : {}),
    };

    if (isAdmin) {
      // แอดมิน: เห็นทั้งหมด + ค้นหาได้
      if (q) {
        where.OR = [
          { userId: { contains: q } },
          { reason: { contains: q } },
        ];
      }
    } else {
      // ผู้ใช้ทั่วไป: เห็นเฉพาะของตัวเอง
      where.userId = ms_id;
      // (ถ้าอยากให้ค้นหา reason ของตัวเองได้ ก็ไม่ต้องทำอะไรเพิ่ม)
    }

    const [items, total] = await Promise.all([
      prisma.roleChangeRequest.findMany({
        where,
        include: {
          user: { select: { ms_id: true, displayName: true, role: true } },
          reviewedByUser: { select: { ms_id: true, displayName: true } },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: (pageNum - 1) * sizeNum,
        take: sizeNum,
      }),
      prisma.roleChangeRequest.count({ where }),
    ]);

    return res.status(200).json({ total, page: pageNum, pageSize: sizeNum, items });
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.error('[listRoleRequests]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const approveRoleRequest = async (req: Request, res: Response) => {
  try {
    const { ms_id: adminId, role } = getAuth(req);
    if (role !== 'admin') return res.status(403).json({ message: 'Forbidden (admin only)' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });

    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.roleChangeRequest.findUnique({
        where: { id },
        include: { user: true },
      });
      if (!request) throw new Error('NOT_FOUND');
      if (request.status !== 'pending') throw new Error('ALREADY_RESOLVED');
      if (!VALID_ROLES.includes(request.requestedRole as UserRole)) throw new Error('INVALID_ROLE');

      await tx.users_up.update({
        where: { ms_id: request.userId },
        data: { role: request.requestedRole as UserRole },
      });

      const updatedReq = await tx.roleChangeRequest.update({
        where: { id },
        data: {
          status: 'approved',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      return updatedReq;
    });

    return res.status(200).json({ message: 'Approved and role updated', request: result });
  } catch (err: any) {
    console.error('[approveRoleRequest]', err);
    if (err?.message === 'NOT_FOUND') return res.status(404).json({ message: 'Request not found' });
    if (err?.message === 'ALREADY_RESOLVED') return res.status(409).json({ message: 'Request already resolved' });
    if (err?.message === 'INVALID_ROLE') return res.status(400).json({ message: 'Invalid requested role' });
    const status = err?.status ?? 500;
    return res.status(status).json({ message: status === 401 ? 'Unauthorized' : 'Internal server error' });
  }
};

export const rejectRoleRequest = async (req: Request, res: Response) => {
  try {
    const { ms_id: adminId, role } = getAuth(req);
    if (role !== 'admin') return res.status(403).json({ message: 'Forbidden (admin only)' });

    const id = Number(req.params.id);
    const { reviewNote } = req.body as { reviewNote?: string };
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });

    const request = await prisma.roleChangeRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(409).json({ message: 'Request already resolved' });

    const updated = await prisma.roleChangeRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reason: reviewNote?.slice(0, 1000),
      },
    });

    return res.status(200).json({ message: 'Rejected', request: updated });
  } catch (err: any) {
    const status = err?.status ?? 500;
    console.error('[rejectRoleRequest]', err);
    return res.status(status).json({ message: status === 401 ? 'Unauthorized' : 'Internal server error' });
  }
};

export const cancelMyRoleRequest = async (req: Request, res: Response) => {
  try {
    const { ms_id } = getAuth(req);

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });

    const request = await prisma.roleChangeRequest.findUnique({ where: { id } });
    if (!request || request.userId !== ms_id) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(409).json({ message: 'Request already resolved' });

    const canceled = await prisma.roleChangeRequest.update({
      where: { id },
      data: { status: 'canceled' },
    });

    return res.status(200).json({ message: 'Canceled', request: canceled });
  } catch (err: any) {
    const status = err?.status ?? 500;
    console.error('[cancelMyRoleRequest]', err);
    return res.status(status).json({ message: status === 401 ? 'Unauthorized' : 'Internal server error' });
  }
};