import axios from 'axios';

interface DashboardStats {
  totalActivities: number;
  activitiesByFaculty: { faculty: string; count: number }[];
  activitiesByStatus: { status: string; count: number }[];
  activitiesByDepartment: { department: string | null; count: number }[];
}

interface Activity {
  project_id: number;
  project_name: string;
  project_status: string;
  department: string;
  created_date: string;
  registration_activity: { faculty: string }[];
}

interface ActivitiesResponse {
  activities: Activity[];
  total: number;
  page: number;
  limit: number;
}

// ✅ พารามิเตอร์กรองตามปีการศึกษา/ช่วงวัน
type DashboardQuery = {
  ay?: string;      // ปีการศึกษา (ค.ศ. หรือ พ.ศ.)
  from?: string;    // ISO date string
  to?: string;      // ISO date string
};

type ActivitiesQuery = DashboardQuery & {
  faculty?: string;
  status?: string;
  page: number;
  department?: string;
  limit: number;
};


export const fetchDashboardStats = async (params?: { ay?: string; from?: string; to?: string }): Promise<DashboardStats> => {
  const response = await axios.get('http://localhost:3000/api/dashboard', {
    params,
  });
  return response.data;
};

export const fetchActivities = async (
  params: ActivitiesQuery
): Promise<ActivitiesResponse> => {
  const response = await axios.get('http://localhost:3000/api/dashboard/activities', {
    params,
  });
  return response.data;
};
