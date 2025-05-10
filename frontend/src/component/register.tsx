import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleUPLogin = async () => {
    setIsLoading(true);

    try {
      console.log('Initiating UP Account login...');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Swal.fire({
        icon: 'success',
        title: 'UP Account Authentication Successful',
        text: 'Please enter your MS ID to complete the login.',
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate('/login');
      });
    } catch (err: any) {
      console.error('UP Account login error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Authentication Failed',
        text: 'Unable to authenticate with UP Account. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* พื้นหลังที่มีการเบลอ */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/upp.jpg')`,
        }}
      ></div>

      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* เนื้อหา */}
      <div
        className="relative flex rounded-lg shadow-lg overflow-hidden max-w-4xl w-full z-10"
        style={{
          background: 'rgba(255, 255, 255, 0.1)', 
          border: '1px solid rgba(255, 255, 255, 0.2)', 
        }}
      >
        {/* ส่วนซ้าย */}
        <div className="w-1/2 p-8 flex flex-col justify-between bg-gray-900">
          <div className="text-center">
            <img
              src="/uptop.png"
              alt="UP Logo"
              className="mx-auto h-16 mb-2"
              onError={(e) => console.error('Failed to load logo:', e)}
            />
            <h2 className="text-xl font-semibold text-white">มหาวิทยาลัยพะเยา</h2>
            <p className="text-xl text-gray-300">UP ACTIVITY</p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleUPLogin}
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white ${
                isLoading ? 'bg-purple-600 cursor-not-allowed' : 'bg-purple-800 hover:bg-purple-900'
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
                'ล็อกอินด้วย UP Account'
              )}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-300">
            <p>
              หากลืมรหัส กรุณาติดต่อที่เบอร์{' '}
              <span className="font-medium ">054-466-666 ถึง 6290-6295</span>{' '}
              (ในวันและเวลาทำการ)
            </p>
            <Link
              to="/"
              className="mt-2 block text-gray-700 font-medium hover:underline"
            >
              กลับสู่หน้าหลัก UP
            </Link>
          </div>
        </div>

        {/* ส่วนขวา*/}
        <div
          className="w-1/2 bg-cover bg-center relative"
          style={{
            backgroundImage: `url('/logoup.png')`,
            backdropFilter: 'blur(10px)', 
            WebkitBackdropFilter: 'blur(10px)', 
          }}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
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

export default Register;