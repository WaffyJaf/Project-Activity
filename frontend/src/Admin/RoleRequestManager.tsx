// src/components/RoleChangeRequestManager.tsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Navbar from '../component/navbar';
import { User, UserRole } from '../type/user';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate()

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
        confirmButtonColor: '#1e40af',
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
        confirmButtonColor: '#1e40af',
      });
    }
  };

  const handleSubmitRequest = async () => {
    if (!newRole) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเลือกบทบาท',
        text: 'โปรดเลือกบทบาทที่ต้องการขอเปลี่ยน',
        confirmButtonColor: '#1e40af',
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
        title: 'ส่งคำร้องสำเร็จ',
        text: 'ส่งคำร้องขอเปลี่ยนบทบาทเรียบร้อยแล้ว',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ไม่สามารถส่งคำร้องได้',
        confirmButtonColor: '#1e40af',
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
        title: 'อนุมัติสำเร็จ',
        text: 'อนุมัติคำร้องเรียบร้อยแล้ว',
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate('/home');
      });
    } catch (err: any) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ไม่สามารถอนุมัติคำร้องได้',
        confirmButtonColor: '#1e40af',
      });
    }
  };

  const handleReject = async (id: number) => {
    const result = await Swal.fire({
      title: 'ระบุเหตุผลการปฏิเสธ',
      input: 'textarea',
      inputLabel: 'เหตุผลการปฏิเสธ (ไม่บังคับ)',
      inputPlaceholder: 'กรุณาระบุเหตุผลในการปฏิเสธคำร้องนี้...',
      showCancelButton: true,
      confirmButtonText: 'ปฏิเสธคำร้อง',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      inputAttributes: {
        'aria-label': 'เหตุผลการปฏิเสธ'
      }
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await rejectRoleRequest(id, result.value || undefined);
        setRequests(requests.map(req => (req.id === id ? response.request : req)));
        setLoading(false);
        Swal.fire({
          icon: 'success',
          title: 'ปฏิเสธสำเร็จ',
          text: 'ปฏิเสธคำร้องเรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err: any) {
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err.response?.data?.message || 'ไม่สามารถปฏิเสธคำร้องได้',
          confirmButtonColor: '#1e40af',
        });
      }
    }
  };

  const handleCancel = async (id: number) => {
    const result = await Swal.fire({
      title: 'ยืนยันการยกเลิกคำร้อง',
      text: 'คุณต้องการยกเลิกคำร้องขอเปลี่ยนบทบาทนี้หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยกเลิกคำร้อง',
      cancelButtonText: 'ไม่ยกเลิก',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await cancelRoleRequest(id);
        setRequests(requests.map(req => (req.id === id ? response.request : req)));
        setLoading(false);
        Swal.fire({
          icon: 'success',
          title: 'ยกเลิกสำเร็จ',
          text: 'ยกเลิกคำร้องเรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err: any) {
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err.response?.data?.message || 'ไม่สามารถยกเลิกคำร้องได้',
          confirmButtonColor: '#1e40af',
        });
      }
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl font-medium text-slate-700">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 ml-65">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
         

          {/* Form for submitting role change request (non-admin users) */}
          {!isAdmin && (
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200/60 p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">ส่งคำร้องใหม่</h2>
              </div>
              
              <div className="grid gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      บทบาทที่ต้องการ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full p-4 border border-slate-300 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                      disabled={loading}
                    >
                      {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      สถานะปัจจุบัน
                    </label>
                    <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                        currentUser?.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : currentUser?.role === 'organizer'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {roleOptions.find(role => role.value === currentUser?.role)?.label || currentUser?.role}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    เหตุผลในการขอเปลี่ยนบทบาท
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-4 border border-slate-300 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm resize-none"
                    rows={4}
                    placeholder="กรุณาระบุเหตุผลสำหรับการขอเปลี่ยนบทบาท เช่น ความจำเป็นในการใช้งาน หน้าที่ความรับผิดชอบใหม่ เป็นต้น..."
                    disabled={loading}
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={handleSubmitRequest}
                    disabled={loading || !newRole}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        กำลังส่งคำร้อง...
                      </div>
                    ) : (
                      'ส่งคำร้องขอเปลี่ยนบทบาท'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin: Filter and Request List */}
          {isAdmin && (
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200/60 p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                  </svg>
                </div>
                 <h2 className="text-2xl font-bold text-slate-800">คำร้องขอเปลี่ยนบทบาท</h2>
               
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">สถานะคำร้อง</label>
                  <select
                    value={statusFilter || ''}
                    onChange={(e) => setStatusFilter((e.target.value as RequestStatus) || undefined)}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">ค้นหาผู้ใช้</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-120 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 p-3 border border-slate-300 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm "
                      placeholder="ค้นหาโดยชื่อผู้ใช้หรือ MS ID"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Request List */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden">
            <div className="bg-purple-800 p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">
                  รายการคำร้อง
                  {total > 0 && (
                    <span className="text-slate-300 font-normal ml-2">
                      (ทั้งหมด {total.toLocaleString()} รายการ)
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              {requests.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-slate-600 mb-2">ไม่มีคำร้องขอ</h4>
                  <p className="text-slate-500">ยังไม่มีคำร้องขอเปลี่ยนบทบาทในระบบ</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-6 font-bold text-sm text-slate-700 uppercase tracking-wider">ID</th>
                      <th className="p-6 font-bold text-sm text-slate-700 uppercase tracking-wider">ผู้ใช้</th>
                      <th className="p-6 font-bold text-sm text-slate-700 uppercase tracking-wider">บทบาทปัจจุบัน</th>
                      <th className="p-6 font-bold text-sm text-slate-700 uppercase tracking-wider">บทบาทที่ร้องขอ</th>
                      <th className="p-6 font-bold text-sm text-slate-700 uppercase tracking-wider">เหตุผล</th>
                      <th className="p-6 font-bold text-sm text-slate-700 uppercase tracking-wider">สถานะ</th>
                      <th className="p-6 font-bold text-sm text-slate-700 uppercase tracking-wider">ผู้ตรวจสอบ</th>
                      <th className="p-6 font-bold text-sm text-slate-700 uppercase tracking-wider">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map(req => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50 transition-colors duration-200"
                      >
                        <td className="p-6 font-mono text-sm font-semibold text-slate-800">
                          {req.id.toString().padStart(4)}
                        </td>
                        <td className="p-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-800 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-semibold text-sm">
                                {(req.user.displayName || req.user.ms_id).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">
                                {req.user.displayName || 'ไม่ระบุชื่อ'}
                              </div>
                              <div className="text-sm text-slate-500 font-mono">
                                {req.user.ms_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                              req.currentRole === 'admin'
                                ? ' text-purple-800 border border-purple-200'
                                : req.currentRole === 'organizer'
                                ? ' text-blue-800 border border-blue-200'
                                : ' text-gray-800 border border-gray-200'
                            }`}
                          >
                            {roleOptions.find(role => role.value === req.currentRole)?.label || req.currentRole}
                          </span>
                        </td>
                        <td className="p-6">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                              req.requestedRole === 'admin'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : req.requestedRole === 'organizer'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}
                          >
                            {roleOptions.find(role => role.value === req.requestedRole)?.label || req.requestedRole}
                          </span>
                        </td>
                        <td className="p-6 text-center">
                          {req.reason ? (
                            <button
                              onClick={() =>
                                Swal.fire({
                                  title: 'เหตุผลการขอเปลี่ยนบทบาท',
                                  text: req.reason,
                                  icon: 'info',
                                  confirmButtonColor: '#7c1eaf',
                                })
                              }
                              className="inline-flex items-center px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              <svg className="w-5 h-5 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              ดู
                            </button>
                          ) : (
                            <span className="text-slate-400 italic text-sm">ไม่ได้ระบุ</span>
                          )}
                        </td>
                        <td className="p-6">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                              req.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : req.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : req.status === 'rejected'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              req.status === 'pending'
                                ? 'bg-amber-500'
                                : req.status === 'approved'
                                ? 'bg-emerald-500'
                                : req.status === 'rejected'
                                ? 'bg-red-500'
                                : 'bg-gray-500'
                            }`}></div>
                            {statusOptions.find(status => status.value === req.status)?.label || req.status}
                          </span>
                        </td>
                        <td className="p-6">
                          {req.reviewedByUser?.displayName || req.reviewedBy ? (
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-slate-700">
                                {req.reviewedByUser?.displayName || req.reviewedBy}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-sm">รอดำเนินการ</span>
                          )}
                        </td>
                        <td className="p-6">
                          <div className="flex space-x-2">
                            {req.status === 'pending' && isAdmin && (
                              <>
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  disabled={loading}
                                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  อนุมัติ
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  disabled={loading}
                                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-200 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                  ปฏิเสธ
                                </button>
                              </>
                            )}
                            {req.status === 'pending' && req.userId === currentUser?.ms_id && (
                              <button
                                onClick={() => handleCancel(req.id)}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 focus:ring-4 focus:ring-amber-200 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                ยกเลิก
                              </button>
                            )}
                            {req.status !== 'pending' && (
                              <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                                ดำเนินการแล้ว
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Pagination */}
          {isAdmin && total > pageSize && (
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-2">แสดงรายการ</span>
                  <span className="font-semibold text-slate-800">
                    {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)}
                  </span>
                  <span className="mx-2">จาก</span>
                  <span className="font-semibold text-slate-800">{total.toLocaleString()}</span>
                  <span className="ml-2">รายการ</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1 || loading}
                    className="inline-flex items-center px-4 py-2 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 focus:ring-4 focus:ring-slate-200 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    ก่อนหน้า
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(Math.ceil(total / pageSize), page - 2 + i));
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 text-sm font-semibold rounded-lg transition-all duration-200 ${
                            pageNum === page
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * pageSize >= total || loading}
                    className="inline-flex items-center px-4 py-2 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 focus:ring-4 focus:ring-slate-200 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {loading && requests.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center space-x-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-medium text-slate-700">กำลังดำเนินการ...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RoleChangeRequestManager;