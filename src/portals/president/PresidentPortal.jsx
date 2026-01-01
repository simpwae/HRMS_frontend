import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PresidentLayout from './components/PresidentLayout';
import Dashboard from '../vp/pages/Dashboard';
import AllEmployees from '../vp/pages/AllEmployees';
import Reports from '../vp/pages/Reports';
import Analytics from '../vp/pages/Analytics';
import Advisory from '../vp/pages/Advisory';
import Settings from '../vp/pages/Settings';
import MedicalLeaves from '../vp/pages/MedicalLeaves';

export default function PresidentPortal() {
  return (
    <Routes>
      <Route element={<PresidentLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<AllEmployees />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="advisory" element={<Advisory />} />
        <Route path="medical-leaves" element={<MedicalLeaves />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
}
