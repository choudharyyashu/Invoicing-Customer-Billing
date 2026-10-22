import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * RoleGuard component for server-authenticated client route protection.
 * Requires an active, verified backend session and enforces server-provided roles.
 */
export const RoleGuard = ({ allowedRoles = [], children }) => {
  const { currentUser, currentRole, isAuthLoading } = useApp();

  // Show non-blocking clean spinner while verifying active backend session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated visitors are strictly redirected to Login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Role authorization
  if (!allowedRoles.includes(currentRole)) {
    // Redirect customer to their self-service portal
    if (currentRole === 'customer') {
      return <Navigate to="/portal" replace />;
    }
    // Redirect admin/accountant to the main dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

