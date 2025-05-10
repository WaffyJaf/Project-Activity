import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './component/login';
import Createproject from './page/project/Createproject';
import Projectlist from './page/project/Projectlist';
import Projectdetail from './page/project/Projectdetail';
import Projectrecord from './page/record/Projectrecord';
import Eventlist from './page/project/Eventlist';
import Projectstatus from './Admin/Projectstatus';
import Searchpage from './page/record/searchpage';
import Regisname from './page/project/Regisname';
import Home from './page/Home';
import RoleManager from './Admin/Rolemanager';
import ProtectedRoute from './component/ProtectedRouter';
import Register from './component/register';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} /> 
            <Route path="/projectdetail/:id" element={<Projectdetail />} />
            <Route path="/projectrecord" element={<Projectrecord />} />
            <Route path="/search/:project_id" element={<Searchpage />} />
            <Route path="/regisactivity/:post_id" element={<Regisname />} />
          </Route>

          {/* Organizer only */}
          <Route element={<ProtectedRoute allowedRoles={['organizer']} />}>
            <Route path="/projectlist" element={<Projectlist />} />
            <Route path="/createproject" element={<Createproject />} />
            <Route path="/eventlist" element={<Eventlist />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/adminrole" element={<RoleManager />} />
            <Route path="/projectstatus" element={<Projectstatus />} />
          </Route>

          {/* Root path redirect */}
          <Route
            path="/"
            element={<RootRoute />}
          />

          {/* Catch-all route */}
          <Route
            path="*"
            element={<CatchAllRoute />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// หน้า Root สำหรับจัดการ root path
const RootRoute: React.FC = () => {
  const { currentUser } = useAuth();
  return <Navigate to={currentUser ? '/home' : '/register'} replace />;
};

// หน้า Catch-all สำหรับเส้นทางที่ไม่รู้จัก
const CatchAllRoute: React.FC = () => {
  const { currentUser } = useAuth();
  return <Navigate to={currentUser ? '/home' : '/register'} replace />;
};

export default App;