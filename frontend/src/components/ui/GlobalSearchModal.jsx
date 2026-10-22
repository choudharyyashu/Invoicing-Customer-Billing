import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, FileText, Users, CreditCard, ShoppingCart, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';

export const GlobalSearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, invoices, customers, payments, purchases } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredInvoices = q
    ? invoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          i.reference.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const filteredCustomers = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const filteredPurchases = q
    ? purchases.filter(
        (p) =>
          p.purchaseNumber.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const handleSelect = (path) => {
    navigate(path);
    setIsSearchOpen(false);
    setQuery('');
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={() => setIsSearchOpen(false)} />

      <div className="flex min-h-full items-start justify-center p-4 pt-20">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-200 animate-fade-in">
          {/* Search Header */}
          <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search invoices, customers, purchases, payments, or jump to page..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
            >
              ESC
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {!query && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Navigation</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSelect('/invoices/create')}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 text-left text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>+ Create New Invoice</span>
                  </button>
                  <button
                    onClick={() => handleSelect('/orders')}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 text-left text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-emerald-600" />
                    <span>Today's Daily Orders & Requirements</span>
                  </button>
                  <button
                    onClick={() => handleSelect('/payments')}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 text-left text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>Record or View Payments</span>
                  </button>
                  <button
                    onClick={() => handleSelect('/customers')}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 text-left text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>Customer Balances & Directory</span>
                  </button>
                </div>
              </div>
            )}

            {/* Invoices match */}
            {filteredInvoices.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Invoices</p>
                <div className="space-y-1">
                  {filteredInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => handleSelect(`/invoices/${inv.id}`)}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-blue-50 text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="font-semibold text-slate-900">{inv.invoiceNumber}</span>
                          <span className="text-slate-500 ml-2">— {inv.customerName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">{formatCurrency(inv.total)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customers match */}
            {filteredCustomers.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Customers</p>
                <div className="space-y-1">
                  {filteredCustomers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelect(`/customers/${c.id}`)}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-50 text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-semibold text-slate-900">{c.name}</span>
                          <span className="text-slate-500 ml-2">{c.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Balance:</span>
                        <span className="font-bold text-slate-900">{formatCurrency(c.outstandingBalance)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purchases match */}
            {filteredPurchases.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Purchases</p>
                <div className="space-y-1">
                  {filteredPurchases.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelect('/purchases')}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-amber-50 text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShoppingCart className="w-4 h-4 text-amber-600" />
                        <div>
                          <span className="font-semibold text-slate-900">{p.purchaseNumber}</span>
                          <span className="text-slate-500 ml-2">{p.supplierName}</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(p.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {query && filteredInvoices.length === 0 && filteredCustomers.length === 0 && filteredPurchases.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                No matching results found for "{query}".
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
