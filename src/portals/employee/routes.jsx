import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import EmployeeLayout from './components/EmployeeLayout';
import EmployeeDashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Salary from './pages/Salary';
import Profile from './pages/Profile';
import Promotions from './pages/Promotions';
import Resignation from './pages/Resignation';
import PolicyAdvisory from './pages/PolicyAdvisory';

export const employeeRoutes = (
  <Route
    path="/employee"
    element={
      <ProtectedRoute
        allowedRoles={['employee', 'hr', 'hod', 'dean', 'vp', 'admin']}
        redirectTo="/login"
      >
        <EmployeeLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<EmployeeDashboard />} />
    <Route path="attendance" element={<Attendance />} />
    <Route path="leave" element={<Leave />} />
    <Route path="salary" element={<Salary />} />
    <Route path="profile" element={<Profile />} />
    <Route path="promotions" element={<Promotions />} />
    <Route path="resignation" element={<Resignation />} />
    <Route path="policy-advisory" element={<PolicyAdvisory />} />
  </Route>
);
