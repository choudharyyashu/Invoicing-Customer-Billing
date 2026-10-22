import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Users,
  CreditCard,
  Menu,
  Percent,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileNav = ({ onOpenMenu }) => {
  const { currentRole } = useApp();
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
        if (key === 'tab' && value === 'invoices' && !currentVal) {
          continue;
        }
        if (currentVal !== value) return false;
      }
      return true;
    }

    if (location.pathname === '/portal' && itemTo === '/portal') {
      return currentTab === 'invoices';
    }

    return location.pathname === itemTo;
  };

  let navItems = [];

  if (currentRole === 'customer') {
    navItems = [
      { name: 'Invoices', to: '/portal?tab=invoices', icon: FileText },
      { name: 'Payments', to: '/portal?tab=payments', icon: CreditCard },
      { name: 'Statement', to: '/portal?tab=statement', icon: FileSpreadsheet },
    ];
  } else if (currentRole === 'accountant') {
    navItems = [
      { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { name: 'Invoices', to: '/invoices', icon: FileText },
      { name: 'VAT Return', to: '/accounting/vat', icon: Percent },
      { name: 'Reports', to: '/reports', icon: BarChart3 },
    ];
  } else {
    navItems = [
      { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { name: 'Customers', to: '/customers', icon: Users },
      { name: 'Invoices', to: '/invoices', icon: FileText },
      { name: 'Daily Orders', to: '/orders', icon: ShoppingCart },
    ];
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const active = isItemActive(item.to);
        return (
          <NavLink
            key={idx}
            to={item.to}
            className={`
              flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all min-w-[54px]
              ${active ? 'text-blue-600 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800'}
            `}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${active ? 'text-blue-600' : 'text-slate-500'}`} />
            <span className="truncate max-w-[64px] text-center">{item.name}</span>
          </NavLink>
        );
      })}

      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors min-w-[56px] cursor-pointer"
      >
        <Menu className="w-4 h-4 mb-0.5 text-slate-600" />
        <span>Menu</span>
      </button>
    </div>
  );
};
