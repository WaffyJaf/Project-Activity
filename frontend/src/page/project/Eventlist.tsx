import { useEffect, useState } from "react";
import { Event, Eventget, updateEvent, deleteEvent } from "../../api/postget";  
import Navbar from "../../component/navbar";
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";


function Eventlist() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function getEvents() {
    try {
      setLoading(true);  
      const data = await Eventget();  
      console.log('Raw events data:', data);
      if (!Array.isArray(data)) {
        throw new Error('ข้อมูลไม่ถูกต้อง');  
      }
      setEvents(data);  
      setError(null);  
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลโพสต์กิจกรรมได้"); 
      console.error(err);  
    } finally {
      setLoading(false);  
    }
  }

  useEffect(() => {
    getEvents();
  }, []);

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
        console.error('เกิดข้อผิดพลาดในการแก้ไขกิจกรรม:', error);
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
          console.error('เกิดข้อผิดพลาดในการลบกิจกรรม:', error);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-600 animate-pulse">กำลังโหลดข้อมูลกิจกรรม...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-xl shadow-md max-w-md text-base">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white ml-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <span className="text-3xl font-extrabold text-purple-800 mb-12 drop-shadow-md">
          ประวัติการ POST กิจกรรม
        </span>
        
        <div className="flex flex-col gap-6 w-full max-w-4xl mt-3.5">
          {events.map((item) => (
            <div 
              key={item.post_id} 
              className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row items-start md:items-center hover:shadow-2xl hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              {item.imge_url && (
                <img 
                  src={`http://localhost:3000${item.imge_url}`}
                  alt="Event Image" 
                  className="w-38 h-45 object-cover rounded-xl md:mr-6 mb-4 md:mb-0 shadow-md"
                  onError={(e) => { e.currentTarget.src = '/path-to-fallback-image.jpg'; }}
                />
              )}
              <div className="flex-1">
                <div className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.post_content}
                </div>
                <div className="text-gray-600 mb-2 text-xm">
                  <span className="font-medium">วันที่:</span> {new Date(item.post_date).toLocaleDateString()}
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xm font-medium border ${renderStatusBadge(item.post_status)}`}>
                  {item.post_status}
                </div>
              </div>
              <div className="flex flex-row gap-3 mt-4 md:mt-0 md:ml-4">
                <button
                  onClick={() => openEditModal(item)}
                  className="bg-green-700 text-white py-1.5 px-4 rounded hover:bg-green-900 transition-colors duration-300 shadow-md text-sm"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDeleteEvent(item.post_id)}
                  className="bg-red-600 text-white py-1.5 px-4 rounded hover:bg-red-700 transition-colors duration-300 shadow-md text-sm"
                >
                  ลบ
                </button>
              </div>
              <div className="absolute bottom-4 left-6 ml-175 "> 
              <Link to={`/Regisactivity/${item.post_id}`}>
                  <button
                    className="text-gray-700   hover:text-gray-900 rounded transition-colors duration-300  text-sm "
                    
                  >
                    รายชื่อลงทะเบียน
                    <i className="fa-solid fa-user ml-3 text-3xl text-gray-700  rounded hover:text-gray-900"></i>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1000] animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl w-[95%] max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slideIn relative">
            <span 
              className="absolute top-4 right-5 text-2xl text-gray-500 cursor-pointer hover:text-gray-800 transition-colors"
              onClick={closeEditModal}
            >
              ×
            </span>
            <span className="text-xl font-bold text-gray-600 mb-6 pb-3 border-b border-purple-100 ml-60">แก้ไขกิจกรรม</span>
            <form onSubmit={submitupdateEvent} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">เนื้อหากิจกรรม:</label>
                <textarea
                  value={selectedEvent.post_content}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, post_content: e.target.value })}
                  className="w-full min-h-[160px] p-3 border border-gray-300 rounded-lg resize-y text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all shadow-sm"
                  placeholder="กรุณากรอกเนื้อหากิจกรรม..."
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">สถานะกิจกรรม:</label>
                <select
                  value={selectedEvent.post_status}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, post_status: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all shadow-sm"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 bg-green-700 text-white rounded-lg font-semibold text-sm hover:bg-green-900 transition-colors shadow-md ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Eventlist;