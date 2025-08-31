import React, { useState, useEffect } from 'react';
import { updateUserRole, getUsers } from '../api/login';
import { User, UserRole } from '../type/user';
import Swal from 'sweetalert2';
import Navbar from '../component/navbar';

const AdminRoleManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UserRole เป็น union type => ใช้สตริงล้วน
  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'admin',     label: 'ผู้ดูแลระบบ' },
    { value: 'organizer', label: 'ผู้จัดกิจกรรม' },
    { value: 'user',      label: 'นักศึกษา' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await getUsers();
      setUsers(userData);
      setLoading(false);
    } catch {
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
        confirmButtonColor: '#9333ea',
      });
    }
  };

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    try {
      setLoading(true);

      // ส่งไป backend
      await updateUserRole(user.ms_id, newRole);

      // อัปเดต state โดยเทียบ ms_id (ไม่ใช้ id ที่อาจเป็น null)
      setUsers(prev =>
        prev.map(u => (u.ms_id === user.ms_id ? { ...u, role: newRole } : u)),
      );

      setLoading(false);
      const roleLabel = roleOptions.find(role => role.value === newRole)?.label || newRole;
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: `อัปเดตบทบาทเป็น ${roleLabel} เรียบร้อยแล้ว`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      setError('ไม่สามารถอัปเดตบทบาทได้');
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัปเดตบทบาทได้',
        confirmButtonColor: '#9333ea',
      });
    }
  };

  const roleBadgeClass = (role: UserRole | null) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
    if (role === 'organizer') return 'bg-blue-100 text-blue-700';
    if (role === 'user') return 'bg-gray-100 text-gray-700';
    return 'bg-gray-100 text-gray-500'; // เผื่อ null/ไม่รู้ค่า
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center drop-shadow-sm">
            จัดการบทบาทผู้ใช้
          </h1>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider rounded-tl-xl">MS ID</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider">ชื่อ</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider">นามสกุล</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider">ตำแหน่ง</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider">หน่วยงาน</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider">บทบาท</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider rounded-tr-xl">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => {
                    // กัน null role ด้วย fallback เพื่อผูก select ให้มีค่าเสมอ
                    const currentRole: UserRole = (user.role ?? 'user');

                    return (
                      <tr
                        key={user.ms_id} // ✅ ใช้ ms_id ที่ unique
                        className="hover:bg-purple-50 transition-colors duration-150 ease-in-out"
                      >
                        <td className="p-4 text-gray-700">{user.ms_id}</td>
                        <td className="p-4 text-gray-700">{user.givenName ?? '-'}</td>
                        <td className="p-4 text-gray-700">{user.surname ?? '-'}</td>
                        <td className="p-4 text-gray-700">{user.jobTitle ?? '-'}</td>
                        <td className="p-4 text-gray-700">{user.department ?? '-'}</td>

                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleBadgeClass(user.role)}`}>
                            {roleOptions.find(role => role.value === user.role)?.label || user.role || '-'}
                          </span>
                        </td>

                        <td className="p-4">
                          <select
                            value={currentRole} // ✅ ไม่เป็น null แล้ว
                            onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                            disabled={loading}
                            className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            {roleOptions.map(role => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminRoleManager;
