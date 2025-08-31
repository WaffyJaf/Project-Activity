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
import Regisname from './page/project/Regisname';
import Home from './page/Home';
import RecordActivity from './page/record/recordname';
import Searchpage from './page/record/Searchpage';
import RoleManager from './Admin/Rolemanager';
import ProtectedRoute from './component/ProtectedRouter';
import StudentActivity from './page/record/studentrecord';
import  ParticipantsList from './page/project/ParticipantsList';
import RoleChangeRequestManager from './Admin/RoleRequestManager';
import RoleChangeRequestForm from './page/project/RoleChangeRequestForm';


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
            <Route path="/home" element={<Home />} /> 
            <Route path="/projectdetail/:id" element={<Projectdetail />} />
            <Route path="/projectrecord" element={<Projectrecord />} />
             <Route path="/search" element={<Searchpage />} />
             <Route path="/recordactivity/:project_id" element={<RecordActivity />} />
            <Route path="/student/:ms_id" element={<StudentActivity />} />
            <Route path="/adminrole" element={<RoleManager />} />
            <Route path="/regisactivity/:post_id" element={<Regisname />} />
            <Route path="/participants/:project_id" element={<ParticipantsList />} />
          </Route>

          {/* Organizer only */}
          <Route element={<ProtectedRoute allowedRoles={['organizer']} />}>
            <Route path="/projectlist" element={<Projectlist />} />            
            <Route path="/createproject" element={<Createproject />} />
            <Route path="/eventlist" element={<Eventlist />} />
            <Route path="/rolechangform" element={<RoleChangeRequestForm />} />
            
           
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            {/* <Route path="/adminrole" element={<RoleManager />} /> */}
            <Route path="/projectstatus" element={<Projectstatus />} />
            <Route path="/rolechang" element={<RoleChangeRequestManager />} />
            
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
  return <Navigate to={currentUser ? '/home' : '/login'} replace />;
};

// หน้า Catch-all สำหรับเส้นทางที่ไม่รู้จัก
const CatchAllRoute: React.FC = () => {
  const { currentUser } = useAuth();
  return <Navigate to={currentUser ? '/home' : '/login'} replace />;
};


export default App;