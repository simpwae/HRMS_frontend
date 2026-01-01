import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VCDashboard from './pages/Dashboard';
import MedicalLeaves from './pages/MedicalLeaves';
import Analytics from './pages/Analytics';
import VCLayout from './components/VCLayout';

export default function VCPortal() {
  return (
    <Routes>
      <Route element={<VCLayout />}>
        <Route index element={<VCDashboard />} />
        <Route path="medical-leaves" element={<MedicalLeaves />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
}
