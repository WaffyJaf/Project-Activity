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
