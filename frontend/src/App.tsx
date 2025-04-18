import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './component/login';
import Createproject from './page/project/Createproject';
import Projectlist from './page/project/Projectlist';
import Projectdetail from './page/project/Projectdetail';
import Eventlist from './page/project/Eventlist';
import Projectstatus from './Admin/Projectstatus';
import Regisname from './page/project/Regisname';
import Home from './page/Home';
import './App.css';
import RoleManager from './Admin/Rolemanager';
import { User } from './api/login';

interface ProtectedRouteProps {
  user: User | null;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, user }) => {
  const isAuthenticated = !!user || !!localStorage.getItem('user');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const { currentUser, setCurrentUser } = useAuth();

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public route */}
          <Route
            path="/login"
            element={currentUser ? <Navigate to="/" replace /> : <Login />}
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={<ProtectedRoute user={currentUser}><Home /></ProtectedRoute>}
          />
          <Route
            path="/createproject"
            element={<ProtectedRoute user={currentUser}><Createproject /></ProtectedRoute>}
          />
          <Route
            path="/projectlist"
            element={<ProtectedRoute user={currentUser}><Projectlist /></ProtectedRoute>}
          />
          <Route
            path="/projectdetail/:id"
            element={<ProtectedRoute user={currentUser}><Projectdetail /></ProtectedRoute>}
          />
          <Route
            path="/regisactivity/:post_id"
            element={<ProtectedRoute user={currentUser}><Regisname /></ProtectedRoute>}
          />
          <Route
            path="/eventlist"
            element={<ProtectedRoute user={currentUser}><Eventlist /></ProtectedRoute>}
          />
          <Route
            path="/adminrole"
            element={<ProtectedRoute user={currentUser}><RoleManager /></ProtectedRoute>}
          />
          <Route
            path="/projectstatus"
            element={<ProtectedRoute user={currentUser}><Projectstatus /></ProtectedRoute>}
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);
