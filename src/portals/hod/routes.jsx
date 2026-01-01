import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import HODLayout from './components/HODLayout';
import HODDashboard from './pages/Dashboard';
import DeptEmployees from './pages/DeptEmployees';
import DeptAttendance from './pages/DeptAttendance';
import DeptLeaves from './pages/DeptLeaves';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export const hodRoutes = (
  <Route
    path="/hod"
    element={
      <ProtectedRoute allowedRoles={['hod']}>
        <HODLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<HODDashboard />} />
    <Route path="employees" element={<DeptEmployees />} />
    <Route path="attendance" element={<DeptAttendance />} />
    <Route path="leaves" element={<DeptLeaves />} />
    <Route path="reports" element={<Reports />} />
    <Route path="settings" element={<Settings />} />
  </Route>
);
