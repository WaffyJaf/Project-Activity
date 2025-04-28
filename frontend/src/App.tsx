import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './component/login';
import Createproject from './page/project/Createproject';
import Projectlist from './page/project/Projectlist';
import Projectdetail from './page/project/Projectdetail';
import Eventlist from './page/project/Eventlist';
import Projectstatus from './Admin/Projectstatus';
import Regisname from './page/project/Regisname';
import Home from './page/Home';
import RoleManager from './Admin/Rolemanager';
import ProtectedRoute from './component/ProtectedRouter';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/projectdetail/:id" element={<Projectdetail />} />
            <Route path="/regisactivity/:post_id" element={<Regisname />} />
          </Route>

          {/* Admin only */}
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

const CatchAllRoute: React.FC = () => {
  const { currentUser } = useAuth();
  return <Navigate to={currentUser ? '/' : '/login'} replace />;
};

export default App;