import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/login'; // หรือ login.ts
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
      console.log('Sending msId:', msId); // Debug: ตรวจสอบค่า msId
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
        title: 'Login Successful',
        text: `Welcome back, ${user.displayName}!`,
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate('/');
      });
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Invalid MS ID. Please try again.';
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your MS ID (e.g., user123 or user@domain.com)"
              autoFocus
            />
          </div>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;