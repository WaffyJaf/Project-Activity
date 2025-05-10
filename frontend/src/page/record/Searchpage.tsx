import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { searchUsers, recordActivity } from '../../api/record';
import { User , ActivityRecordResponse} from '../../type/user';
import Swal from 'sweetalert2';
import Navbar from "../../component/navbar";

function StudentActivity() {
  const { project_id } = useParams<{ project_id: string }>();
  const parsedProjectId = parseInt(project_id || '0', 10);

  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('project_id:', parsedProjectId);
    if (!parsedProjectId || isNaN(parsedProjectId)) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด',
        text: 'รหัสโครงการไม่ถูกต้อง กรุณาตรวจสอบ',
        confirmButtonColor: '#9333ea',
      });
    }
  
  }, [parsedProjectId]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() === '') {
        setUsers([]);
        return;
      }

      setLoading(true);

      try {
        const results = await searchUsers(searchTerm);
        setUsers(results);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถค้นหานิสิตได้ กรุณาลองอีกครั้ง',
          confirmButtonColor: '#9333ea',
        });
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);


const handleRecord = async (user: User) => {
  if (!parsedProjectId || isNaN(parsedProjectId)) {
    Swal.fire({
      icon: 'error',
      title: 'ข้อผิดพลาด',
      text: 'รหัสโครงการไม่ถูกต้อง กรุณาตรวจสอบ',
      confirmButtonColor: '#9333ea',
    });
    return;
  }

  try {
    console.log('Recording:', { project_id: parsedProjectId, ms_id: user.ms_id });
    const response: ActivityRecordResponse = await recordActivity(parsedProjectId, user.ms_id);
    console.log('API Response:', response);

    if (response.status === 'duplicate' || response.error === 'Activity already recorded') {
      Swal.fire({
        icon: 'warning',
        title: 'บันทึกซ้ำ',
        text: `${user.givenName} ${user.surname} ได้บันทึกไปแล้ว!`,
        confirmButtonColor: '#9333ea',
        timer: 2000,
        timerProgressBar: true,
      });
    } else if (response.status === 'success' && response.message?.includes('successfully')) {
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: `บันทึก ${user.givenName} ${user.surname} สำเร็จ!`,
        confirmButtonColor: '#9333ea',
        timer: 2000,
        timerProgressBar: true,
      });
      setSearchTerm('');
      setUsers([]);
    } else {
      throw new Error(`Unexpected response: ${JSON.stringify(response)}`);
    }
  } catch (err: any) {
    console.error('Record error:', err);
    console.log('Error response:', err.response?.data);
    const errorMessage =
      err.response?.data?.error || err.message || 'ไม่สามารถบันทึกได้ กรุณาลองอีกครั้ง';
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: errorMessage,
      confirmButtonColor: '#9333ea',
    });
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white py-7 px-4 md:px-6 ml-50">
      <Navbar />
      
      <div className="mx-auto px-4 max-w-5xl">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <span className="text-2xl md:text-3xl font-extrabold text-purple-900 tracking-tight drop-shadow-sm ">
              บันทึกรายชื่อนิสิต
            </span>
          </div>
        
        </div>
        
        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <i className="fa-solid fa-magnifying-glass text-purple-400 text-xl"></i>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาด้วยรหัสนิสิต "
              className="w-full p-5 pl-14 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-lg transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label="ค้นหานิสิตด้วยรหัสนิสิต"
            />
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
              <p className="mt-3 text-purple-600 text-lg animate-pulse">กำลังค้นหา...</p>
            </div>
          )}

          {/* Results */}
          {users.length > 0 && (
            <div className="mt-6">
              <div className="bg-purple-50 px-6 py-3 rounded-t-xl border border-purple-100 text-purple-800 font-medium hidden md:grid md:grid-cols-5">
                <div className="col-span-1">รหัสนิสิต</div>
                <div className="col-span-2">ชื่อ-นามสกุล</div>
                <div className="col-span-1">คณะ</div>
                <div className="col-span-1 text-center">การดำเนินการ</div>
              </div>
              
              <div className="bg-white rounded-b-xl overflow-hidden shadow-sm border border-purple-100 border-t-0 divide-y divide-purple-100">
                {users.map((user, index) => (
                  <div
                    key={user.ms_id}
                    className="flex flex-col md:grid md:grid-cols-5 md:items-center p-4 hover:bg-purple-50 transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="col-span-1 font-medium text-purple-900 mb-2 md:mb-0">
                      {user.ms_id}
                    </div>
                    <div className="col-span-2 mb-2 md:mb-0">
                      <p className="text-lg font-semibold text-gray-800">
                        {user.givenName} {user.surname}
                      </p>
                    </div>
                    <div className="col-span-1 mb-4 md:mb-0">
                      <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                        {user.department}
                      </span>
                    </div>
                    <div className="col-span-1 flex md:justify-center">
                      <button
                        onClick={() => handleRecord(user)}
                        className="w-full md:w-auto px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md flex items-center justify-center"
                      >
                        <i className="fa-solid fa-check mr-2" />
                        บันทึก
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchTerm && users.length === 0 && !loading && (
            <div className="text-center py-12 mt-6 bg-purple-50 rounded-xl border border-purple-100 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4">
                <i className="fa-solid fa-face-sad-tear text-3xl text-purple-300"></i>
              </div>
              <p className="text-lg text-gray-600 mb-2">ไม่พบนิสิตที่ตรงกับการค้นหา</p>
              <p className="text-sm text-gray-500">กรุณาตรวจสอบรหัสนิสิตอีกครั้ง</p>
            </div>
          )}
          
          {/* Empty State */}
          {!searchTerm && users.length === 0 && !loading && (
            <div className="text-center py-12 mt-6 bg-purple-50 rounded-xl border border-purple-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4">
                <i className="fa-solid fa-magnifying-glass text-3xl text-purple-300"></i>
              </div>
              <p className="text-lg text-gray-600">กรุณากรอกรหัสนิสิตเพื่อค้นหา</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="text-center text-xm text-purple-600 ">
          <p>ระบบเก็บชั่วโมงกิจกรรม มหาวิทยาลัยพะเยา © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

export default StudentActivity;