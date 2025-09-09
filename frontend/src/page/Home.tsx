import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Navbar from '../component/navbar';
import { Event, fetchPostByUser, updateEvent, deleteEvent } from '../api/postget';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { History, FilePlus2 } from 'lucide-react';

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEvents() {
      if (!currentUser?.ms_id) {
        setError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchPostByUser(currentUser.ms_id);
        console.log('Raw events data:', data);
        if (!Array.isArray(data)) {
          throw new Error('ข้อมูลไม่ถูกต้อง');
        }
        setEvents(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setError('ไม่สามารถดึงข้อมูลกิจกรรมได้');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [currentUser]);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  function renderStatusBadge(status: string): string {
    if (status === 'active') return 'bg-green-100 text-green-800 border-green-300';
    if (status === 'expired') return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }

  function getStatusText(status: string): string {
    return status === 'active' ? 'เปิดใช้งาน' : status === 'expired' ? 'หมดอายุ' : status;
  }

  async function submitupdateEvent(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedEvent?.post_content.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณากรอกเนื้อหากิจกรรมก่อนบันทึก',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#9333ea',
      });
      return;
    }
    
    if (selectedEvent) {
      try {
        setIsSubmitting(true);
        await updateEvent(selectedEvent);
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'กิจกรรมได้รับการแก้ไขเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#9333ea',
        });
        closeEditModal();
        fetchEvents();
      } catch (error) {
        console.error('Error updating event:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถอัปเดตกิจกรรมได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#9333ea',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  async function handleDeleteEvent(post_id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณต้องการลบกิจกรรมนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#9333ea',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteEvent(post_id);
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            text: 'ลบกิจกรรมเรียบร้อย',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#9333ea',
          });
          fetchEvents();
        } catch (error) {
          console.error('Error deleting event:', error);
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถลบกิจกรรมได้',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#9333ea',
          });
        }
      }
    });
  }

  function openEditModal(event: Event) {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }

  function closeEditModal() {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }

  async function fetchEvents() {
    if (!currentUser?.ms_id) {
      setError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchPostByUser(currentUser.ms_id);
      console.log('Raw events data:', data);
      if (!Array.isArray(data)) {
        throw new Error('ข้อมูลไม่ถูกต้อง');
      }
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('ไม่สามารถดึงข้อมูลโพสต์กิจกรรมได้');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }

  // เงื่อนไขแสดงผลตาม role
  if (currentUser?.role === 'admin') {
    return (
      <div className="min-h-screen bg-[url('/admin-background.jpg')] bg-cover bg-center bg-no-repeat flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-gray-100 min-h-screen overflow-hidden bg-[url('/up.jpg')] bg-cover bg-no-repeat bg-fixed w-full"></div>
        </div>
      </div>
    );
  }
  if (currentUser?.role === 'user') {
    return (
      <div className="min-h-screen bg-[url('/user-background.jpg')] bg-cover bg-center bg-no-repeat flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-gray-100 min-h-screen overflow-hidden bg-[url('/up.jpg')] bg-cover bg-no-repeat bg-fixed w-full">
            {/* ใส่คอมโพเนนต์แดชบอร์ดของผู้ใช้ที่นี่ เช่น <UserDashboard /> */}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-50 to-white px-4 pt-2 ml-60">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900 mb-4"></div>
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูลกิจกรรม...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-50 to-white px-4 pt-2 ml-60">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg max-w-md">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-50 to-white px-4 pt-2 ml-60">
      <Navbar />
      <div className="container mx-auto pb-10 pt-4">
        <div className="bg-purple-800 backdrop-blur-sm rounded-xl p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="text-2xl font-semibold text-white flex items-center">
              <i className="fa-solid fa-bars mr-4"></i>
              ระบบกิจกรรม Universcity of Phayao
            </span>

            <div className="flex items-center gap-3">
              {/* ปุ่ม: ประวัติการเปิดโครงการ (secondary) */}
              <NavLink
                to="/projectlist" // ถ้าใช้ nested route ให้เป็น "projectlist"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-4 py-3  
                  bg-white  text-black shadow-sm transition
                  hover:bg-green-800  ${isActive ? 'ring-2 ring-yellow-300' : ''}`
                }
                aria-label="ประวัติการเปิดโครงการ"
              >
                <History className="hidden sm:block w-5 h-5" aria-hidden="true" />
                <span>ประวัติการเปิดโครงการ</span>
              </NavLink>

              {/* ปุ่ม: เปิดโครงการ (primary) */}
               <NavLink
                to="/createproject" // ถ้าใช้ nested route ให้เป็น "createproject"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-4 py-3 
                  bg-green-600 text-white shadow transition
                  hover:bg-green-800 ${isActive ? 'ring-2 ring-yellow-400' : ''}`
                }
                aria-label="เปิดโครงการ"
              >
                <FilePlus2 className="hidden sm:block w-5 h-5" aria-hidden="true" />
                <span>เปิดโครงการใหม่</span>
              </NavLink>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white backdrop-blur-sm rounded-xl p-6">
          <span className="text-2xl font-semibold text-purple-800  flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ประชาสัมพันธ์กิจกรรม
          </span>
          <div className="mb-2 flex justify-end">
            <div className="inline-block">
              <span className="text-sm text-gray-800">จำนวนกิจกรรมทั้งหมด:</span>
              <span className="ml-2 font-semibold text-purple-600">{events.length}</span>
              <span className="ml-1 text-gray-600">รายการ</span>
            </div>
          </div>
          {events.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-700 mb-2">ไม่มีกิจกรรม</span>
              <p className="text-gray-500">ไม่มีกิจกรรมที่เกี่ยวข้องกับผู้ใช้ {currentUser?.ms_id}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div
                 key={event.post_id}
    onClick={() => event.project_id && navigate(`/projectdetail/${event.project_id}`)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && event.project_id) {
        navigate(`/projectdetail/${event.project_id}`);
      }
    }}
    role="button"
    tabIndex={0}
    className="group bg-white rounded-xl shadow-lg p-3 hover:shadow-xl transition-[transform,box-shadow] duration-200 border border-purple-100 hover:-translate-y-0.5 cursor-pointer"
  >
                  <div className="flex flex-col">
                    {event.imge_url ? (
                      <img
                        src={`http://localhost:3000${event.imge_url}`}
                        alt="Event Image"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        onError={(e) => {
                          e.currentTarget.src = '/path-to-fallback-image.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-grow">
                      <p className="text-lg font-medium text-gray-900 mb-2">{truncateText(event.post_content, 80)}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">วันที่:</span>{' '}
                        {event.post_date
                          ? new Date(event.post_date).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'ไม่ระบุ'}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${renderStatusBadge(event.post_status)}`}>
                        {getStatusText(event.post_status)}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-center space-x-6">
                      <NavLink to={`/Regisactivity/${event.post_id}`}>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1">
                          <i className="fa-solid fa-user fa-xs mr-2 text-white cursor-pointer"></i>
                          <span>รายชื่อ</span>
                        </button>
                      </NavLink>
                      
                      <div className="flex items-center gap-4">
                      <button
                        onClick={() => openEditModal(event)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1"
                      >
                        <i className="fa-solid fa-pen fa-xs mr-2 text-white cursor-pointer"></i>
                        <span>แก้ไข</span>
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(event.post_id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                      >
                        <i className="fa-solid fa-trash fa-xs mr-2 text-white cursor-pointer"></i>
                        <span>ลบ</span>
                      </button>
                    </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Edit Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <span className="text-xl font-bold text-gray-800">แก้ไขกิจกรรม</span>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={submitupdateEvent} className="p-6 space-y-6">
              {selectedEvent.imge_url && (
                <div className="flex justify-center">
                  <img
                    src={`http://localhost:3000${selectedEvent.imge_url}`}
                    alt="Event Preview"
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  เนื้อหากิจกรรม:
                </label>
                <textarea
                  value={selectedEvent.post_content}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, post_content: e.target.value })}
                  className="w-full min-h-32 p-3 border border-gray-300 rounded-lg resize-y text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="กรุณากรอกเนื้อหากิจกรรม..."
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  สถานะกิจกรรม:
                </label>
                <select
                  value={selectedEvent.post_status}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, post_status: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                >
                  <option value="active">เปิดใช้งาน</option>
                  <option value="expired">หมดอายุ</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>บันทึกการเปลี่ยนแปลง</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <footer className="mt-8 py-6 bg-purple-950">
        <div className="container mx-auto px-4 text-center text-purple-200 text-sm">
          © 2025 ระบบเก็บชั่วโมงกิจกรรม | มหาวิทยาลัยพะเยา
        </div>
      </footer>
    </div>
  );
};

export default Home;