import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import HRLayout from './components/HRLayout';
import HRDashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AttendanceList from './pages/AttendanceList';
import LeavesList from './pages/LeavesList';
import Reports from './pages/Reports';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import Promotions from './pages/Promotions';
import Resignations from './pages/Resignations';
import ExEmployees from './pages/ExEmployees';
import Analytics from './pages/Analytics';
import PolicyAdvisory from './pages/PolicyAdvisory';
import BulkIncrements from './pages/BulkIncrements';
import ProfileRequests from './pages/ProfileRequests';
import Payroll from './pages/Payroll';
import Attendance from './pages/Attendance';
import Recruitment from './pages/Recruitment';
import Operational from './pages/Operational';

export const hrRoutes = (
  <Route
    path="/hr"
    element={
      <ProtectedRoute allowedRoles={['hr', 'admin', 'dean', 'hod']} redirectTo="/login">
        <HRLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<HRDashboard />} />
    <Route path="employees" element={<Employees />} />
    <Route path="attendance" element={<Attendance />} />
    <Route path="attendance-list" element={<AttendanceList />} />
    <Route path="leaves" element={<LeavesList />} />
    <Route path="promotions" element={<Promotions />} />
    <Route path="increments" element={<BulkIncrements />} />
    <Route path="payroll" element={<Payroll />} />
    <Route path="recruitment" element={<Recruitment />} />
    <Route path="operational" element={<Operational />} />
    <Route path="resignations" element={<Resignations />} />
    <Route path="ex-employees" element={<ExEmployees />} />
    <Route path="profile-requests" element={<ProfileRequests />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="reports" element={<Reports />} />
    <Route path="policy-advisory" element={<PolicyAdvisory />} />
    <Route path="announcements" element={<Announcements />} />
    <Route path="settings" element={<Settings />} />
  </Route>
);
