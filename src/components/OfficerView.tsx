import React from 'react';
import { OfficerLogin } from './officer/OfficerLogin';
import { OfficerDashboard } from './officer/OfficerDashboard';
import { useAuth } from './AuthContext';

export function OfficerView() {
  const { isLoggedIn, role, logout } = useAuth();

  if (!isLoggedIn || role !== 'officer') {
    return <OfficerLogin />;
  }

  return <OfficerDashboard onLogout={logout} />;
}