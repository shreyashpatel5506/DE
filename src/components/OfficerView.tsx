import React from 'react';
import { OfficerLogin } from './officer/OfficerLogin';
import { OfficerDashboard } from './officer/OfficerDashboard';
import { useAuth } from './AuthContext';

export function OfficerView() {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn || role !== 'officer') {
    return <OfficerLogin />;
  }

  return <OfficerDashboard onLogout={() => {}} />; // Let Navigation handle logout, or we can handle it in OfficerDashboard later if needed
}