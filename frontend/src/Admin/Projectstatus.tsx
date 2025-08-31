import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { fetchProjects, updateProjectStatus } from "../api/projectget";
import { Project } from "../api/projectget";
import Navbar from "../component/navbar";
import { Search } from 'lucide-react';
import Swal from 'sweetalert2';

function Projectlist() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(p => p.project_name.toLowerCase().includes(searchTerm.toLowerCase()));
  const pendingProjects = filteredProjects.filter(p => p.project_status === 'pending');
  const approvedProjects = filteredProjects.filter(p => p.project_status === 'approved');
  const rejectedProjects = filteredProjects.filter(p => p.project_status === 'rejected');

  useEffect(() => {
    async function getProjects() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลโครงการได้',
        });
      }
    }
    getProjects();
  }, []);

  function getStatusClass(status: string): string {
    if (status === 'approved') return 'bg-green-100 text-green-800 border-green-300';
    if (status === 'rejected') return 'bg-red-100 text-red-800 border-red-300';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }

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

  const handleStatusChange = async (projectId: number, currentStatus: string) => {
    const statusOptions = [
      { value: 'approved', text: 'อนุมัติ' },
      { value: 'rejected', text: 'ปฏิเสธ' },
      { value: 'pending', text: 'รอดำเนินการ' }
    ].filter(option => option.value !== currentStatus);

    const { value: newStatus } = await Swal.fire({
      title: 'อัพเดทสถานะโครงการ',
      input: 'select',
      inputOptions: statusOptions.reduce((acc, option) => {
        acc[option.value] = option.text;
        return acc;
      }, {} as Record<string, string>),
      inputPlaceholder: 'เลือกสถานะ',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        confirmButton: 'bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2'
      }
    });

    let reason = '';
    if (newStatus === 'rejected') {
      const { value: inputReason } = await Swal.fire({
        title: 'เหตุผลในการปฏิเสธ',
        input: 'textarea',
        inputPlaceholder: 'กรุณาระบุเหตุผล (สำหรับบันทึกวิชาการ)',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
      });
      if (!inputReason) return;
      reason = inputReason;
    }

    if (newStatus) {
      try {
        await updateProjectStatus(projectId, newStatus, reason);
        setProjects(projects.map(project =>
          project.project_id === projectId
            ? { ...project, project_status: newStatus, rejected_reason: reason, updated_date: new Date() }
            : project
        ));
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'อัพเดทสถานะเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถอัพเดทสถานะได้',
        });
      }
    }
  };

  const renderProjectItem = (item: Project) => (
    <Link
      to={`/Projectdetail/${item.project_id}`}
      className="grid grid-cols-7 gap-0 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
      aria-label={`ดูรายละเอียดโครงการ ${item.project_name}`}
    >
      <div className="text-base text-gray-800 border-r border-gray-200 px-3 py-2">
        {item.project_name}
      </div>
      <div className="text-sm text-gray-600 border-r border-gray-200 px-3 py-2">
        {new Date(item.created_date).toLocaleDateString()}
      </div>
      <div className="text-sm text-gray-600 border-r border-gray-200 px-3 py-2">
        {item.created_by || 'ไม่ระบุ'}
      </div>
      <div className="text-sm text-gray-600 truncate border-r border-gray-200 px-3 py-2">
        {item.rejected_reason || 'ไม่มี'}
      </div>
      <div className="flex items-center justify-center border-r border-gray-200 px-3 py-2">
        <span
          className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium border ${getStatusClass(item.project_status)}`}
        >
          {getThaiStatus(item.project_status)}
        </span>
      </div>
      <div className="flex items-center justify-center border-r border-gray-200 px-3 py-2">
        <Link to={`/Projectdetail/${item.project_id}`} aria-label="ดูรายละเอียดโครงการ">
          <i className="fa-solid fa-bars text-gray-700 hover:text-purple-800 text-lg"></i>
        </Link>

      </div>
      {/* คอลัมน์ "การกระทำ" */}
    <div className="flex justify-center items-center px-3 py-2">
      {item.project_status === 'pending' ? (
        <button
          onClick={(e) => {
            e.preventDefault(); // กัน <Link> ชั้นนอก
            e.stopPropagation();
            handleStatusChange(item.project_id, item.project_status);
          }}
          className="h-10 px-3 inline-flex items-center justify-center rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md space-x-2"
          aria-label="จัดการสถานะโครงการ"
          title="จัดการสถานะ"
        >
          <i className="fa-solid fa-pen fa-xs"></i>
          <span>จัดการ</span>
        </button>
      ) : item.project_status === 'approved' ? (
        <span
          className="inline-flex items-center justify-center   text-green-600 border  "
          aria-label="อนุมัติแล้ว"
          title="อนุมัติแล้ว"
        >
          <i className="fa-solid fa-circle-check text-xl"></i>
        </span>
      ) : (
        <span
          className="inline-flex h-10 w-10 items-center justify-center   text-red-600 border "
          aria-label="ปฏิเสธแล้ว"
          title={item.rejected_reason ? `ปฏิเสธแล้ว: ${item.rejected_reason}` : 'ปฏิเสธแล้ว'}
        >
          <i className="fa-solid fa-circle-xmark text-xl"></i>
        </span>
      )}
    </div>
  </Link>
  );

  return (
    <div className="min-h-screen bg-purple-50 ml-65">
      <Navbar />
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <span className="text-xl font-bold text-gray-600 tracking-tight ml-5">
            คำร้องเปิดโครงการ
          </span>
          <div className="relative w-full sm:max-w-md ">
            <input
              type="text"
              placeholder="ค้นหาโครงการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-3 pr-11 border border-gray-300 rounded w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              aria-label="ค้นหาโครงการ"
            />
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          <div className="flex space-x-2 mr-20">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="แสดงคำร้องรอดำเนินการ"
            >
              รอดำเนินการ ({pendingProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
                activeTab === 'rejected'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="แสดงคำร้องที่ปฏิเสธแล้ว"
            >
              ปฏิเสธแล้ว ({rejectedProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
                activeTab === 'approved'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="แสดงคำร้องที่อนุมัติแล้ว"
            >
              อนุมัติแล้ว ({approvedProjects.length})
            </button>
            
          </div>
        </div>
        {projects.length > 0 ? (
          <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="grid grid-cols-7 gap-0 bg-gray-100 p-3 font-semibold text-gray-800 text-sm border-b border-gray-200">
              <div className="border-r border-gray-200 px-3 py-2">ชื่อโครงการ</div>
              <div className="border-r border-gray-200 px-3 py-2">วันที่สร้าง</div>
              <div className="border-r border-gray-200 px-3 py-2">ผู้สร้าง</div>
              
              <div className="border-r border-gray-200 px-3 py-2">เหตุผลปฏิเสธ</div>
              <div className="text-center border-r border-gray-200 px-3 py-2">สถานะ</div>
              <div className="border-r border-gray-200 px-3 py-2 ml-10">รายละเอียด</div>
              <div className="text-center px-3 py-2">การกระทำ</div>
            </div>
            <div>
              {activeTab === 'pending' && (
                pendingProjects.length > 0 ? (
                  pendingProjects.map(renderProjectItem)
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <i className="fa-solid fa-folder-open text-4xl mb-4"></i>
                    <p className="text-base font-medium">ยังไม่มีคำร้องรอดำเนินการ</p>
                  </div>
                )
              )}
              {activeTab === 'approved' && (
                approvedProjects.length > 0 ? (
                  approvedProjects.map(renderProjectItem)
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <i className="fa-solid fa-folder-open text-4xl mb-4"></i>
                    <p className="text-base font-medium">ยังไม่มีคำร้องที่อนุมัติแล้ว</p>
                  </div>
                )
              )}
              {activeTab === 'rejected' && (
                rejectedProjects.length > 0 ? (
                  rejectedProjects.map(renderProjectItem)
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <i className="fa-solid fa-folder-open text-4xl mb-4"></i>
                    <p className="text-base font-medium">ยังไม่มีคำร้องที่ปฏิเสธ</p>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <i className="fa-solid fa-spinner fa-spin text-4xl mb-4"></i>
            <p className="text-base font-medium animate-pulse">กำลังโหลดข้อมูล...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Projectlist;
