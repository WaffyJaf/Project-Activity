import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Navbar from '../component/navbar';
import { Event, fetchPostByUser } from '../api/postget';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    if (status === 'active') return 'text-green-600 border-green-300';
    if (status === 'expired') return 'text-red-600 border-red-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-50 to-white px-4 pt-2 ml-60">
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
      <div className="container mx-auto pb-10 mt-15">
        <div className="bg-purple-800 backdrop-blur-sm rounded-xl p-6">
          <span className="text-2xl font-semibold text-white mb-6 flex items-center">
            <i className="fa-solid fa-bars mr-4"></i>
            ระบบกิจกรรม Universcity of Phayao
          </span>
          <nav className="ml-0 mt-10">
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <li className="transform transition-transform hover:scale-105">
                <NavLink
                  to="/createproject"
                  className={({ isActive }) =>
                    `flex items-center bg-white ${
                      isActive ? 'border-yellow-400 bg-purple-700' : 'border-purple-600'
                    } rounded-xl p-4 hover:bg-purple-700 transition-all shadow-lg`
                  }
                >
                  <img src="/11950307.png" alt="เปิดโครงการ" className="w-20 h-20 rounded-lg mr-4" />
                  <div>
                    <span className="text-black font-medium text-lg block">เปิดโครงการ</span>
                    <span className="text-gray-500 text-sm">สร้างโครงการใหม่</span>
                  </div>
                </NavLink>
              </li>
              <li className="transform transition-transform hover:scale-105">
                <NavLink
                  to="/projectlist"
                  className={({ isActive }) =>
                    `flex items-center bg-white ${
                      isActive ? 'border-yellow-400 bg-purple-700' : 'border-purple-600'
                    } rounded-xl p-4 hover:bg-purple-700 transition-all shadow-lg`
                  }
                >
                  <img src="/story.png" alt="ประวัติการเปิดโครงการ" className="w-14 h-18 rounded-lg mr-4" />
                  <div>
                    <span className="text-black font-medium text-lg block">ประวัติการเปิดโครงการ</span>
                    <span className="text-gray-500 text-sm">ตรวจสอบโครงการที่ผ่านมา</span>
                  </div>
                </NavLink>
              </li>
              <li className="transform transition-transform hover:scale-105">
                <NavLink
                  to="/eventlist"
                  className={({ isActive }) =>
                    `flex items-center bg-white ${
                      isActive ? 'border-yellow-400 bg-purple-700' : 'border-purple-600'
                    } rounded-xl p-4 hover:bg-purple-700 transition-all shadow-lg`
                  }
                >
                  <img src="/activity.png" alt="ประชาสัมพันธ์กิจกรรม" className="w-22 h-18 rounded-lg mr-4" />
                  <div>
                    <span className="text-black font-medium text-lg block">กิจกรรม</span>
                    <span className="text-gray-500 text-sm">การจัดการกิจกรรม รายชื่อลงทะเบียน</span>
                  </div>
                </NavLink>
              </li>
              <li className="transform transition-transform hover:scale-105">
                <NavLink
                  to="/search"
                  className={({ isActive }) =>
                    `flex items-center bg-white ${
                      isActive ? 'border-yellow-400 bg-purple-700' : 'border-purple-600'
                    } rounded-xl p-4 hover:bg-purple-700 transition-all shadow-lg`
                  }
                >
                  <img src="/5580956.png" alt="ค้นหาประวัตินิสิต" className="w-30 h-20 rounded-lg mr-4" />
                  <div>
                    <span className="text-black font-medium text-lg block">ค้นหาประวัตินิสิต</span>
                    <span className="text-gray-500 text-sm">ข้อมูลนิสิต</span>
                  </div>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-8 bg-white backdrop-blur-sm rounded-xl p-6">
          <span className="text-2xl font-semibold text-purple-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            กิจกรรมล่าสุด
          </span>
          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.post_id} className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="bg-purple-500 w-2 h-10 rounded-full mr-3"></div>
                    <div>
                      <span className="text-black font-medium">{truncateText(event.post_content, 20)}</span>
                      <div className="text-gray-600 mb-2 text-xm">
                        <span className="font-medium">วันที่:</span>{' '}
                        {event.post_date
                          ? new Date(event.post_date).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'ไม่ระบุ'}
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xm font-medium border ${renderStatusBadge(event.post_status)}`}>
                    {event.post_status === 'active' ? 'เปิดใช้งาน' : event.post_status === 'expired' ? 'หมดอายุ' : event.post_status}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">ไม่มีข้อมูลกิจกรรมสำหรับผู้ใช้ {currentUser?.ms_id}</p>
            )}
          </div>
        </div>
      </div>
      <footer className="mt-8 py-6 bg-purple-950">
        <div className="container mx-auto px-4 text-center text-purple-200 text-sm">
          © 2025 ระบบเก็บชั่วโมงกิจกรรม | มหาวิทยาลัยพะเยา
        </div>
      </footer>
    </div>
  );
};

export default Home;