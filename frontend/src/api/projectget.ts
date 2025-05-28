import axios from 'axios';

export interface Project {
  project_id: number;
  project_name: string;
  created_date: string;
  project_status: string;
  project_description: string;
  department: string;
  location: string;
  budget: string;
  hours: number;
  project_datetime: string;
  approval_datetime: string;
}

const API_URL = "http://localhost:3000/project/getproject"

export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await axios.get<Project[]>(`${API_URL}`);
    return response.data;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลโครงการ", error);
    return [];
  }
}

export const fetchProjectsByUser = async (ms_id: string): Promise<Project[]> => {
  try {
    const response = await axios.get(`http://localhost:3000/getby/${ms_id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;
    return data.map((project: any) => ({
      ...project,
      created_date: new Date(project.created_date),
      approval_datetime: project.approval_datetime ? new Date(project.approval_datetime) : null,
      project_datetime: project.project_datetime ? new Date(project.project_datetime) : null,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return [];
  }
};

export async function fetchProjectByID(id: string | undefined): Promise<Project> {
  if (!id) {
    throw new Error("ไม่ได้ระบุ id โครงการ");
  }
  try {
    const response = await axios.get<Project>(`http://localhost:3000/project/projectid/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    throw error;
  }
}



export async function updateProjectStatus(projectId: number, status: string): Promise<Project> {
  try {
    const response = await axios.patch<Project>(
      `http://localhost:3000/project/statusproject/${projectId}`,
      { project_status: status },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    console.error(`เกิดข้อผิดพลาดในการอัพเดทสถานะโครงการ ${projectId}:`, error);
    throw error;
  }
}
