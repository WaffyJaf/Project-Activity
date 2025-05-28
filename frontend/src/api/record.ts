import axios, { AxiosResponse } from 'axios';
import { User } from '../type/user';


export interface RecordACInput {
  project_id: number;
  student_id: string;
  student_name: string;
  faculty: string;
}

export interface Registration {
  register_id: number;
  post_id: number;
  student_id: string;
  student_name: string;
  faculty: string;
  post_content?: string;
  post_date?: string;
  location_post?: string;
  project_name?: string;
}

interface ApiResponse {
  message: string;
  data: Registration[];
  total: number;
}


export const searchUsers = async (ms_id: string): Promise<User[]> => {
  const response = await axios.get("http://localhost:3000/record/search-users", {
    params: { ms_id },
  });
  return response.data;
};


export const recordActivity = async (project_id: number, ms_id: string) => {
  try {
    const response = await axios.post("http://localhost:3000/record/activityrecord", { project_id, ms_id });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to record activity");
  }
};

export const getProjectIdFromPostId = async (post_id: number) => {
  try {
    const response = await axios.get(`http://localhost:3000/record/event-posts/${post_id}`);
    return response.data.project_id;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch project ID");
  }
};

export const fetchRegistrationsByProject = async (
  projectId: number,
  page: number,
  limit: number
): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axios.get(
      `http://localhost:3000/record/regis/${projectId}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error('project_id ไม่ถูกต้อง');
      } else if (error.response.status === 404) {
        throw new Error(error.response.data.message || 'ไม่พบข้อมูล');
      }
    }
    throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
  }
};



