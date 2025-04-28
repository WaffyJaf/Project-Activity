export type UserRole = 'admin' | 'organizer';

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