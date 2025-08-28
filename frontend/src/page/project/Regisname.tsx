import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getregisACtivity, RegisAC, deleteRegis, addRegis } from "../../api/regisactivity";
import { getUsers} from "../../api/login";
import {User} from "../../type/user";
import Navbar from "../../component/navbar";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";


function Regisactivity() {
  const { post_id } = useParams<{ post_id: string }>();
  const [registrations, setRegistrations] = useState<RegisAC[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();


  // Fetch registrations for the activity
  async function fetchRegistrations() {
    if (!post_id) {
      setError("ไม่พบ post_id ใน URL");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getregisACtivity(Number(post_id));
      setRegistrations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch all users for search
  async function fetchUsers() {
    try {
      const results = await getUsers();
      setUsers(results);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดึงข้อมูลนิสิตได้ กรุณาลองอีกครั้ง",
        confirmButtonColor: "#9333ea",
      });
    }
  }

  useEffect(() => {
    fetchRegistrations();
    fetchUsers();
  }, [post_id]);

  // Debounced search for users
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() === "") {
        setFilteredUsers([]);
        return;
      }

      const filtered = users.filter(
        (user) =>
          user.ms_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.givenName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.surname || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, users]);

  // Handle adding a registration by selecting a user
  async function handleAddRegistration(user: User) {
    if (!post_id || isNaN(Number(post_id))) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่พบหรือ post_id ไม่ถูกต้อง",
        confirmButtonColor: "#9333ea",
      });
      return;
    }

    const registrationData = {
      post_id: Number(post_id),
      ms_id: user.ms_id,
      student_name: `${user.givenName} ${user.surname}`,
      faculty: user.department || "ไม่ระบุ",
    };

    try {
      await addRegis(registrationData);
      Swal.fire({
        icon: "success",
        title: "เพิ่มสำเร็จ",
        text: "เพิ่มผู้ลงทะเบียนเรียบร้อย",
        confirmButtonColor: "#9333ea",
      });
      setIsModalOpen(false);
      setSearchTerm("");
      fetchRegistrations();
    } catch (error: any) {
      console.error("เกิดข้อผิดพลาดในการเพิ่มผู้ลงทะเบียน:", error.message, error.response?.data);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message || "ไม่สามารถเพิ่มผู้ลงทะเบียนได้",
        confirmButtonColor: "#9333ea",
      });
    }
  }

  // Handle deleting a registration
  async function handleDeleteEvent(register_id: number) {
    Swal.fire({
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบกิจกรรมนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9333ea",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteRegis(register_id);
          Swal.fire({
            icon: "success",
            title: "ลบสำเร็จ",
            text: "ลบรายชื่อเรียบร้อย",
            confirmButtonColor: "#9333ea",
          });
          fetchRegistrations();
        } catch (error: any) {
          console.error("เกิดข้อผิดพลาดในการลบรายชื่อ:", error.message, error.response?.data);
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: error.message || "ไม่สามารถลบรายชื่อได้",
            confirmButtonColor: "#9333ea",
          });
        }
      }
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="text-lg text-gray-600 animate-pulse">กำลังโหลดข้อมูลผู้ลงทะเบียน...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 ml-65">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 flex flex-col md:flex-row justify-between items-center">
          <div className="w-full flex justify-between items-center">
            {/* กล่องฝั่งซ้าย: ปุ่มย้อนกลับ + หัวข้อ */}
            <div className="flex items-center ">
              <button
                onClick={() => navigate(-1)}
                className=" text-purple-900 py-2 px-4 "
              >
                <i className="fa-solid fa-arrow-left fa-2xl text-purple-800"></i>
              </button>
              <span className="text-2xl font-extrabold text-purple-900 tracking-tight drop-shadow-sm">
                รายชื่อผู้ลงทะเบียนเข้าร่วมกิจกรรม
              </span>
            </div>

            {/* ไอคอนฝั่งขวา */}
            <i className="fa-solid fa-newspaper fa-2xl text-purple-800"></i>
          </div>
        </div>
        {/* Button to open search modal */}
        <div className="w-full max-w-lg mt-4 ml-200">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors duration-300 shadow"
          >
            + เพิ่มผู้ลงทะเบียน
          </button>
        </div>

        {/* Search Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-3xl">
              <span className="text-xl font-bold text-purple-800 mb-4 block">ค้นหานิสิตเพื่อลงทะเบียน</span>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาด้วยรหัสนิสิตหรือชื่อ"
                 className="  w-full p-4 pl-14 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-base transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label="ค้นหานิสิตด้วยรหัสนิสิตหรือชื่อ"
                />
              </div>

              {/* Search Results */}
              {filteredUsers.length > 0 && (
                <div className="max-h-60 overflow-y-auto">
                  {filteredUsers.map((user, index) => (
                    <div
                      key={user.ms_id}
                      className="flex items-center p-3 hover:bg-purple-50 transition-all duration-200 cursor-pointer border-b border-purple-100"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleAddRegistration(user)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-purple-900">{user.ms_id}</p>
                        <p className="text-sm text-gray-800">
                          {user.givenName} {user.surname}
                        </p>
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          {user.department || "ไม่ระบุ"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searchTerm && filteredUsers.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-600">ไม่พบนิสิตที่ตรงกับการค้นหา</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setIsModalOpen(false);
                }}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors duration-300 shadow-md mt-4"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-center text-red-600 bg-red-50 p-6 rounded-xl shadow-md max-w-md text-base mt-10">
            {error}
          </div>
        )}

        {/* Registrations Table */}
        <div className="w-full max-w-5xl overflow-x-auto mt-2">
          {registrations.length === 0 ? (
            <div className="text-gray-600 text-lg bg-white p-6 rounded-xl shadow-md">
              ไม่มีผู้ลงทะเบียนสำหรับโพสต์นี้
            </div>
          ) : (
            <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
              <thead>
                <tr className="bg-purple-100 text-black text-left text-sm font-semibold">
                  <th className="py-4 px-6">รหัสนักศึกษา</th>
                  <th className="py-4 px-6">ชื่อ-นามสกุล</th>
                  <th className="py-4 px-6">คณะ</th>
                  <th className="py-4 px-6">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, index) => (
                  <tr
                    key={reg.ms_id}
                    className={`border-t border-gray-200 hover:bg-purple-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-4 px-6 text-gray-900">{reg.ms_id}</td>
                    <td className="py-4 px-6 text-gray-600">{reg.student_name}</td>
                    <td className="py-4 px-6 text-gray-600">{reg.faculty}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleDeleteEvent(reg.register_id)}
                        className="bg-red-600 text-white py-1.5 px-4 rounded hover:bg-red-700 transition-colors duration-300 shadow-md text-sm"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Regisactivity;