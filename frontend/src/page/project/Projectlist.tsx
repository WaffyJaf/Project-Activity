import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { fetchProjects } from "../../api/projectget";
import { Project } from "../../api/projectget";
import Navbar from "../../component/navbar";

function Projectlist() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function getProjects() {
      const data = await fetchProjects();
      setProjects(data);
    }
    getProjects();
  }, []);

  function getStatusClass(status: string): string {
    if (status === 'approved') return 'bg-green-100 text-green-800 border-green-300';
    if (status === 'rejected') return 'bg-red-100 text-red-800 border-red-300';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }

  // Function to translate status to Thai
  function getThaiStatus(status: string): string {
    switch (status) {
      case 'approved':
        return 'อนุมัติ';
      case 'rejected':
        return 'ปฏิเสธ';
      case 'pending':
        return 'รอดำเนินการ';
      default:
        return 'ไม่ระบุ';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex flex-col items-center ">
        <span className="text-3xl font-extrabold text-purple-800 mb-12 drop-shadow-md ml-40">
          ประวัติการเปิดโครงการ
        </span>
        {projects.length > 0 ? (
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden ml-50">
            <div className="grid grid-cols-3 gap-20 bg-purple-100 p-4 font-semibold text-gray-800 text-m border-b border-purple-200">
              <div>ชื่อโครงการ</div>
              <div>วันที่สร้าง</div>
              <div className="text-center">สถานะ</div>
            </div>
            <div className="divide-y divide-gray-200">
              {projects.map((item) => (
                <div
                  key={item.project_id}
                  className="grid grid-cols-3 gap-4 p-4 hover:bg-purple-400 transition-colors duration-200"
                >
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xl font-medium"
                  >
                    {item.project_name}
                  </span>
                  <div className="text-xm text-gray-600 ml-5">
                    {new Date(item.created_date).toLocaleDateString()}
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ml-7 ${getStatusClass(item.project_status)}`}
                    >
                      {getThaiStatus(item.project_status)}
                      {item.project_status === 'approved' && (
                        <i className="fa-solid fa-check ml-2 text-green-600"></i>
                      )}
                      {item.project_status === 'rejected' && (
                        <i className="fa-solid fa-xmark ml-2 text-red-600"></i>
                      )}
                      {item.project_status === 'pending' && (
                        <i className="fa-solid fa-hourglass-start ml-2 text-yellow-800"></i>
                      )}
                    </span>
                    <Link to={`/Projectdetail/${item.project_id}`}>
                      <i className="fa-solid fa-bars text-gray-700 hover:text-purple-800 fa-xl"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-lg text-gray-600 animate-pulse">กำลังโหลดข้อมูล...</p>
        )}
      </div>
    </div>
  );
}

export default Projectlist;