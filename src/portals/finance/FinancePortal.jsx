import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FinanceLayout from './components/FinanceLayout';
import FinanceDashboard from './pages/FinanceDashboard';
import FinanceRequests from './pages/FinanceRequests';
import FinanceReports from './pages/FinanceReports';
import FinancePolicyAdvisory from './pages/FinancePolicyAdvisory';
import FinanceSettings from './pages/FinanceSettings';

export default function FinancePortal() {
  return (
    <Routes>
      <Route element={<FinanceLayout />}>
        <Route index element={<FinanceDashboard />} />
        <Route path="dashboard" element={<FinanceDashboard />} />
        <Route path="requests" element={<FinanceRequests />} />
        <Route path="reports" element={<FinanceReports />} />
        <Route path="policy-advisory" element={<FinancePolicyAdvisory />} />
        <Route path="settings" element={<FinanceSettings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
}
