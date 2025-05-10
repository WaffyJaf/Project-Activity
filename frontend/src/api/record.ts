import axios from 'axios';
import { User, ActivityRecordResponse } from '../type/user';

const API_URL = 'http://localhost:3000/record';

export const searchUsers = async (ms_id: string): Promise<User[]> => {
  const response = await axios.get(`${API_URL}/search-users`, {
    params: { ms_id },
  });
  return response.data;
};

export const recordActivity = async (
  project_id: number,
  ms_id: string
): Promise<ActivityRecordResponse> => {
  const response = await axios.post(
    `${API_URL}/activityrecord`,
    {
      project_id,
      ms_id,
    },
    {
      validateStatus: (status) => status >= 200 && status < 500, 
    }
  );
  return response.data;
};