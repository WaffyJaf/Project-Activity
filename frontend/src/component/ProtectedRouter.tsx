import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../type/user';

type Props = { allowedRoles?: UserRole[] };

const ProtectedRoute: React.FC<Props> = ({ allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Checking authentication', {
    currentUser,
    loading,
    allowedRoles,
    pathname: location.pathname,
  });

  if (loading) return <div>Loading...</div>;

  if (!currentUser) {
    console.log('ProtectedRoute: No user, redirecting to /login from', location.pathname);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // ทำให้ role เป็นค่าแน่นอนเสมอ (กัน null)
  const role: UserRole = (currentUser.role ?? 'user') as UserRole;

  if (allowedRoles && !allowedRoles.includes(role)) {
    console.log(`ProtectedRoute: User role ${role} not allowed, redirecting to /home from`, location.pathname);
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
