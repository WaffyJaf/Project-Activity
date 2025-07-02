import axios from 'axios';
import {User , UserRole , LoginResponse} from '../type/user'

const API_URL = 'http://localhost:3000/auth';



// export const loginUser = async (data: { msId: string }): Promise<LoginResponse> => {
//   try {
//     const response = await axios.post(`${API_URL}/login`, { ms_id: data.msId });
//     return response.data as LoginResponse;
//   } catch (error: any) {
//     console.error('Login API error:', error);
//     const errorMessage = error.response?.data?.error || 'Login failed';
//     throw new Error(errorMessage);
//   }
// };

export const updateUserRole = async (msId: string, role: UserRole): Promise<User> => {
  try {
    console.log('sending:', { userId: msId, role });
    
    const response = await axios.post(`http://localhost:3000/auth/updaterole`, {
      userId: msId,  
      role
    });
    
    return response.data.user;
  } catch (error: any) {
    console.error('Update role API error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update role');
  }
};

export const getUser = async (): Promise<User> => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('getUser: Sending request with token:', token);
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await axios.get(`${API_URL}/getuser`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('getUser: Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('getUser: Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('getUsers: Sending request with token:', token);
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await axios.get(`${API_URL}/getusers`, { 
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('getUsers: Response:', response.data);
    return response.data as User[];
  } catch (error: any) {
    console.error('getUsers: Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};