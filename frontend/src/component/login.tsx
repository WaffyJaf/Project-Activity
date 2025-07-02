import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUser } from '../api/login';
import { User } from '../type/user';

const Login: React.FC = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Microsoft OAuth callback
  useEffect(() => {
    const query = new URLSearchParams(search);
    const token = query.get('token');

    console.log('Login: Pathname:', pathname);
    console.log('Login: Query params:', search);
    console.log('Login: Token received:', token);

    if (token && !isLoading) {
      localStorage.setItem('authToken', token);
      setIsLoading(true);
      setError(null);

      getUser()
        .then((user: User) => {
          console.log('Login: User fetched:', user);
          if (user && user.ms_id) {
            user.created_at = new Date(user.created_at);
            if (isNaN(user.created_at.getTime())) {
              console.error('Login: Invalid created_at date:', user.created_at);
              user.created_at = new Date(); // Fallback to current date
            }
            login(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('Login: User set and redirecting to /home');
            navigate('/home', { replace: true });
          } else {
            throw new Error('Invalid user data received');
          }
        })
        .catch((error: Error) => {
          console.error('Login: Error fetching user:', error);
          setError(error.message || 'Failed to fetch user data');
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          navigate('/login', { replace: true });
        })
        .finally(() => {
          setIsLoading(false);
          console.log('Login: Loading finished');
        });
    } else if (!token) {
      console.log('Login: No token found in query parameters');
    }
  }, [pathname, search, navigate, login]);

  const handleMicrosoftLogin = () => {
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_MICROSOFT_REDIRECT_URI || 'http://localhost:3000/auth/microsoft/callback';
    const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID;

    console.log('Login: Microsoft login initiated', { clientId, redirectUri, tenantId });

    if (!clientId || !tenantId) {
      setError('Microsoft authentication configuration is missing');
      console.error('Login: Missing Microsoft configuration');
      return;
    }

    const microsoftAuthUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_mode=query&` +
      `scope=openid profile email User.Read&` +
      `state=${Math.random().toString(36).substring(2)}`;

    console.log('Login: Redirecting to Microsoft:', microsoftAuthUrl);
    window.location.href = microsoftAuthUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/upp.jpg')` }}
      ></div>
      <div className="absolute inset-0 bg-black opacity-30"></div>

      <div
        className="relative flex rounded-lg shadow-lg overflow-hidden max-w-4xl w-full z-10"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <div className="w-1/2 p-8 flex flex-col justify-between bg-gray-900">
          <div className="text-center">
            <img
              src="/uptop.png"
              alt="UP Logo"
              className="mx-auto h-16 mb-2"
              onError={(e) => console.error('Login: Failed to load logo:', e)}
            />
            <h2 className="text-xl font-semibold text-white">มหาวิทยาลัยพะเยา</h2>
            <p className="text-xl text-white">UP ACTIVITY</p>
          </div>

          {error && (
            <div className="mt-4 text-center text-sm text-red-400">
              <p>{error}</p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white ${
                isLoading ? 'bg-blue-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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
                  กำลังตรวจสอบ...
                </>
              ) : (
                'ล็อกอินด้วย Microsoft'
              )}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-300">
            <p>
              หากลืมรหัส กรุณาติดต่อที่เบอร์{' '}
              <span className="font-medium">054-466-666 ถึง 6290-6295</span>{' '}
              (ในวันและเวลาทำการ)
            </p>
          </div>
        </div>

        <div
          className="w-1/2 bg-cover bg-center relative"
          style={{
            backgroundImage: `url('/logoup.png')`,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        ></div>
      </div>
    </div>
  );
};

export default Login;