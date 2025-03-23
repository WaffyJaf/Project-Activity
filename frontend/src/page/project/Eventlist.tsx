import { useEffect, useState } from "react";
import { Event, Eventget } from "../../api/eventapi";
import { useNavigate } from "react-router-dom";
import Navbar from "../../component/navbar";
import '../css/Eventlist.css'

function Eventlist() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function getEvent() {
      try {
        setLoading(true);
        const data = await Eventget();
        setEvents(data);
        setError(null);
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูลโพสต์กิจกรรมได้");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    getEvent();
  }, []);


  function renderStatusBadge(status: string): string {
    if (status === 'active') return 'status-active';
    if (status === 'expired') return 'status-expired';
    return 'status-pending'; 
  }

  
  function handleEdit(id: number) {
    navigate(`/events/edit/${id}`);
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
      <div className="p-4 mx-auto flexcontainer">
        <h1 className="text-center text-red">ประวัติการ POST กิจกรรม</h1>
        {events.map((item) => (
          <div className="event-card" key={item.post_id}>
            <div className="ev-name">{item.post_content}</div>
            <div className="ev-date">{new Date(item.post_date).toLocaleDateString()}</div>
            <div className={`ev-status ${renderStatusBadge(item.post_status)} mt-2`}>
              {item.post_status}
            </div>
            {/* ปุ่มแก้ไข */}
            <button
              onClick={() => handleEdit(item.post_id)}
              className="mt-4 ev-edit-btn"
            >
              แก้ไข
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Eventlist;
