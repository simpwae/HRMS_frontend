import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import DeanLayout from './components/DeanLayout';
import DeanDashboard from './pages/Dashboard';
import FacultyEmployees from './pages/FacultyEmployees';
import FacultyAttendance from './pages/FacultyAttendance';
import FacultyLeaves from './pages/FacultyLeaves';
import Promotions from './pages/Promotions';
import CommitteeMeetings from './pages/CommitteeMeetings';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export const deanRoutes = (
  <Route
    path="/dean"
    element={
      <ProtectedRoute allowedRoles={['dean']}>
        <DeanLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<DeanDashboard />} />
    <Route path="employees" element={<FacultyEmployees />} />
    <Route path="attendance" element={<FacultyAttendance />} />
    <Route path="leaves" element={<FacultyLeaves />} />
    <Route path="promotions" element={<Promotions />} />
    <Route path="meetings" element={<CommitteeMeetings />} />
    <Route path="reports" element={<Reports />} />
    <Route path="settings" element={<Settings />} />
  </Route>
);
