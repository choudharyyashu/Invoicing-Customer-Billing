import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  FileSpreadsheet,
  ShoppingCart,
  Truck,
  TrendingUp,
  Percent,
  BarChart3,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  X,
  Building2,
  ShieldCheck,
  Calculator,
  MessageSquare,
  Car,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    dailyOrders,
    invoices,
    currentUser,
    currentRole,
  } = useApp();

  const location = useLocation();

  const isItemActive = (itemTo) => {
    const currentTab = new URLSearchParams(location.search).get('tab') || 'invoices';

    if (itemTo.includes('?')) {
      const [itemPath, itemQuery] = itemTo.split('?');
      if (location.pathname !== itemPath) return false;
      const currentParams = new URLSearchParams(location.search);
      const itemParams = new URLSearchParams(itemQuery);
      for (const [key, value] of itemParams.entries()) {
        const currentVal = currentParams.get(key);
        // Default 'invoices' tab when URL does not specify a tab query parameter
        if (key === 'tab' && value === 'invoices' && !currentVal) {
          continue;
        }
        if (currentVal !== value) return false;
      }
      return true;
    }
    // Match Customer Portal default tab
    if (location.pathname === '/portal' && itemTo === '/portal') {
      return currentTab === 'invoices';
    }
    return location.pathname === itemTo;
  };

  const overdueInvoicesCount = invoices.filter((i) => i.status === 'Overdue').length;

  // Build navigation tree based on current role
  let navigation = [];

  if (currentRole === 'customer') {
    navigation = [
      {
        group: 'MY PORTAL',
        items: [
          { name: 'My Invoices & Balance', to: '/portal?tab=invoices', icon: FileText },
          { name: 'Payment Receipts', to: '/portal?tab=payments', icon: CreditCard },
          { name: 'Statement of Account', to: '/portal?tab=statement', icon: FileSpreadsheet },
        ],
      },
    ];
  } else if (currentRole === 'accountant') {
    navigation = [
      {
        group: null,
        items: [
          { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        ],
      },
      {
        group: 'FINANCIAL LEDGERS',
        items: [
          {
            name: 'Invoices',
            to: '/invoices',
            icon: FileText,
            badge: overdueInvoicesCount ? `${overdueInvoicesCount} overdue` : null,
            badgeVariant: 'danger',
          },
          { name: 'Payments', to: '/payments', icon: CreditCard },
          { name: 'Customer Statements', to: '/statements', icon: FileSpreadsheet },
          { name: 'Customers Directory', to: '/customers', icon: Users },
        ],
      },
      {
        group: 'ACCOUNTING & TAX',
        items: [
          { name: 'Income & Expenses', to: '/accounting/income-expenses', icon: TrendingUp },
          { name: 'HMRC VAT Return', to: '/accounting/vat', icon: Percent },
          { name: 'Financial Reports', to: '/reports', icon: BarChart3 },
        ],
      },
    ];
  } else {
    // Admin / Owner navigation (Full Access)
    navigation = [
      {
        group: null,
        items: [
          { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        ],
      },
      {
        group: 'SALES & CUSTOMERS',
        items: [
          { name: 'Customers', to: '/customers', icon: Users },
          {
            name: 'Invoices',
            to: '/invoices',
            icon: FileText,
            badge: overdueInvoicesCount ? `${overdueInvoicesCount} overdue` : null,
            badgeVariant: 'danger',
          },
          { name: 'Payments', to: '/payments', icon: CreditCard },
          { name: 'Statements', to: '/statements', icon: FileSpreadsheet },
        ],
      },
      {
        group: 'DAILY PURCHASING',
        items: [
          {
            name: 'Van Purchase Lists',
            to: '/orders',
            icon: ShoppingCart,
          },
          { name: 'Purchases', to: '/purchases', icon: Truck },
          { name: 'Mileage & Vehicle', to: '/mileage', icon: Car },
        ],
      },
      {
        group: 'ACCOUNTING & TAX',
        items: [
          { name: 'Income & Expenses', to: '/accounting/income-expenses', icon: TrendingUp },
          { name: 'VAT Return', to: '/accounting/vat', icon: Percent },
          { name: 'Reports', to: '/reports', icon: BarChart3 },
        ],
      },
      {
        group: null,
        items: [
          { name: 'Settings', to: '/settings', icon: SettingsIcon },
        ],
      },
    ];
  }

  const roleLabel =
    currentRole === 'customer'
      ? 'Customer Portal'
      : currentRole === 'accountant'
      ? 'Accountant View'
      : 'Business Admin';

  const roleColor =
    currentRole === 'customer'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : currentRole === 'accountant'
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';

  const renderContent = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-xs shadow-blue-500/20 shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>
          {(!sidebarCollapsed || isMobileDrawer) && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 tracking-tight text-sm leading-tight truncate">
                Ledger<span className="text-blue-600">Flow</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 truncate">
                {currentRole === 'customer' ? currentUser?.companyName || 'Client' : 'Business SaaS'}
              </span>
            </div>
          )}
        </div>

        {isMobileDrawer ? (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Role Indicator Banner (When expanded) */}
      {(!sidebarCollapsed || isMobileDrawer) && (
        <div className="px-3 pt-3 pb-1">
          <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-between ${roleColor}`}>
            <span className="truncate">{roleLabel}</span>
            {currentRole === 'customer' ? (
              <Building2 className="w-3.5 h-3.5 shrink-0" />
            ) : currentRole === 'accountant' ? (
              <Calculator className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            )}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5 scrollbar-thin">
        {navigation.map((section, idx) => (
          <div key={idx}>
            {(!sidebarCollapsed || isMobileDrawer) && section.group && (
              <p className="px-2.5 mb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                {section.group}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isCollapsed = sidebarCollapsed && !isMobileDrawer;
                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={() => mobileOpen && setMobileOpen(false)}
                    className={() => {
                      const active = isItemActive(item.to);
                      return `
                        group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 relative
                        ${active
                          ? 'bg-blue-50 text-blue-600 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `;
                    }}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-colors group-hover:scale-105" />
                    {(!sidebarCollapsed || isMobileDrawer) && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}
                    {(!sidebarCollapsed || isMobileDrawer) && item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide
                          ${item.badgeVariant === 'danger' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
                        `}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Info Card */}
      {(!sidebarCollapsed || isMobileDrawer) && (
        <div className="p-2.5 border-t border-slate-100 shrink-0">
          {currentRole === 'customer' ? (
            <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-teal-50/40 rounded-xl border border-emerald-100/80 text-xs">
              <div className="flex items-center gap-1.5 mb-1 text-emerald-950 font-bold text-[11px]">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Ordering</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                Send morning produce orders directly to our WhatsApp operations desk.
              </p>
            </div>
          ) : (
            <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50/40 rounded-xl border border-blue-100/80 text-xs">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold text-blue-950 text-[11px]">AI Assistant</span>
                </div>
                <NavLink
                  to="/invoices/create"
                  onClick={() => mobileOpen && setMobileOpen(false)}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                >
                  Open →
                </NavLink>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                Paste WhatsApp text orders to auto-populate invoices instantly.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50 animate-slide-in">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

