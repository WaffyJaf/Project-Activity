import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { fetchProjects } from "../../api/projectget";
import { Project } from "../../api/projectget";
import Navbar from "../../component/navbar";

function Projectrecord() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function getProjects() {
      const data = await fetchProjects();
      // Filter only approved projects
      const approvedProjects = data.filter(project => project.project_status === 'approved');
      setProjects(approvedProjects);
    }
    getProjects();
  }, []);

  // Function to translate status to Thai
  function getThaiStatus(status: string): string {
    return status === 'approved' ? 'อนุมัติ' : 'ไม่ระบุ';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white ml-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex flex-col items-center ">
        <span className="text-3xl font-extrabold text-purple-800 mb-12 drop-shadow-md">
          เลือกโครงการที่ต้องการบันทึก
        </span>
        {projects.length > 0 ? (
          <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 bg-purple-700 text-white p-6 font-semibold text-lg border-b border-purple-200">
              <div>ชื่อโครงการ</div>
              <div>วันที่สร้าง</div>
              <div className="text-center">สถานะ</div>
            </div>
            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {projects.map((item) => (
                <div
                  key={item.project_id}
                  className="grid grid-cols-[2fr_1fr_1fr] gap-4 p-6 hover:bg-purple-50 transition-colors duration-200"
                >
                  <span className="text-lg font-medium text-gray-800 truncate">
                    {item.project_name}
                  </span>
                  <div className="text-sm text-gray-600">
                    {new Date(item.created_date).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex justify-center items-center space-x-4">
                    <span
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300"
                    >
                      {getThaiStatus(item.project_status)}
                      <i className="fa-solid fa-check ml-2 text-green-600"></i>
                    </span>
                    <Link
                      to={`/search/${item.project_id}`}
                      className="text-gray-600 hover:text-purple-800 transition-colors"
                    >
                      <i className="fa-solid fa-pen fa-lg"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg text-gray-600 animate-pulse">กำลังโหลดข้อมูล...</p>
            <p className="text-sm text-gray-500 mt-2">หากไม่มีข้อมูล อาจไม่มีโครงการที่ได้รับการอนุมัติ</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Projectrecord;