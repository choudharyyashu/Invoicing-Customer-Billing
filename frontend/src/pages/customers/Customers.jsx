import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { CustomerTable } from '../../components/customers/CustomerTable';
import { CustomerFormModal } from '../../components/customers/CustomerFormModal';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { Users, CreditCard, AlertCircle, ShoppingBag } from 'lucide-react';

export const Customers = () => {
  const { customers, invoices, customersError, refreshCustomers, currentUser } = useApp();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    if (typeof refreshCustomers === 'function') {
      refreshCustomers();
    }
  }, [refreshCustomers]);

  const isAdmin = currentUser?.role === 'admin';

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === 'Active').length;
  const customersWithBalance = customers.filter((c) => (parseFloat(c.outstandingBalance) || 0) > 0);
  const totalOutstanding = customersWithBalance.reduce(
    (sum, c) => sum + (parseFloat(c.outstandingBalance) || 0),
    0
  );

  const handleOpenAdd = () => {
    if (!isAdmin) return;
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    if (!isAdmin) return;
    setEditingCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Customers"
        subtitle="Manage restaurant, cafe, and retail client profiles, contact details, and payment balances."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales', href: '/customers' },
          { label: 'Customers' },
        ]}
      />

      {/* Error Alert Banner */}
      {customersError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>Failed to load live customers: {customersError}</span>
          </div>
          <button
            onClick={() => refreshCustomers()}
            className="text-xs font-bold text-red-700 hover:text-red-900 underline ml-2 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Total Customers</span>
          <span className="text-base font-bold text-slate-900">{totalCustomers}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Active Accounts</span>
          <span className="text-base font-bold text-emerald-600">{activeCustomers}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">With Pending Balance</span>
          <span className="text-base font-bold text-amber-600">
            {customersWithBalance.length} clients
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Total Outstanding</span>
          <span className="text-base font-bold text-red-600">{formatCurrency(totalOutstanding)}</span>
        </div>
      </div>

      {/* Customer Table */}
      <CustomerTable
        onAddCustomer={handleOpenAdd}
        onEditCustomer={handleOpenEdit}
      />

      {/* Form Modal */}
      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        editCustomer={editingCustomer}
      />
    </div>
  );
};
