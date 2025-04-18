import axios from 'axios';

const API_URL = 'http://localhost:3000/auth';

export type UserRole = 'admin' | 'organizer';

export interface User {
  id: number;
  ms_id: string;
  givenName: string;
  surname: string;
  jobTitle: string;
  department: string;
  displayName:string;
  role: UserRole;
  created_at: Date;
}

export const loginUser = async (ms_id: string): Promise<User> => {
  try {
    const response = await axios.post(`${API_URL}/login`, { ms_id });
    return response.data.user;
  } catch (error) {
    console.error('Login API error:', error);
    throw new Error('Login failed');
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