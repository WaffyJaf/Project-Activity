import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/login';
import { useAuth } from '../context/AuthContext';

// ไม่ต้องกำหนด interface สำหรับ props เพราะไม่รับ prop อีกต่อไป
const Login: React.FC = () => {
  const [msId, setMsId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const { setCurrentUser } = useAuth(); 

  const handleLogin = async () => {
    if (!msId.trim()) {
      setError('กรุณาป้อน MS ID');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const userData = await loginUser(msId);
      setCurrentUser(userData); // ใช้ setCurrentUser จาก context
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/');
    } catch (err) {
      setError('การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบ MS ID และลองใหม่');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">เข้าสู่ระบบ</h2>
          <p className="mt-2 text-sm text-gray-600">ป้อน MS ID ของคุณเพื่อดำเนินการต่อ</p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="msId" className="block text-sm font-medium text-gray-700">
              MS ID
            </label>
            <div className="mt-1">
              <input
                id="msId"
                type="text"
                value={msId}
                onChange={(e) => setMsId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="ป้อน MS ID ของคุณ"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;