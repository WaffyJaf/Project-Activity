import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getregisACtivity, RegisAC, RegisACInput, deleteRegis, addRegis } from "../../api/regisactivity";
import Navbar from "../../component/navbar";
import Swal from "sweetalert2";

interface FormData {
  student_id: string;
  student_name: string;
  faculty: string;
}

function Regisactivity() {
  const { post_id } = useParams<{ post_id: string }>();
  const [registrations, setRegistrations] = useState<RegisAC[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    student_id: "",
    student_name: "",
    faculty: "",
  });

  const [isModalOpen , setIsModalOpen] = useState <boolean>(false);

  async function fetchRegistrations() {
    if (!post_id) {
      setError("ไม่พบ post_id ใน URL");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getregisACtivity(Number(post_id));
      setRegistrations(data); // data จะเป็น [] หากไม่มีผู้ลงทะเบียน
      setError(null);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRegistrations();
  }, [post_id]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleAddRegistration(e: React.FormEvent) {
    e.preventDefault();
    if (!post_id || isNaN(Number(post_id))) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่พบหรือ post_id ไม่ถูกต้อง",
        confirmButtonColor: "#9333ea",
      });
      return;
    }

    const registrationData: RegisACInput = {
      post_id: Number(post_id),
      student_id: formData.student_id,
      student_name: formData.student_name,
      faculty: formData.faculty,
    };

    try {
      await addRegis(registrationData);
      Swal.fire({
        icon: "success",
        title: "เพิ่มสำเร็จ",
        text: "เพิ่มผู้ลงทะเบียนเรียบร้อย",
        confirmButtonColor: "#9333ea",
      });
      setFormData({ student_id: "", student_name: "", faculty: "" });
      setIsModalOpen(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="text-lg text-gray-600 animate-pulse">กำลังโหลดข้อมูลผู้ลงทะเบียน...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <span className="text-3xl font-extrabold text-purple-800 drop-shadow-md">
          รายชื่อผู้ลงทะเบียนเข้าร่วมกิจกรรม
        </span>

        {/* ปุ่มเปิด Modal */}
        <div className="w-full max-w-lg mt-4 ml-380">
          <button
            onClick={() => setIsModalOpen(true)}
            className=" bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors duration-300 shadow"
          >
            + 
          </button>
        </div>

        {/* Modal สำหรับฟอร์ม */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
              <span className="text-xl font-bold text-purple-800 mb-4">เพิ่มผู้ลงทะเบียน</span>
              <form onSubmit={handleAddRegistration} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">รหัสนักศึกษา</label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    name="student_name"
                    value={formData.student_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">คณะ</label>
                  <input
                    type="text"
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors duration-300 shadow-md"
                  >
                    เพิ่ม
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ student_id: "", student_name: "", faculty: "" });
                      setIsModalOpen(false);
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors duration-300 shadow-md"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* แสดงข้อผิดพลาดถ้ามี */}
        {error && (
          <div className="text-center text-red-600 bg-red-50 p-6 rounded-xl shadow-md max-w-md text-base mt-10">
            {error}
          </div>
        )}

        {/* แสดงตารางหรือข้อความว่าไม่มีผู้ลงทะเบียน */}
        <div className="w-full max-w-5xl overflow-x-auto mt-2 ml-40">
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
                    key={reg.student_id}
                    className={`border-t border-gray-200 hover:bg-purple-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-4 px-6 text-gray-900">{reg.student_id}</td>
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