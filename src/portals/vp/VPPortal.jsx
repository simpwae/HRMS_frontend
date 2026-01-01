import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VPLayout from './components/VPLayout';
import Dashboard from './pages/Dashboard';
import AllEmployees from './pages/AllEmployees';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Advisory from './pages/Advisory';
import Settings from './pages/Settings';

export default function VPPortal() {
  return (
    <Routes>
      <Route element={<VPLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<AllEmployees />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="advisory" element={<Advisory />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
}
