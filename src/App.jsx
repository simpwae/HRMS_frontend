import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, portalRoutes } from './state/auth';

// Pages
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Portal Imports
import AdminPortal from './portals/admin/AdminPortal';
import HRPortal from './portals/hr/HRPortal';
import DeanPortal from './portals/dean/DeanPortal';
import HODPortal from './portals/hod/HODPortal';
import EmployeePortal from './portals/employee/EmployeePortal';
import PresidentPortal from './portals/president/PresidentPortal';
import VCPortal from './portals/vc/VCPortal';
import FinancePortal from './portals/finance/FinancePortal';
import ORICPortal from './portals/oric/ORICPortal';
import ORICDashboard from './portals/oric/pages/Dashboard';
import ORICPublications from './portals/oric/pages/Publications';
import ORICFunding from './portals/oric/pages/Funding';

import './styles/globals.css';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        {isAuthenticated ? (
          <>
            <Route path="/admin/*" element={<AdminPortal />} />
            <Route path="/hr/*" element={<HRPortal />} />
            <Route path="/dean/*" element={<DeanPortal />} />
            <Route path="/hod/*" element={<HODPortal />} />
            <Route path="/employee/*" element={<EmployeePortal />} />
            <Route path="/president/*" element={<PresidentPortal />} />
            <Route path="/vc/*" element={<VCPortal />} />
            <Route path="/finance/*" element={<FinancePortal />} />
            <Route path="/oric/*" element={<ORICPortal />}>
              <Route index element={<ORICDashboard />} />
              <Route path="publications" element={<ORICPublications />} />
              <Route path="funding" element={<ORICFunding />} />
            </Route>

            <Route
              path="/"
              element={<Navigate to={portalRoutes[user?.primaryRole] || '/employee'} replace />}
            />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
