import axios from 'axios';
import {User , UserRole , LoginResponse} from '../type/user'

const API_URL = 'http://localhost:3000/auth';

export const loginUser = async (data: { msId: string }): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, { ms_id: data.msId });
    return response.data as LoginResponse;
  } catch (error: any) {
    console.error('Login API error:', error);
    const errorMessage = error.response?.data?.error || 'Login failed';
    throw new Error(errorMessage);
  }
};

export const updateUserRole = async (userId: number, role: UserRole): Promise<User> => {
  try {
    const response = await axios.post(`${API_URL}/updaterole`, {
      userId,
      role,
    });
    return response.data.user; 
  } catch (error) {
    console.error('Update role API error:', error);
    throw new Error('Failed to update role');
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${API_URL}/getusers`);
    return response.data;
  } catch (error) {
    console.error('Get users API error:', error);
    throw new Error('Failed to fetch users');
  }
};