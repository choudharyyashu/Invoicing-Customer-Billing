import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Settings,
  LogOut,
  Sparkles,
  MessageSquare,
  FileText,
  CreditCard,
  Building,
  AlertTriangle,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

export const Topbar = ({ onOpenMobileMenu }) => {
  const {
    sidebarCollapsed,
    setIsSearchOpen,
    businessSettings,
    invoices,
    currentUser,
    currentRole,
    logoutUser,
    triggerWhatsAppAction,
    resetFactoryData,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const quickRef = useRef(null);
  const navigate = useNavigate();

  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;

  useEffect(() => {
    const handleOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (quickRef.current && !quickRef.current.contains(e.target)) setShowQuickCreate(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const displayName =
    currentRole === 'customer'
      ? currentUser?.companyName || 'Client'
      : businessSettings?.tradingName || businessSettings?.businessName || 'Fresh Harvest Ltd';

  const userInitials =
    currentRole === 'customer'
      ? (currentUser?.companyName?.slice(0, 2) || 'GV').toUpperCase()
      : currentRole === 'accountant'
      ? 'AC'
      : (displayName || 'FH')
          .split(' ')
          .filter(Boolean)
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'FH';

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 left-0 ${
        sidebarCollapsed ? 'md:left-20' : 'md:left-64'
      }`}
    >
      <div className="flex items-center justify-between h-full px-3 sm:px-6">
        {/* Left Section: Mobile Menu & Global Search */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-400 text-xs font-medium transition-all max-w-[140px] xs:max-w-[180px] sm:w-64 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-left">Search...</span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded shadow-2xs font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section: Actions, Notifications, Business Status & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Quick Create Dropdown (Hidden for Customer Portal) */}
          {currentRole !== 'customer' && (
            <div className="relative" ref={quickRef}>
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => setShowQuickCreate(!showQuickCreate)}
                className="font-bold shadow-xs px-2.5 sm:px-3.5"
              >
                <span className="hidden sm:inline">New</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0 sm:ml-0.5" />
              </Button>

              {showQuickCreate && (
                <div className="absolute right-0 mt-2 w-52 max-w-[calc(100vw-24px)] rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in text-xs">
                  <button
                    onClick={() => {
                      navigate('/invoices/create');
                      setShowQuickCreate(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Create Invoice</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/customers');
                      setShowQuickCreate(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium text-left cursor-pointer"
                  >
                    <Building className="w-4 h-4 text-sky-600" />
                    <span>Add Customer</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/payments');
                      setShowQuickCreate(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium text-left cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>Record Payment</span>
                  </button>
                  {currentRole === 'admin' && (
                    <>
                      <button
                        onClick={() => {
                          navigate('/orders');
                          setShowQuickCreate(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium text-left cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span>Add Daily Order</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/purchases');
                          setShowQuickCreate(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium text-left cursor-pointer"
                      >
                        <Building className="w-4 h-4 text-amber-600" />
                        <span>Record Purchase Bill</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* WhatsApp Status Quick Indicator */}
          <button
            onClick={() => triggerWhatsAppAction('Status Check')}
            title="WhatsApp Messaging Status"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors hidden md:flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
            <span className="text-[11px] text-slate-600">WhatsApp</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {overdueCount > 0 && currentRole !== 'customer' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {overdueCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-24px)] rounded-2xl bg-white shadow-xl border border-slate-200 py-3 z-50 animate-fade-in">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Notifications</h4>
                  <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark read</span>
                </div>
                <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                  {currentRole === 'customer' ? (
                    <div className="p-3.5 text-center text-xs text-slate-500">
                      Welcome to your client portal. All your invoice statements are up to date!
                    </div>
                  ) : (
                    <>
                      {overdueCount > 0 ? (
                        <div className="p-3 hover:bg-slate-50 flex items-start gap-3 cursor-pointer" onClick={() => navigate('/invoices')}>
                          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{overdueCount} Overdue Invoice(s)</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Market Street Foods has an outstanding balance overdue.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No urgent alerts. All accounts up to date!
                        </div>
                      )}
                      <div className="p-3 hover:bg-slate-50 flex items-start gap-3 cursor-pointer" onClick={() => navigate('/orders')}>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Today's Daily Aggregation Ready</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">4 customer orders combined for morning purchasing.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
              aria-label="User Profile Menu"
            >
              <div
                className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-2xs ${
                  currentRole === 'customer'
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                    : currentRole === 'accountant'
                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                }`}
              >
                {userInitials}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-none truncate max-w-[130px]">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {currentUser?.title || 'User'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-fade-in text-xs">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="font-bold text-slate-900 truncate">
                    {currentRole === 'customer' ? currentUser?.companyName : (businessSettings?.businessName || displayName)}
                  </p>
                  {currentRole !== 'customer' && businessSettings?.tradingName && businessSettings?.tradingName !== businessSettings?.businessName && (
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      Trading as: <span className="font-medium text-slate-700">{businessSettings.tradingName}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 truncate mt-1">{currentUser?.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-md border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Active Role: {currentUser?.title}
                  </div>
                </div>

                <div className="py-1">
                  {currentRole === 'customer' ? (
                    <button
                      onClick={() => {
                        navigate('/portal');
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>My Portal Overview</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowProfile(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Business & Invoice Settings</span>
                      </button>
                      {/*
                      <button
                        onClick={() => {
                          resetFactoryData();
                          setShowProfile(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-amber-600 font-medium cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Reset Demo Mock Data</span>
                      </button>
                      */}
                    </>
                  )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={async () => {
                      setShowProfile(false);
                      await logoutUser();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

