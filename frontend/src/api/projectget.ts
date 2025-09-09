import axios from 'axios';

export interface Project {
  project_id: number;
  project_name: string;
  created_date: string | Date;
  project_status: string;
  approval_datetime?: string | Date;
  project_datetime?: string | Date;
  qrCodeData?: string;
  ms_id?: string;
  created_by?: string; 
  project_description?: string | null;
  rejected_reason?: string;
  location?: string;
  hours?: number;
  budget?: string | number;
  department?: string;
}

const API_URL = 'http://localhost:3000/project/getproject';
const UPDATE_API_URL = 'http://localhost:3000/project/statusproject';


export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await axios.get<Project[]>(API_URL);
    // เผื่อ backend เปลี่ยนแปลง ถ้าไม่ใช่อาร์เรย์ให้คืน []
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโครงการ', err);
    return [];
  }
}

export const fetchProjectsByUser = async (ms_id: string): Promise<Project[]> => {
  try {
    const response = await axios.get<Project[]>(`http://localhost:3000/getby/${ms_id}`);
    if (!Array.isArray(response.data)) return [];

    return response.data.map((project) => ({
      ...project,
      created_date: project.created_date ? new Date(project.created_date) : new Date(),
      approval_datetime: project.approval_datetime ? new Date(project.approval_datetime) : undefined,
      project_datetime: project.project_datetime ? new Date(project.project_datetime) : undefined,
    }));
  } catch (error) {
    console.error("fetchProjectsByUser error:", error);
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



export async function updateProjectStatus(projectId: number, status: string, reason?: string): Promise<void> {
  try {
    await axios.patch(
      `${UPDATE_API_URL}/${projectId}`,
      {
        project_status: status,
        rejected_reason: reason || null, 
        updated_date: new Date().toISOString(),
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error(`เกิดข้อผิดพลาดในการอัพเดทสถานะโครงการ ${projectId}:`, err);
    throw err;
  }
}
