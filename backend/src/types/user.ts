import { Prisma } from '@prisma/client';

export enum UserRole {
  Student = 'user',
  Admin = 'admin',
}

export interface User {
  id?: number;
  ms_id: string;
  givenName?: string;
  surname?: string;
  jobTitle?: string;
  department?: string;
  displayName?: string;
  role?: UserRole;
  created_at?: Date | null;
  qrCodeId?: string;
}

export interface ActivityRecord {
  id: number;
  project_id: number;
  project_name: string;
  ms_id: string;
  joined_at?: Date | null;
}

export type UserWithActivity = Prisma.users_upGetPayload<{
  include: {
    activity_record: {
      include: {
        project_activity: {
          select: {
            project_name: true;
          };
        };
      };
    };
  };
}>;