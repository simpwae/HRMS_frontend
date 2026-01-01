import React from 'react';
import { Outlet } from 'react-router-dom';
import ORICLayout from './components/ORICLayout';

export default function ORICPortal() {
  return (
    <ORICLayout>
      <Outlet />
    </ORICLayout>
  );
}
