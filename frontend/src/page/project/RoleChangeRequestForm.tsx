import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Navbar from '../../component/navbar';
import { User, UserRole } from '../../type/user';
import { createRoleRequest, listRoleRequests, cancelRoleRequest, RoleChangeRequest, RequestStatus } from '../../api/roleChange';
import { getUser } from '../../api/login';

const RoleChangeRequestForm: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<RoleChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  }, []);

  useEffect(() => {
    if (currentUser?.ms_id && currentUser?.role !== 'admin') {
      fetchUserRequests();
    }
  }, [currentUser?.ms_id]);

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

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      const data = await listRoleRequests({
        q: currentUser?.ms_id, // กรองเฉพาะคำร้องของผู้ใช้ปัจจุบัน
      });
      setRequests(data.items);
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

  if (currentUser?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-xl text-gray-700">ผู้ดูแลระบบไม่สามารถส่งคำร้องขอเปลี่ยนบทบาทได้</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4 ml-65">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          

          {/* Form for submitting role change request */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">แบบฟอร์มคำร้องขอเปลี่ยนบทบาท</h2>
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

          {/* User's Request List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <h2 className="text-xl font-semibold text-gray-800 p-6">ประวัติคำร้องของคุณ</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider rounded-tl-xl">ID คำร้อง</th>
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
                          {roleOptions.find(role => role.value === req.currentRole)?.label || req.currentRole || 'ไม่ระบุ'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            req.requestedRole === 'admin'
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
        </div>
      </div>
    </>
  );
};

export default RoleChangeRequestForm;
