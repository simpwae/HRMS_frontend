import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EmployeeLayout from './components/EmployeeLayout';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Salary from './pages/Salary';
import Profile from './pages/Profile';
import Promotions from './pages/Promotions';
import Resignation from './pages/Resignation';
import PolicyAdvisory from './pages/PolicyAdvisory';
import SelfService from './pages/SelfService';

export default function EmployeePortal() {
  return (
    <Routes>
      <Route element={<EmployeeLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leave" element={<Leave />} />
        <Route path="salary" element={<Salary />} />
        <Route path="self-service" element={<SelfService />} />
        <Route path="profile" element={<Profile />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="resignation" element={<Resignation />} />
        <Route path="policy-advisory" element={<PolicyAdvisory />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
}
