import  { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchParticipantsByProjectId } from "../../api/record";
import { ActivityRecord } from "../../type/user";
import Navbar from "../../component/navbar";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

function ParticipantsList() {
  const { project_id} = useParams<{ project_id: string }>();
  const [participants, setParticipants] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function getParticipants() {
      setLoading(true);
      try {
        if (!project_id) {
          throw new Error("ไม่ได้ระบุ ID โครงการ");
        }
        const data = await fetchParticipantsByProjectId(project_id);
        setParticipants(data);
      } catch (err) {
        setError("ไม่สามารถดึงรายชื่อผู้เข้าร่วมได้");
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถดึงรายชื่อผู้เข้าร่วมได้ ❌",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#7c3aed",
        });
      } finally {
        setLoading(false);
      }
    }

    getParticipants();
  }, [project_id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 ml-50">
      <Navbar/>
      <div className="max-w-6xl mx-auto ">
        <motion.div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="bg-purple-800 px-8 py-6 ">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <i className=" mr-3 fa-solid fa-user " ></i>
                  รายชื่อผู้เข้าร่วมโครงการ
                </h1>
                <p className="text-blue-100 mt-3 text-lg ">รหัสโครงการ: {project_id}</p>
                <p className="text-blue-200 text-sm">จำนวนผู้เข้าร่วมทั้งสิ้น: {participants.length} คน</p>
              </div>
              <button
                onClick={() => navigate(`/recordactivity/${project_id}`)}
                className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-900 transition-colors"
              >
                เพิ่มรายชื่อ
              </button>

            </div>
            
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mr-4"></div>
                <span className="text-xl text-gray-600">กำลังโหลดรายชื่อ...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-red-700 font-medium text-lg">{error}</p>
                </div>
              </div>
            ) : participants.length ? (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 ">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        <div className="flex items-center">
                          
                          ลำดับ
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        <div className="flex items-center">
                          
                          ชื่อ-นามสกุล
                        </div>
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 uppercase tracking-wider">
                        <div className="flex items-center">
                         
                          รหัสนิสิต
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        <div className="flex items-center">
                          
                          คณะ
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        <div className="flex items-center">
                          
                          วันที่เข้าร่วม
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        <div className="flex items-center">
                          
                          ประเมิน
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((record, index) => (
                      <motion.tr
                        key={record.ms_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full  flex items-center justify-center">
                                <span className="text-sm font-bold text-gray-700 ">{index + 1}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-950 to-purple-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {record.users_up.givenName.charAt(0)}{record.users_up.surname.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-2">
                              <div className="text-xm font-bold text-gray-900">
                                {record.users_up.givenName} {record.users_up.surname}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap ">
                          <div className="text-sm font-semibold text-gray-900   px-3 py-1 rounded-full inline-block">
                            {record.ms_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {record.users_up.department}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center">
                           
                            <span className="font-medium">{record.joined_at
                            ? new Date(record.joined_at).toLocaleString("th-TH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">ยังไม่มีผู้เข้าร่วม</h3>
                <p className="text-gray-500">ยังไม่มีผู้เข้าร่วมในกิจกรรมนี้</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ParticipantsList;