// src/components/RoleChangeRequestManager.tsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Navbar from '../component/navbar';
import { User, UserRole } from '../type/user';
import {
  createRoleRequest,
  listRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  cancelRoleRequest,
  RoleChangeRequest,
  RequestStatus,
} from '../api/roleChange';
import { getUser } from '../api/login';

const RoleChangeRequestManager: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<RoleChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRole, setNewRole] = useState<UserRole | ''>('');
  const [reason, setReason] = useState('');

   const roleOptions: { value: UserRole | ''; label: string }[] = [
    { value: '', label: 'เลือกบทบาท' },
    { value: 'admin', label: 'ผู้ดูแลระบบ' },
    { value: 'organizer', label: 'ผู้จัดกิจกรรม' },
    { value: 'user', label: 'นักศึกษา' },
  ];

  const statusOptions: { value: RequestStatus | ''; label: string }[] = [
    { value: '', label: 'ทั้งหมด' },
    { value: 'pending', label: 'รอดำเนินการ' },
    { value: 'approved', label: 'อนุมัติ' },
    { value: 'rejected', label: 'ปฏิเสธ' },
    { value: 'canceled', label: 'ยกเลิก' },
  ];

 
useEffect(() => {
  fetchCurrentUser();
  fetchRequests();
}, [page, statusFilter, searchQuery]);

// แยกเป็น 2 ชุด
useEffect(() => {
  fetchCurrentUser();
}, []);

useEffect(() => {
  if (currentUser?.role === 'admin') {
    fetchRequests();
  }
}, [page, statusFilter, searchQuery, currentUser?.role]);


  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const user = await getUser();
      setCurrentUser(user);
      setLoading(false);
    } catch (err: any) {
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
        confirmButtonColor: '#9333ea',
      });
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await listRoleRequests({
        status: statusFilter,
        q: searchQuery || undefined,
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      setRequests(data.items);
      setTotal(data.total);
      setLoading(false);
    } catch (err: any) {
      setError('ไม่สามารถโหลดคำร้องขอเปลี่ยนบทบาทได้');
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ไม่สามารถโหลดคำร้องขอเปลี่ยนบทบาทได้',
        confirmButtonColor: '#9333ea',
      });
    }
  };

  const handleSubmitRequest = async () => {
    if (!newRole) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเลือกบทบาท',
        text: 'โปรดเลือกบทบาทที่ต้องการขอเปลี่ยน',
        confirmButtonColor: '#9333ea',
      });
      return;
    }
    try {
      setLoading(true);
      const response = await createRoleRequest(newRole, reason);
      setRequests([...requests, response.request]);
      setNewRole('');
      setReason('');
      setLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'ส่งคำร้องขอเปลี่ยนบทบาทเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ไม่สามารถส่งคำร้องได้',
        confirmButtonColor: '#9333ea',
      });
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setLoading(true);
      const response = await approveRoleRequest(id);
      setRequests(requests.map(req => (req.id === id ? response.request : req)));
      setLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'อนุมัติคำร้องเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ไม่สามารถอนุมัติคำร้องได้',
        confirmButtonColor: '#9333ea',
      });
    }
  };

  const handleReject = async (id: number) => {
    const result = await Swal.fire({
      title: 'ระบุเหตุผลการปฏิเสธ',
      input: 'text',
      inputLabel: 'เหตุผล (ไม่บังคับ)',
      inputPlaceholder: 'กรุณาระบุเหตุผลการปฏิเสธ',
      showCancelButton: true,
      confirmButtonText: 'ปฏิเสธ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#9333ea',
      cancelButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await rejectRoleRequest(id, result.value || undefined);
        setRequests(requests.map(req => (req.id === id ? response.request : req)));
        setLoading(false);
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'ปฏิเสธคำร้องเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err: any) {
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err.response?.data?.message || 'ไม่สามารถปฏิเสธคำร้องได้',
          confirmButtonColor: '#9333ea',
        });
      }
    }
  };

  const handleCancel = async (id: number) => {
    const result = await Swal.fire({
      title: 'ยืนยันการยกเลิก',
      text: 'คุณต้องการยกเลิกคำร้องนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยกเลิกคำร้อง',
      cancelButtonText: 'ปิด',
      confirmButtonColor: '#9333ea',
      cancelButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await cancelRoleRequest(id);
        setRequests(requests.map(req => (req.id === id ? response.request : req)));
        setLoading(false);
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'ยกเลิกคำร้องเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err: any) {
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err.response?.data?.message || 'ไม่สามารถยกเลิกคำร้องได้',
          confirmButtonColor: '#9333ea',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-xl text-purple-600 animate-pulse">กำลังโหลด...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-xl text-red-600">ข้อผิดพลาด: {error}</div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4 ml-65">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center drop-shadow-sm">
            จัดการคำร้องขอเปลี่ยนบทบาท
          </h1>

          {/* Form for submitting role change request (non-admin users) */}
          {!isAdmin && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">ส่งคำร้องขอเปลี่ยนบทบาท</h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">บทบาทที่ต้องการ</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    disabled={loading}
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">เหตุผล</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    rows={4}
                    placeholder="ระบุเหตุผลสำหรับการขอเปลี่ยนบทบาท (ไม่บังคับ)"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleSubmitRequest}
                  disabled={loading || !newRole}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  ส่งคำร้อง
                </button>
              </div>
            </div>
          )}

          {/* Admin: Filter and Request List */}
          {isAdmin && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">ตัวกรอง</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">สถานะ</label>
                  <select
                    value={statusFilter || ''}
                    onChange={(e) => setStatusFilter((e.target.value as RequestStatus) || undefined)}
                    className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ค้นหา</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    placeholder="ค้นหาด้วย userId หรือเหตุผล"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Request List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider rounded-tl-xl">ID คำร้อง</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider">ผู้ใช้</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider">บทบาทปัจจุบัน</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider">บทบาทที่ร้องขอ</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider">เหตุผล</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider">สถานะ</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider">ผู้ตรวจสอบ</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider rounded-tr-xl">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map(req => (
                    <tr
                      key={req.id}
                      className="hover:bg-purple-50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="p-4 text-gray-700">{req.id}</td>
                      <td className="p-4 text-gray-700">{req.user.displayName || req.user.ms_id}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            req.currentRole === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : req.currentRole === 'organizer'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {roleOptions.find(role => role.value === req.currentRole)?.label || req.currentRole}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            req.currentRole === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : req.requestedRole === 'organizer'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {roleOptions.find(role => role.value === req.requestedRole)?.label || req.requestedRole}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">{req.reason || '-'}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            req.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : req.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : req.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusOptions.find(status => status.value === req.status)?.label || req.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">{req.reviewedByUser?.displayName || req.reviewedBy || '-'}</td>
                      <td className="p-4">
                        {req.status === 'pending' && isAdmin && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={loading}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              อนุมัติ
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              disabled={loading}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              ปฏิเสธ
                            </button>
                          </div>
                        )}
                        {req.status === 'pending' && req.userId === currentUser?.ms_id && (
                          <button
                            onClick={() => handleCancel(req.id)}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {isAdmin && total > pageSize && (
            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              <span className="px-4 py-2 text-gray-700">
                หน้า {page} จาก {Math.ceil(total / pageSize)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total || loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RoleChangeRequestManager;