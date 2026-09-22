import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function RequireAuth({ children }: {children: React.ReactElement;}) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

export function RequireAdmin({ children }: {children: React.ReactElement;}) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
}

export function RootRedirect() {
  const { isAuthenticated, hasOnboarded, user } = useAuth();
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/admin' : '/home'} replace />;
  if (!hasOnboarded) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/welcome" replace />;
}
