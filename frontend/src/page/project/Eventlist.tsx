import { useEffect, useState } from "react";
import { Event, Eventget, updateEvent, deleteEvent } from "../../api/postget";  // เพิ่มการเรียกใช้งาน deleteEvent
import { useNavigate } from "react-router-dom";
import Navbar from "../../component/navbar";
import '../css/Eventlist.css';

function Eventlist() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  // ฟังก์ชันเพื่อดึงข้อมูลกิจกรรมจาก API
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
    getEvents();  // เรียกใช้ฟังก์ชัน getEvents เพื่อดึงข้อมูลกิจกรรมเมื่อโหลด component
  }, []);

  // ฟังก์ชันสำหรับส่งข้อมูลการอัปเดตกิจกรรม
  async function submitupdateEvent(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedEvent?.post_content.trim()) {
      alert('กรุณากรอกเนื้อหากิจกรรม');
      return;
    }
    
    if (selectedEvent) {
      try {
        setIsSubmitting(true);
        await updateEvent(selectedEvent);
        alert('กิจกรรมได้รับการแก้ไขเรียบร้อยแล้ว');
        closeEditModal();
        getEvents();
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการแก้ไขกิจกรรม:', error);
        alert('ไม่สามารถอัปเดตกิจกรรมได้');
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  // ฟังก์ชันสำหรับลบกิจกรรม
  async function handleDeleteEvent(post_id: number) {
    const confirmDelete = window.confirm('คุณต้องการลบกิจกรรมนี้หรือไม่?');
    if (confirmDelete) {
      try {
        await deleteEvent(post_id);  // เรียก API ลบกิจกรรม
        alert('ลบกิจกรรมเรียบร้อย');
        getEvents();  // รีเฟรชข้อมูลกิจกรรมหลังจากลบ
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบกิจกรรม:', error);
        alert('ไม่สามารถลบกิจกรรมได้');
      }
    }
  }

  // ฟังก์ชันเพื่อเปิด modal และตั้งค่ากิจกรรมที่เลือกให้แก้ไข
  function openEditModal(event: Event) {
    setSelectedEvent(event);  
    setIsModalOpen(true);  
  }

  // ฟังก์ชันเพื่อปิด modal
  function closeEditModal() {
    setIsModalOpen(false);  
    setSelectedEvent(null);  
  }

  // ฟังก์ชันเพื่อแสดงสถานะกิจกรรมในรูปแบบ badge
  function renderStatusBadge(status: string): string {
    if (status === 'active') return 'status-active';  
    if (status === 'expired') return 'status-expired';  
    return 'status-pending';  
  }

  if (loading) {
    return <div className="loading">กำลังโหลดข้อมูลกิจกรรม...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <Navbar />
    
      <div className="flexcontainer">
        <span className="head-event">ประวัติการ POST กิจกรรม</span>
        {events.map((item) => (
          <div className="event-content" key={item.post_id}>
            {item.imge_url && (
              <img 
              src={`http://localhost:3000${item.imge_url}`}
              alt="Event Image" 
              className="event-image"
              style={{ maxWidth: '100%', height: 'auto' }}
              onError={(e) => {
                e.currentTarget.src = '/path-to-fallback-image.jpg'; 
              }}
            />
            )}
            <div className="ev-name">{item.post_content}</div>
            <div className="ev-date">{new Date(item.post_date).toLocaleDateString()}</div>
            <div className={`ev-status ${renderStatusBadge(item.post_status)} mt-2`}>
              {item.post_status}
            </div>
            {/* ปุ่มสำหรับเปิด modal แก้ไขกิจกรรม */}
            <button
              onClick={() => openEditModal(item)}  
              className="mt-4 ev-edit-btn"
            >
              แก้ไข
            </button>
            {/* ปุ่มสำหรับลบกิจกรรม */}
            <button
              onClick={() => handleDeleteEvent(item.post_id)}  // เรียกฟังก์ชันลบ
              className="mt-4 ev-delete-btn"
            >
              ลบ
            </button>
          </div>
        ))}
      </div>

      {/* Modal สำหรับการแก้ไขกิจกรรม */}
      {isModalOpen && selectedEvent && (
        <div className="modal-main">
          <div className="modal-content">
            <span className="close" onClick={closeEditModal}>×</span>  
            <h2>แก้ไขกิจกรรม</h2>
            <form onSubmit={submitupdateEvent}>  
              <div>
                <label>เนื้อหากิจกรรม:</label>
                <textarea
                  value={selectedEvent.post_content}  
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, post_content: e.target.value })}  
                />
              </div>
              <div>
                <label>สถานะกิจกรรม:</label>
                <select
                  value={selectedEvent.post_status}  
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, post_status: e.target.value })}  
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting}>
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
