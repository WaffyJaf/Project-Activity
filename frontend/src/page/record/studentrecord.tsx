import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from "../../component/navbar";
import { getUserActivity } from '../../api/record';
import { UserWithActivity } from '../../type/user';

function StudentActivity() {
  const { ms_id } = useParams<{ ms_id: string }>();
  const [user, setUser] = useState<UserWithActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user activity on component mount
  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!ms_id) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่พบรหัสนิสิต',
          confirmButtonColor: '#9333ea',
        });
        navigate('/search');
        return;
      }

      setLoading(true);
      try {
        const result = await getUserActivity(ms_id);
        setUser(result);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงประวัติกิจกรรมได้ กรุณาลองอีกครั้ง',
          confirmButtonColor: '#9333ea',
        });
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivity();
  }, [ms_id, navigate]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white py-7 px-4 md:px-6 ml-50">
      <Navbar />
      
      <div className="mx-auto px-4 max-w-6xl mt-10">

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-3 text-purple-600 text-lg animate-pulse">กำลังโหลด...</p>
          </div>
        )}

        {/* User Activity */}
        {user && !loading && (
          <div className="space-y-6">
            
            {/* Student Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
               {/* Header Section */}
                <div className=" mb-2 flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <span className="text-2xl md:text-3xl font-extrabold text-purple-900 tracking-tight drop-shadow-sm">
                      ประวัติกิจกรรมนิสิต
                    </span>
                  </div>
                  <button
                    onClick={handleBack}
                    className="mt-4 md:mt-0 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200"
                  >
                    ย้อนกลับ
                  </button>

                  
                </div>
              <h3 className="text-xl font-bold text-purple-900 mb-4">ข้อมูลนิสิต</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">รหัสนิสิต:</span>
                  <span className="ml-2 text-gray-800">{user.ms_id}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">ชื่อ:</span>
                  <span className="ml-2 text-gray-800">{user.givenName || 'ไม่ระบุ'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">นามสกุล:</span>
                  <span className="ml-2 text-gray-800">{user.surname || 'ไม่ระบุ'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">คณะ:</span>
                  <span className="ml-2 text-gray-800">{user.department || 'ไม่ระบุ'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">สถานะ:</span>
                  <span className="ml-2 text-gray-800">{user.role || 'user'}</span>
                </div>
              </div>
            </div>

            {/* Activity History Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <span className="text-xl font text-gray-600 ">ประวัติการเข้าร่วมกิจกรรม</span>
              {user.activity_record.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-purple-50 rounded-lg border border-purple-100 mt-6">
                    <thead>
                      <tr className="bg-purple-100 text-purple-800 text-left text-sm">
                        <th className="py-3 px-4 font-medium">รหัส</th>
                        <th className="py-3 px-4 font-medium text-left">ชื่อโครงการ</th>
                        <th className="py-3 px-4 font-medium text-right">วันที่</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100">
                      {user.activity_record.map((activity) => (
                        <tr key={activity.id} className="hover:bg-purple-50 transition-colors">
                          
                          <td className="py-2 px-4 text-left">{activity.project_id}</td>
                          <td className="py-2 px-4">{activity.project_name}</td>
                          <td className="py-2 px-4 text-left">
                            {activity.joined_at
                              ? new Date(activity.joined_at).toLocaleDateString('th-TH')
                              : 'ไม่ระบุ'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">ไม่มีประวัติกิจกรรม</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-purple-600 mt-8">
          <p>ระบบค้นหานิสิต มหาวิทยาลัยพะเยา © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

export default StudentActivity;