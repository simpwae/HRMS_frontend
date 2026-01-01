import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DeanLayout from './components/DeanLayout';
import Dashboard from './pages/Dashboard';
import FacultyEmployees from './pages/FacultyEmployees';
import FacultyAttendance from './pages/FacultyAttendance';
import FacultyLeaves from './pages/FacultyLeaves';
import Promotions from './pages/Promotions';
import CommitteeMeetings from './pages/CommitteeMeetings';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SelfService from './pages/SelfService';

export default function DeanPortal() {
  return (
    <Routes>
      <Route element={<DeanLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<FacultyEmployees />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="leaves" element={<FacultyLeaves />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="meetings" element={<CommitteeMeetings />} />
        <Route path="self-service" element={<SelfService />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
}
