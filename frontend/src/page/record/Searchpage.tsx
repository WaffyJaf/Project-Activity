import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from "../../component/navbar";
import { getUsers} from '../../api/login';
import {User} from '../../type/user';


function StudentSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const results = await getUsers();
        setUsers(results);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลนิสิตได้ กรุณาลองอีกครั้ง',
          confirmButtonColor: '#9333ea',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Debounced search: Filter users client-side based on searchTerm
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredUsers([]);
        return;
      }

      const filtered = users.filter((user) =>
        user.ms_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.givenName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.surname || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, users]);

  // Handle clicking a user to navigate to their activity page
  const handleUserClick = (ms_id: string) => {
    navigate(`/student/${ms_id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white py-7 px-4 md:px-6 ml-50">
      <Navbar />
      
      <div className="mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <span className="text-2xl md:text-3xl font-extrabold text-purple-900 tracking-tight drop-shadow-sm">
              ค้นหารายชื่อนิสิต
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
              placeholder="ค้นหาด้วยรหัสนิสิตหรือชื่อ"
              className="w-full p-5 pl-14 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-lg transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label="ค้นหานิสิตด้วยรหัสนิสิตหรือชื่อ"
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
          {filteredUsers.length > 0 && (
            <div className="mt-6">
              <div className="bg-purple-50 px-6 py-3 rounded-t-xl border border-purple-100 text-purple-800 font-medium hidden md:grid md:grid-cols-4">
                <div className="col-span-1">รหัสนิสิต</div>
                <div className="col-span-1">ชื่อ-นามสกุล</div>
                <div className="col-span-1">คณะ</div>
                <div className="col-span-1">สถานะ</div>
              </div>
              
              <div className="bg-white rounded-b-xl overflow-hidden shadow-sm border border-purple-100 border-t-0 divide-y divide-purple-100">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.ms_id}
                    className="flex flex-col md:grid md:grid-cols-4 md:items-center p-4 hover:bg-purple-50 transition-all duration-200 cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleUserClick(user.ms_id)}
                  >
                    <div className="col-span-1 font-medium text-purple-900 mb-2 md:mb-0">
                      {user.ms_id}
                    </div>
                    <div className="col-span-1 mb-2 md:mb-0">
                      <p className="text-lg font-semibold text-gray-800">
                        {user.givenName} {user.surname}
                      </p>
                    </div>
                    <div className="col-span-1 mb-4 md:mb-0">
                      <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                        {user.department || 'ไม่ระบุ'}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                        {user.role || 'user'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchTerm && filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12 mt-6 bg-purple-50 rounded-xl border border-purple-100 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4">
                <i className="fa-solid fa-face-sad-tear text-3xl text-purple-300"></i>
              </div>
              <p className="text-lg text-gray-600 mb-2">ไม่พบนิสิตที่ตรงกับการค้นหา</p>
              <p className="text-sm text-gray-500">กรุณาตรวจสอบรหัสนิสิตหรือชื่ออีกครั้ง</p>
            </div>
          )}
          
          {/* Empty State */}
          {!searchTerm && filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12 mt-6 bg-purple-50 rounded-xl border border-purple-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4">
                <i className="fa-solid fa-magnifying-glass text-3xl text-purple-300"></i>
              </div>
              <p className="text-lg text-gray-600">กรุณากรอกรหัสนิสิตหรือชื่อเพื่อค้นหา</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-purple-600">
          <p>ระบบค้นหานิสิต มหาวิทยาลัยพะเยา © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

export default StudentSearch;