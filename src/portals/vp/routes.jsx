import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import VPLayout from './components/VPLayout';
import VPDashboard from './pages/Dashboard';
import VPAllEmployees from './pages/AllEmployees';
import VPReports from './pages/Reports';
import VPAnalytics from './pages/Analytics';
import VPAdvisory from './pages/Advisory';
import VPSettings from './pages/Settings';
import VPMedicalLeaves from './pages/MedicalLeaves';

export const presidentRoutes = (
  <Route
    path="/president"
    element={
      <ProtectedRoute allowedRoles={['president']}>
        <VPLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<VPDashboard />} />
    <Route path="employees" element={<VPAllEmployees />} />
    <Route path="reports" element={<VPReports />} />
    <Route path="analytics" element={<VPAnalytics />} />
    <Route path="advisory" element={<VPAdvisory />} />
    <Route path="settings" element={<VPSettings />} />
    <Route path="medical-leaves" element={<VPMedicalLeaves />} />
  </Route>
);
