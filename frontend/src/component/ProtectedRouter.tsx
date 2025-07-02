import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Checking authentication', { currentUser, loading, allowedRoles, pathname: location.pathname });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    console.log('ProtectedRoute: No user, redirecting to /login from', location.pathname);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    console.log(`ProtectedRoute: User role ${currentUser.role} not allowed, redirecting to /home from`, location.pathname);
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;