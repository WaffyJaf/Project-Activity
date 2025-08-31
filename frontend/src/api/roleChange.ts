// src/api/roleChange.ts
import axios from 'axios';
import type { UserRole } from '../type/user';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'canceled';

export interface RoleChangeRequest {
  id: number;
  userId: string;
  currentRole: UserRole;
  requestedRole: UserRole;
  reason?: string;
  status: RequestStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: { ms_id: string; displayName: string | null; role: UserRole | null };
  reviewedByUser?: { ms_id: string; displayName: string | null } | null;
}

// ✅ ตั้ง base URL แบบเรียบง่าย
const API_URL = 'http://localhost:3000/api';

// ✅ ใช้คีย์โทเคนให้ตรงกับตอน login เก็บ (เช่น 'authToken')
const TOKEN_KEY = 'authToken';

const authHeaders = () => {
  const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
};

type CreateRoleRequestResponse = { message: string; request: RoleChangeRequest };
type ListRoleRequestsResponse = { total: number; page: number; pageSize: number; items: RoleChangeRequest[] };

export const createRoleRequest = async (requestedRole: UserRole, reason?: string) => {
  const { data } = await axios.post<CreateRoleRequestResponse>(
    `${API_URL}/role-requests`,
    { requestedRole, reason },
    { headers: authHeaders() }
  );
  return data;
};

export const listRoleRequests = async (params: {
  status?: RequestStatus;
  q?: string;
  page?: string;
  pageSize?: string;
}) => {
  const { data } = await axios.get<ListRoleRequestsResponse>(
    `${API_URL}/role-requests`,
    { params, headers: authHeaders() }
  );
  return data;
};

export const approveRoleRequest = async (id: number) => {
  const { data } = await axios.post<CreateRoleRequestResponse>(
    `${API_URL}/role-requests/${id}/approve`,
    {},
    { headers: authHeaders() }
  );
  return data;
};

export const rejectRoleRequest = async (id: number, reviewNote?: string) => {
  // ถ้า backend คาดว่าเป็น { reason } ให้เปลี่ยน key ด้านล่างนี้
  const payload = reviewNote ? { reviewNote } : {};
  const { data } = await axios.post<CreateRoleRequestResponse>(
    `${API_URL}/role-requests/${id}/reject`,
    payload,
    { headers: authHeaders() }
  );
  return data;
};

export const cancelRoleRequest = async (id: number) => {
  const { data } = await axios.post<CreateRoleRequestResponse>(
    `${API_URL}/role-requests/${id}/cancel`,
    {},
    { headers: authHeaders() }
  );
  return data;
};
