import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjectsByUser, Project } from "../../api/projectget";
import Navbar from "../../component/navbar";
import { useAuth } from "../../context/AuthContext"; 

function ProjectrecordByID() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentUser } = useAuth(); // ดึง ms_id ของ user ที่ login

  useEffect(() => {
    async function getProjects() {
      try {
        setIsLoading(true);
        setError(null);

        if (!currentUser?.ms_id) {
          throw new Error("ไม่พบ ms_id ของผู้ใช้");
        }

        const data = await fetchProjectsByUser(currentUser.ms_id);

        // ❌ ไม่ filter approved เอาออก เพื่อดูว่ามีข้อมูลจริงไหม
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูลโครงการ");
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    }

    getProjects();
  }, [currentUser?.ms_id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-50 to-white py-7 px-4 md:px-6 ml-50">
      <Navbar />
      <div className="mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 flex flex-col md:flex-row justify-between items-center">
          <div className="w-full flex justify-between items-center">
            <span className="text-2xl md:text-2xl font-extrabold text-purple-900 tracking-tight drop-shadow-sm">
              โครงการของฉัน
            </span>
            <i className="fa-solid fa-folder-open fa-2xl text-purple-800"></i>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center">
            <p className="text-lg text-gray-600 animate-pulse">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-lg text-red-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 bg-gradient-to-r from-purple-700 to-purple-800 text-white px-6 py-4 font-semibold">
              <div className="text-left">ชื่อโครงการ</div>
              <div className="text-center">วันที่สร้าง</div>
              <div className="text-center mr-10">สถานะ</div>
              <div className="text-center">การดำเนินการ</div>
            </div>

            {/* Body */}
            <div className="divide-y divide-gray-200">
              {projects.map((item) => (
                <div
                  key={item.project_id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 hover:bg-purple-50 transition-colors"
                >
                  {/* ชื่อโครงการ */}
                  <div className="text-base font-medium text-gray-800 truncate">
                    {item.project_name}
                  </div>

                  {/* วันที่สร้าง */}
                  <div className="text-sm text-gray-600 text-center whitespace-nowrap">
                    {new Date(item.created_date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>

                  {/* สถานะ */}
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm
                        ${
                          item.project_status === "approved"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : item.project_status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                            : "bg-red-100 text-red-700 border-red-300"
                        }`}
                    >
                      {item.project_status}
                    </span>
                  </div>

                  {/* การดำเนินการ */}
                  <div className="flex justify-center md:justify-end items-center gap-2">
                    <Link to={`/recordactivity/${item.project_id}`}>
                      <button className="min-w-[96px] bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-medium shadow-sm hover:shadow-md flex items-center justify-center">
                        <i className="fa-solid fa-pen-to-square mr-2" />
                        <span>บันทึก</span>
                      </button>
                    </Link>
                    <Link to={`/participants/${item.project_id}`}>
                      <button className="min-w-[110px] bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-medium shadow-sm hover:shadow-md flex items-center justify-center">
                        <i className="fa-solid fa-users mr-2" />
                        <span>ดู</span>
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg text-gray-600">ยังไม่มีโครงการของคุณ</p>
            <p className="text-sm text-gray-500 mt-2">ลองสร้างโครงการใหม่หรือเช็ค API ว่าส่งข้อมูลมาหรือไม่</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectrecordByID;
