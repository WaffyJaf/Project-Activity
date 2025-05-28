import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchRegistrationsByProject, Registration, recordActivity } from '../../api/record';
import Navbar from '../../component/navbar';
import Swal from 'sweetalert2';

function RecordActivity() {
  const { project_id } = useParams<{ project_id: string }>();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [recordingLoading, setRecordingLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchRegistrations(page: number = 1) {
    if (!project_id || isNaN(Number(project_id))) {
      setError('ไม่พบ project_id ใน URL หรือ project_id ไม่ถูกต้อง');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchRegistrationsByProject(Number(project_id), page, limit);
      setRegistrations(response.data);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / limit));
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      setRegistrations([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRegistrations(currentPage);
  }, [project_id, currentPage, limit]);

  // Reset selections when page changes
  useEffect(() => {
    setSelectedStudents(new Set());
    setSelectAll(false);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
    
    // Update select all state
    setSelectAll(newSelected.size === registrations.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents(new Set());
      setSelectAll(false);
    } else {
      const allStudentIds = new Set(registrations.map(reg => reg.student_id));
      setSelectedStudents(allStudentIds);
      setSelectAll(true);
    }
  };

  const handleRecordActivity = async () => {
    if (selectedStudents.size === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่ได้เลือกรายชื่อ',
        text: 'กรุณาเลือกรายชื่อนักศึกษาที่ต้องการบันทึกการเข้าร่วม',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    // Confirmation dialog
    const result = await Swal.fire({
      title: 'ยืนยันการบันทึก',
      text: `ต้องการบันทึกการเข้าร่วมกิจกรรมสำหรับ ${selectedStudents.size} รายการหรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) return;

    setRecordingLoading(true);
    const selectedArray = Array.from(selectedStudents);
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    try {
      // Show loading
      Swal.fire({
        title: 'กำลังบันทึก...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      // Record activity for each selected student
      for (const studentId of selectedArray) {
        try {
          await recordActivity(Number(project_id), studentId);
          successCount++;
        } catch (error: any) {
          console.error(`Failed to record activity for student ${studentId}:`, error);
          
          // Check if it's a duplicate error
          if (error.message?.includes('ALREADY_RECORDED') || error.message?.includes('duplicate')) {
            duplicateCount++;
          } else {
            errorCount++;
            errors.push(`${studentId}: ${error.message}`);
          }
        }
      }

      // Close loading dialog
      Swal.close();

      // Show results
      if (successCount > 0 && errorCount === 0 && duplicateCount === 0) {
        // All successful
        await Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ!',
          text: `บันทึกการเข้าร่วมกิจกรรมสำเร็จทั้งหมด ${successCount} รายการ`,
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true
        });
        setSelectedStudents(new Set());
        setSelectAll(false);
      } else {
        // Mixed results
        let message = '';
        if (successCount > 0) message += `บันทึกสำเร็จ: ${successCount} รายการ\n`;
        if (duplicateCount > 0) message += `บันทึกซ้ำ: ${duplicateCount} รายการ\n`;
        if (errorCount > 0) message += `เกิดข้อผิดพลาด: ${errorCount} รายการ`;

        await Swal.fire({
          icon: successCount > 0 ? 'warning' : 'error',
          title: 'ผลการบันทึก',
          text: message,
          confirmButtonColor: '#8B5CF6',
          ...(errors.length > 0 && {
            footer: `<small>ข้อผิดพลาด: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}</small>`
          })
        });

        if (successCount > 0) {
          setSelectedStudents(new Set());
          setSelectAll(false);
        }
      }

    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาดในการบันทึกการเข้าร่วมกิจกรรม',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setRecordingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 ">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูลผู้ลงทะเบียน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 ml-65 ">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 ">


        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Table */}
        {registrations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่มีผู้ลงทะเบียน</h3>
            <p className="text-gray-500">ไม่มีผู้ลงทะเบียนสำหรับโครงการนี้</p>
          </div>
        ) : (
          <>
            
            {/* Selection Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-semibold text-purple-700 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  เลือกรายชื่อที่ต้องการบันทึกการเข้าร่วม
                </span>
                <div className="text-sm text-gray-500">
                  เลือกแล้ว: <span className="font-semibold text-purple-600">{selectedStudents.size}</span> รายการ
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-gray-700 font-medium  ">เลือกทั้งหมด </span>
                {/* Label: เลือกทั้งหมด */}
                <label className="flex items-center cursor-pointer group mr-170">
                  
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="sr-only"
                      
                    />
                    
                    <div
                    
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                        selectAll || (selectedStudents.size > 0 && selectedStudents.size < registrations.length)
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-gray-300 group-hover:border-purple-400'
                      }`}
                    >
                      {selectAll && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {selectedStudents.size > 0 && selectedStudents.size < registrations.length && !selectAll && (
                        <div className="w-2 h-2 bg-purple-600 rounded-sm"></div>
                      )}
                      
                    </div>
                    
                  </div>
                </label>

                {/* ปุ่มบันทึก */}
                <button
                  onClick={handleRecordActivity}
                  disabled={selectedStudents.size === 0 || recordingLoading}
                  className={`px-6 py-3 rounded font-medium transition-all duration-200 flex items-center space-x-2 ${
                    selectedStudents.size === 0 || recordingLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {recordingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>บันทึกการเข้าร่วม ({selectedStudents.size})</span>
                    </>
                  )}
                </button>
              </div>
            </div>


            <div className="mb-3    flex justify-end ">
              <div className="flex items-center space-x-4">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                  <span className="text-sm text-gray-600">จำนวนทั้งหมด:</span>
                  <span className="ml-2 font-semibold text-purple-600">{total}</span>
                  <span className="ml-1 text-gray-600">รายการ</span>
                </div>
              </div>
            </div>
        

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">เลือก</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">รหัสนักศึกษา</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">คณะ</th>
                      
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {registrations.map((reg, index) => (
                      <tr
                        key={reg.register_id}
                        className={`transition-all duration-200 hover:bg-purple-50 ${
                          selectedStudents.has(reg.student_id) 
                            ? 'bg-purple-25 border-l-4 border-purple-500' 
                            : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <label className="cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={selectedStudents.has(reg.student_id)}
                                onChange={() => handleStudentSelect(reg.student_id)}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                selectedStudents.has(reg.student_id)
                                  ? 'bg-purple-600 border-purple-600' 
                                  : 'border-gray-300 group-hover:border-purple-400'
                              }`}>
                                {selectedStudents.has(reg.student_id) && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </label>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{reg.student_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{reg.student_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{reg.faculty}</td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  currentPage === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>ก่อนหน้า</span>
              </button>

              <div className="flex items-center space-x-4">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                  <span className="text-sm text-gray-600">หน้า</span>
                  <span className="mx-2 font-semibold text-purple-600">{currentPage}</span>
                  <span className="text-sm text-gray-600">จาก</span>
                  <span className="ml-2 font-semibold text-purple-600">{totalPages}</span>
                </div>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  currentPage === totalPages
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                <span>ถัดไป</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RecordActivity;