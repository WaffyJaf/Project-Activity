import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchParticipantsByProjectId, updateProjectStatus } from "../../api/record";
import { ActivityRecord } from "../../type/user";
import Navbar from "../../component/navbar";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

function ParticipantsList() {
  const { project_id } = useParams<{ project_id: string }>();
  const [participants, setParticipants] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    async function getParticipants() {
      setLoading(true);
      try {
        if (!project_id) {
          throw new Error("ไม่ได้ระบุ ID โครงการ");
        }
        const data = await fetchParticipantsByProjectId(project_id);
        console.log("Data from backend:", data);
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

  const handleSelectParticipant = (id: number) => {
    setSelectedParticipants((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((participantId) => participantId !== id)
        : [...prev, id];
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedParticipants.length === participants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(participants.map((record) => record.id));
    }
  };

  const handleManageEvaluation = () => {
    if (selectedParticipants.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกนิสิต",
        text: "โปรดเลือกนิสิตอย่างน้อย 1 คนเพื่อจัดการประเมิน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกสถานะ",
        text: "โปรดเลือกสถานะการประเมิน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    // ตรวจสอบว่าเลือกสถานะ NOT_EVALUATED สำหรับโครงการที่ต้องประเมินหรือไม่
    const selectedRecords = participants.filter((p) => selectedParticipants.includes(p.id));
    const hasInvalidStatus = selectedRecords.some(
      (record) => record.has_evaluation && selectedStatus === "NOT_EVALUATED"
    );

    if (hasInvalidStatus) {
      Swal.fire({
        icon: "warning",
        title: "สถานะไม่ถูกต้อง",
        text: "ไม่สามารถตั้งสถานะ 'ไม่ประเมิน' สำหรับโครงการที่ต้องประเมิน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    try {
      for (const id of selectedParticipants) {
        await updateProjectStatus(id, selectedStatus);
      }
      const updatedParticipants = await fetchParticipantsByProjectId(project_id!);
      setParticipants(updatedParticipants);
      setSelectedParticipants([]);
      setIsModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "อัปเดตสำเร็จ",
        text: "สถานะการประเมินได้รับการอัปเดตเรียบร้อยแล้ว ✅",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#7c3aed",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถอัปเดตสถานะการประเมินได้ ❌",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#7c3aed",
      });
    }
  };

  function getStatusClass(status: string): string {
    if (status === "COMPLETED") return "bg-green-100 text-green-800 border-green-300";
    if (status === "NOT_EVALUATED") return "bg-red-100 text-red-800 border-red-300";
    if (status === "PENDING") return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  }

  function getThaiStatus(status: string): string {
    switch (status) {
      case "COMPLETED":
        return "ประเมินแล้ว";
      case "NOT_EVALUATED":
        return "ไม่ประเมิน";
      case "PENDING":
        return "รอประเมิน";
      default:
        return "ไม่ระบุ";
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 ml-50">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-purple-800 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4   ">
                  {/* ปุ่มย้อนกลับ */}
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2"
                  >
                    <i className="fa-solid fa-arrow-left fa-2xl text-white"></i>
                  </button>

                  {/* หัวข้อ + ไอคอน + รหัสโครงการ */}
                  <div className="flex items-center gap-4">
                    <h3 className="text-3xl font-bold text-white flex items-center">
                      รายชื่อผู้เข้าร่วมโครงการ
                      
                    </h3>
                    <p className="text-blue-100 text-lg mt-3">รหัสโครงการ: {project_id}</p>
                  </div>
                </div>
                

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/recordactivity/${project_id}`)}
                  className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-900 transition-colors"
                >
                  เพิ่มรายชื่อ <i className="ml-3 fa-solid fa-user"></i>
                </button>
                <button
                  onClick={handleManageEvaluation}
                  className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-900 transition-colors"
                >
                  จัดการประเมิน
                </button>
              </div>
            </div>
            
          </div>
          

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
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-700 font-medium text-lg">{error}</p>
                </div>
              </div>
            ) : participants.length ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.length === participants.length && participants.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-600 rounded-md"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        ชื่อ-นามสกุล
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 uppercase tracking-wider">
                        รหัสนิสิต
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        คณะ
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        วันที่เข้าร่วม
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        ประเมิน
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                        ต้องประเมิน
                      </th>
                     
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(record.id)}
                            onChange={() => handleSelectParticipant(record.id)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-600 rounded-md"
                          />
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full flex items-center justify-center">
                                <span className="text-x font-bold text-gray-700">{index + 1}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-950 to-purple-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {record.users_up.givenName.charAt(0)}
                                  {record.users_up.surname.charAt(0)}
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 px-3 py-1 rounded-full inline-block">
                            {record.ms_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{record.users_up.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium">
                              {record.joined_at
                                ? new Date(record.joined_at).toLocaleString("th-TH", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(
                              record.evaluation_status
                            )}`}
                          >
                            {getThaiStatus(record.evaluation_status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                              record.has_evaluation
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-gray-100 text-gray-800 border-gray-300"
                            }`}
                          >
                            {record.has_evaluation ? "ต้องประเมิน" : "ไม่ต้องประเมิน"}
                          </div>
                        </td>
                        
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">ยังไม่มีผู้เข้าร่วม</h3>
                <p className="text-gray-500">ยังไม่มีผู้เข้าร่วมในกิจกรรมนี้</p>
              </div>
            )}
          </div>
        </motion.div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-4">อัปเดตสถานะการประเมิน</h2>
              <p className="text-gray-600 mb-4">เลือกสถานะสำหรับนิสิต {selectedParticipants.length} คน</p>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="">เลือกสถานะ</option>
                <option value="COMPLETED">ประเมินแล้ว</option>
                <option value="NOT_EVALUATED">ไม่ประเมิน</option>
                <option value="PENDING">รอประเมิน</option>
              </select>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="bg-purple-600 text-white font-semibold py-2 px-4 rounded hover:bg-purple-700 transition-colors"
                >
                  ยืนยัน
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ParticipantsList;