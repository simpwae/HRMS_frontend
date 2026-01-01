import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HODLayout from './components/HODLayout';
import Dashboard from './pages/Dashboard';
import DeptEmployees from './pages/DeptEmployees';
import DeptAttendance from './pages/DeptAttendance';
import DeptLeaves from './pages/DeptLeaves';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SelfService from './pages/SelfService';

export default function HODPortal() {
  return (
    <Routes>
      <Route element={<HODLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<DeptEmployees />} />
        <Route path="attendance" element={<DeptAttendance />} />
        <Route path="leaves" element={<DeptLeaves />} />
        <Route path="self-service" element={<SelfService />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
}
