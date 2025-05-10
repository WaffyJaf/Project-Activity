import React, { useState, useEffect } from 'react';
import { updateUserRole, getUsers } from '../api/login';
import { User, UserRole } from '../type/user';
import Swal from 'sweetalert2';
import Navbar from '../component/navbar';

const AdminRoleManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'ผู้ดูแลระบบ' },
    { value: 'organizer', label: 'ผู้จัดกิจกรรม' }, 
    { value: 'user', label: 'นักศึกษา' },
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
    } catch (err) {
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
    
    await updateUserRole(user.ms_id, newRole); //ส่งไป backend
    
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, role: newRole } : u
    ));
    
    setLoading(false);
    const roleLabel = roleOptions.find(role => role.value === newRole)?.label || newRole;
    Swal.fire({
      icon: 'success',
      title: 'สำเร็จ!',
      text: `อัพเดทบทบาทเป็น ${roleLabel} เรียบร้อยแล้ว`,
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    setError('ไม่สามารถอัพเดทบทบาทได้');
    setLoading(false);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถอัพเดทบทบาทได้',
      confirmButtonColor: '#9333ea',
    });
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4 ml-50">
        <div className="mx-auto px-4 max-w-6xl">
          <span className="text-3xl font-bold text-gray-500 mb-8 text-center drop-shadow-md block">
            จัดการบทบาทผู้ใช้
          </span>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-purple-100 text-purple-800">
                  <tr>
                    <th className="p-4 font-semibold">MS ID</th>
                    <th className="p-4 font-semibold">ชื่อ</th>
                    <th className="p-4 font-semibold">นามสกุล</th>
                    <th className="p-4 font-semibold">ตำแหน่ง</th>
                    <th className="p-4 font-semibold">หน่วยงาน</th>
                    <th className="p-4 font-semibold">บทบาท</th>
                    <th className="p-4 font-semibold">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr 
                      key={user.id}
                      className="hover:bg-purple-50 transition-colors duration-200"
                    >
                      <td className="p-4">{user.ms_id}</td>
                      <td className="p-4">{user.givenName}</td>
                      <td className="p-4">{user.surname}</td>
                      <td className="p-4">{user.jobTitle}</td>
                      <td className="p-4">{user.department}</td>
                      <td className="p-4">
                        <span 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-green-600' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {roleOptions.find(role => role.value === user.role)?.label || user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                          disabled={loading}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          {roleOptions.map(role => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
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

export default AdminRoleManager;