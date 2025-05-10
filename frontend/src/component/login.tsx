import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/login';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { LoginResponse, User, UserRole } from '../type/user';

const Login: React.FC = () => {
  const [msId, setMsId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsId(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msId.trim()) {
      setError('กรุณาป้อน MS ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending msId:', msId);
      const response: LoginResponse = await loginUser({ msId });
      console.log('Response:', response);

      if (!response.user) {
        throw new Error('Invalid response data');
      }

      const user: User = {
        id: response.user.id,
        ms_id: response.user.ms_id,
        givenName: response.user.givenName || 'Unknown',
        surname: response.user.surname || 'User',
        jobTitle: response.user.jobTitle || 'N/A',
        department: response.user.department || 'N/A',
        displayName: response.user.displayName || `${response.user.givenName || 'Unknown'} ${response.user.surname || 'User'}`,
        role: (response.user.role?.toLowerCase() as UserRole) || 'organizer',
        created_at: response.user.created_at ? new Date(response.user.created_at) : new Date(),
      };

      login(user);

      Swal.fire({
        icon: 'success',
        title: 'ล็อกอินสำเร็จ',
        text: `ยินดีต้อนรับ, ${user.displayName}!`,
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate('/');
      });
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'MS ID ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'ล็อกอินล้มเหลว',
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative font-kanit">
      {/* พื้นหลังที่มีการเบลอ */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/upp.jpg')`,
          filter: 'blur(10px)',
          WebkitFilter: 'blur(10px)',
          
        }}
      ></div>

      {/* Overlay เพื่อให้พื้นหลังดูมืดลง */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* เนื้อหา */}
      <div
        className="relative flex flex-col md:flex-row rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full mx-4 z-10 animate-fade-in"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between bg-white">
          <div className="text-center">
            <img
              src="/uptop.png"
              alt="UP Logo"
              className="mx-auto h-20 mb-4 transition-transform duration-300 hover:scale-105"
              onError={(e) => console.error('Failed to load logo:', e)}
            />
            <h2 className="text-2xl font-semibold text-gray-800">มหาวิทยาลัยพะเยา</h2>
            <p className="text-lg text-gray-600 mt-1">UP ACTIVITY</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MS ID
              </label>
              <input
                type="text"
                name="msId"
                value={msId}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                placeholder="กรอก MS ID (เช่น user123 หรือ user@domain.com)"
                autoFocus
              />
            </div>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white transition-all duration-300 ${
                isLoading
                  ? 'bg-purple-600 cursor-not-allowed'
                  : 'bg-purple-800 hover:bg-purple-900 hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-5 h-5 mr-2 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังล็อกอิน...
                </>
              ) : (
                'ล็อกอิน'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              หากลืมรหัส กรุณาติดต่อที่เบอร์{' '}
              <span className="font-medium text-gray-800">054-466-666 ถึง 6290-6295</span>{' '}
              (ในวันและเวลาทำการ)
            </p>
            <Link
              to="/register"
              className="mt-2 block text-purple-700 font-medium hover:underline transition-colors duration-300"
            >
              กลับไปหน้า Register
            </Link>
          </div>
        </div>

        {/* ส่วนขวา: ภาพล็อก (เบลอ) */}
        <div
          className="w-full md:w-1/2 bg-cover bg-center relative"
          style={{
            backgroundImage: `url('/logoup.png')`,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors duration-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;