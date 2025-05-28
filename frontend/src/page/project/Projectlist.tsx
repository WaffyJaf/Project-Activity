import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjectsByUser, Project } from '../../api/projectget';
import Navbar from '../../component/navbar';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

function Projectlist() {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    async function getProjects() {
      if (currentUser?.ms_id) {
        const data = await fetchProjectsByUser(currentUser.ms_id);
        setProjects(data);
      } else {
        console.error('No ms_id found for the current user');
        setProjects([]);
      }
    }
    getProjects();
  }, [currentUser]);

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

  const getStatusDetails = (status: string) => {
    const statusMap: Record<string, { icon: string; color: string; bg: string }> = {
      approved: { icon: 'fa-solid fa-check-circle', color: 'text-green-600', bg: 'bg-green-50' },
      pending: { icon: 'fa-solid fa-clock', color: 'text-amber-600', bg: 'bg-amber-50' },
      rejected: { icon: 'fa-solid fa-exclamation-circle', color: 'text-red-600', bg: 'bg-red-50' },
      default: { icon: 'fa-solid fa-bookmark', color: 'text-blue-600', bg: 'bg-blue-50' },
    };

    const { icon, color, bg } = statusMap[status] || statusMap['default'];

    return {
      icon: <i className={`${icon} ${color} ${bg} mr-2`} style={{ fontSize: 20 }} />,
      color,
      bg,
    };
  };

  const handleViewProcess = (project: Project) => {
    setSelectedProject(project);
    setShowProcessModal(true);
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white py-7 px-4 md:px-6 ml-50">
      <Navbar />
      <div className="mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-3 flex flex-col md:flex-row justify-between items-center">
          <div className="w-full flex justify-between items-center">
            <span className="text-2xl md:text-2xl font-extrabold text-purple-900 tracking-tight drop-shadow-sm">
              ประวัติการเปิดโครงการ
            </span>
            <i className="fa-solid fa-clock-rotate-left fa-2xl text-purple-800"></i>
          </div>
        </div>
        {projects.length > 0 ? (
          <div className="bg-white shadow-lg rounded-2xl mb-8">
            <div className="grid grid-cols-3 rounded-2xl gap-20 bg-purple-100 p-4 font-semibold text-gray-800 text-m border-b border-purple-200">
              <div>ชื่อโครงการ</div>
              <div>วันที่สร้าง</div>
              <div className="text-center mr-60">สถานะ</div>
            </div>
            <div className="divide-y divide-gray-200">
              {projects.map((item) => (
                <div
                  key={item.project_id}
                  className="grid grid-cols-3 gap-4 p-4 transition-colors duration-200"
                >
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xm font-medium">
                    {item.project_name}
                  </span>
                  <div className="text-xm text-gray-600 ml-5">{formatDate(item.created_date)}</div>
                  <div className="flex justify-between items-center px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xm font-medium border ${getStatusClass(item.project_status)}`}
                    >
                      {getThaiStatus(item.project_status)}
                      <i
                        className="fa-solid fa-bars fa-xm ml-2 text-gray-600 cursor-pointer hover:text-red-950"
                        onClick={() => handleViewProcess(item)}
                      ></i>
                    </span>
                    <Link to={`/Projectdetail/${item.project_id}`}>
                      <button className="bg-purple-800 text-white py-2 px-3 rounded hover:bg-purple-950 transition-colors duration-300 shadow-md text-sm">
                        ดูรายละเอียด
                      </button>
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

      {/* Process Modal */}
      {showProcessModal && selectedProject && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white p-6 rounded-2xl w-[95%] max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slideIn relative"
            initial={{ scale: 0.8, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -50 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="py-6 px-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-600 pb-3 border-b border-purple-100">
                  ตรวจสอบสถานะคำร้อง
                </h2>
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full h-8 w-8 flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Status Badge */}
              {selectedProject.project_status && (
                <div
                  className={`${getStatusDetails(selectedProject.project_status).bg} ${getStatusDetails(selectedProject.project_status).color} rounded-lg p-3 flex items-center mb-6`}
                >
                  {getStatusDetails(selectedProject.project_status).icon}
                  <span className="font-medium">สถานะปัจจุบัน: {getThaiStatus(selectedProject.project_status)}</span>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 rounded-full p-2 mr-4">
                    <i className="fa-solid fa-calendar ml-2 text-gray-700 cursor-pointer"></i>
                  </div>
                  <div>
                    <p className="text-x text-gray-500">วันที่สร้างโครงการ</p>
                    <p className="font-medium text-gray-800">{formatDate(selectedProject.created_date)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 rounded-full p-2 mr-4">
                    <i className="fa-solid fa-square-check ml-2 text-gray-700 cursor-pointer"></i>
                  </div>
                  <div>
                    <p className="text-x text-gray-500">วันที่อนุมัติโครงการ</p>
                    <p className="font-medium text-gray-800">{formatDate(selectedProject.approval_datetime)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowProcessModal(false)}
                className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-900 transition-all font-medium"
              >
                ปิด
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Projectlist;