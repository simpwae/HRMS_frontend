import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HRLayout from './components/HRLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AttendanceList from './pages/AttendanceList';
import LeavesList from './pages/LeavesList';
import Promotions from './pages/Promotions';
import Resignations from './pages/Resignations';
import ExEmployees from './pages/ExEmployees';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import PolicyAdvisory from './pages/PolicyAdvisory';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import BulkIncrements from './pages/BulkIncrements';
import ProfileRequests from './pages/ProfileRequests';
import Payroll from './pages/Payroll';
import Attendance from './pages/Attendance';
import Recruitment from './pages/Recruitment';
import Operational from './pages/Operational';

export default function HRPortal() {
  return (
    <Routes>
      <Route element={<HRLayout />}>
        <Route index element={<Dashboard />} />
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
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
}
