import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  // แสดง UI ขณะโหลดข้อมูล
  if (loading) {
    return <div>Loading...</div>;
  }

  // ถ้าไม่มีการล็อกอิน ให้ redirect ไปที่ /login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // ถ้ามี allowedRoles และ role ของผู้ใช้ไม่ตรง ให้ redirect ไปที่ /
  if (allowedRoles && (!currentUser.role || !allowedRoles.includes(currentUser.role))) {
    return <Navigate to="/" replace />;
  }

  // แสดง nested routes
  return <Outlet />;
};

export default ProtectedRoute;