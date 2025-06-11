export type UserRole = 'admin' | 'organizer'| 'user';

export interface User {
  id: number;
  ms_id: string;
  givenName: string;
  surname: string;
  jobTitle: string;
  department: string;
  displayName: string;
  role: UserRole;
  created_at: Date;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    ms_id: string;
    givenName: string;
    surname: string;
    jobTitle: string;
    department: string;
    displayName: string;
    role: string;
    created_at: string;
  };
}

export interface ActivityRecord {
  id: number;
  project_id: number;
  project_name: string;
  ms_id: string;
  joined_at: string | null; 
}
export interface ActivityRecordResponse {
  status?: 'success' | 'error' | 'duplicate';
  message?: string;
  error?: string;
  code?: string;
  data?: {
    activity?: ActivityRecord;
  };
}

export interface UserWithActivity extends User {
  activity_record: ActivityRecord[];
}
