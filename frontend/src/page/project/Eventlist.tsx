import { useEffect, useState } from "react";
import { Event, fetchPostByUser, updateEvent, deleteEvent } from "../../api/postget";  
import Navbar from "../../component/navbar";
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

function Eventlist() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function getEvents() {
    if (!currentUser?.ms_id) {
      setError("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ");
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
      setError("ไม่สามารถดึงข้อมูลโพสต์กิจกรรมได้");
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getEvents();
  }, [currentUser]);

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
        getEvents();
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
          getEvents();
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

  function renderStatusBadge(status: string): string {
    if (status === 'active') return 'bg-green-100 text-green-800 border-green-300';
    if (status === 'expired') return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }

  function getStatusText(status: string): string {
    return status === 'active' ? 'เปิดใช้งาน' : status === 'expired' ? 'หมดอายุ' : status;
  }

  function truncateText(text: string, maxLength: number = 100): string {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูลกิจกรรม...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 ml-65">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 flex flex-col md:flex-row justify-between items-center">
          <div className="w-full flex justify-between items-center">
            <span className="text-2xl font-extrabold text-purple-900 tracking-tight drop-shadow-sm">
              การจัดการกิจกรรม
            </span>
            <i className="fa-solid fa-newspaper fa-2xl text-purple-800"></i>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-2 flex justify-end">
          <div className="inline-block">
            <span className="text-sm text-gray-800">จำนวนกิจกรรมทั้งหมด:</span>
            <span className="ml-2 font-semibold text-purple-600">{events.length}</span>
            <span className="ml-1 text-gray-600">รายการ</span>
          </div>
        </div>

        {/* Table */}
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r bg-purple-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">ไอดี</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">รูปภาพ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">เนื้อหากิจกรรม</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">วันที่โพสต์</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">สถานะ</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((item, index) => (
                    <tr
                      key={item.post_id}
                      className={`transition-all duration-200 hover:bg-purple-50 ${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.post_id}</td>
                      <td className="px-6 py-4">
                        {item.imge_url ? (
                          <img
                            src={`http://localhost:3000${item.imge_url}`}
                            alt="Event Image"
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = '/path-to-fallback-image.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <p className="font-medium mb-1">{truncateText(item.post_content, 80)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {item.post_date
                          ? new Date(item.post_date).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'ไม่ระบุ'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${renderStatusBadge(item.post_status)}`}>
                          {getStatusText(item.post_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Link to={`/Regisactivity/${item.post_id}`}>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1">
                              <i className="fa-solid fa-user fa-xs mr-2 text-white cursor-pointer"></i>
                              <span>รายชื่อ</span>
                            </button>
                          </Link>
                          <button
                            onClick={() => openEditModal(item)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1"
                          >
                            <i className="fa-solid fa-pen fa-xs mr-2 text-white cursor-pointer"></i>
                            <span>แก้ไข</span>
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(item.post_id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                          >
                            <i className="fa-solid fa-trash fa-xs mr-2 text-white cursor-pointer"></i>
                            <span>ลบ</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}

export default Eventlist;