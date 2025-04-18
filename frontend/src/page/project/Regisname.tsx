import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getregisACtivity, RegisAC } from "../../api/regisactivity";
import Navbar from "../../component/navbar";

function Regisactivity() {
  const { post_id } = useParams<{ post_id: string }>();
  const [registrations, setRegistrations] = useState<RegisAC[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError("ไม่พบรายชื่อผู้ลงทะเบียน");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRegistrations();
  }, [post_id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="text-lg text-gray-600 animate-pulse">
          กำลังโหลดข้อมูลผู้ลงทะเบียน...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-xl shadow-md max-w-md text-base">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex flex-col items-center ">
        <span className="text-3xl font-extrabold text-purple-800  drop-shadow-md">
          รายชื่อผู้ลงทะเบียนเข้าร่วมกิจกรรม
        </span>

        
        {registrations && registrations.length === 0 ? (
          <div className="text-gray-600 text-lg bg-white p-6 rounded-xl shadow-md">
            ไม่มีผู้ลงทะเบียนสำหรับโพสต์นี้
          </div>
        ) : (
          <div className="w-full max-w-4xl overflow-x-auto mt-10">
            <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
              <thead>
                <tr className="bg-purple-100 text-black text-left text-sm font-semibold">
                  <th className="py-4 px-6">รหัสนักศึกษา</th>
                  <th className="py-4 px-6">ชื่อ-นามสกุล</th>
                  <th className="py-4 px-6">คณะ</th>
                </tr>
              </thead>
              <tbody>
                {registrations?.map((reg, index) => (
                  <tr
                    key={reg.student_id}
                    className={`border-t border-gray-200 hover:bg-purple-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-4 px-6 text-gray-900">{reg.student_id}</td>
                    <td className="py-4 px-6 text-gray-600">{reg.student_name}</td>
                    <td className="py-4 px-6 text-gray-600">{reg.faculty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Regisactivity;