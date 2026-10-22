import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { GlobalSearchModal } from '../ui/GlobalSearchModal';
import { ToastContainer } from '../ui/Toast';
import { useApp } from '../../context/AppContext';

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sidebarCollapsed, currentUser, isAuthLoading } = useApp();

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

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }


  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar navigation for desktop and drawer for mobile */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Top Navbar */}
      <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />

      {/* Main Content Area */}
      <main
        className={`flex-1 min-w-0 w-full transition-all duration-300 pt-18 sm:pt-20 pb-24 md:pb-10 overflow-x-hidden ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation for Mobile Phone Screens */}
      <MobileNav onOpenMenu={() => setMobileOpen(true)} />

      {/* Global Modals & Notifications */}
      <GlobalSearchModal />
      <ToastContainer />
    </div>
  );
};
