import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Download,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Dropdown } from '../ui/Dropdown';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { exportToCSV } from '../../utils/exportUtils';
import { useApp } from '../../context/AppContext';

export const CustomerTable = ({ onAddCustomer, onEditCustomer }) => {
  const { customers, invoices, deleteCustomer, triggerWhatsAppAction, isCustomersLoading, currentUser } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('All'); // 'All' | 'HasOutstanding' | 'ZeroBalance'
  const [deletingId, setDeletingId] = useState(null);

  const isAdmin = currentUser?.role === 'admin';

  const filtered = customers.filter((c) => {
    const matchesSearch =
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.phone && c.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesBalance = true;
    const balance = parseFloat(c.outstandingBalance) || 0;
    if (balanceFilter === 'HasOutstanding') matchesBalance = balance > 0;
    if (balanceFilter === 'ZeroBalance') matchesBalance = balance === 0;

    return matchesSearch && matchesBalance;
  });

  const handleExport = () => {
    const data = filtered.map((c) => ({
      ID: c.id,
      Customer: c.name,
      'Contact Person': c.contactPerson || '',
      Email: c.email,
      Phone: c.phone,
      'Total Purchases': c.totalPurchases,
      'Total Paid': c.totalPaid,
      'Outstanding Balance': c.outstandingBalance,
      Status: c.status,
    }));
    exportToCSV(data, 'customers_directory.csv');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers by name, contact, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={balanceFilter}
            onChange={(e) => setBalanceFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Balances</option>
            <option value="HasOutstanding">Outstanding Balance Only</option>
            <option value="ZeroBalance">Settled / Zero Balance</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" icon={Download} onClick={handleExport}>
            Export
          </Button>
          {isAdmin && (
            <Button size="sm" variant="primary" icon={Plus} onClick={onAddCustomer}>
              Add Customer
            </Button>
          )}
        </div>
      </div>

      {/* Customers Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[700px]">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 whitespace-nowrap">Customer</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Contact / Email</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Phone</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-center">Invoices</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Total Purchases</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Total Paid</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Outstanding</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-center">Status</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isCustomersLoading && customers.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">Loading customers directory...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-12 text-slate-400">
                  No customers found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const customerInvoicesCount = invoices.filter((i) => i.customerId === c.id).length;
                const outstanding = parseFloat(c.outstandingBalance) || 0;
                const totalPurchases = parseFloat(c.totalPurchases) || 0;
                const totalPaid = parseFloat(c.totalPaid) || 0;

                const dropdownItems = [
                  {
                    label: 'Customer Profile',
                    icon: Eye,
                    onClick: () => navigate(`/customers/${c.id}`),
                  },
                  {
                    label: 'Generate Statement',
                    icon: FileSpreadsheet,
                    onClick: () => navigate(`/statements?customer=${c.id}`),
                  },
                  {
                    label: 'Create Invoice',
                    icon: FileText,
                    onClick: () => navigate(`/invoices/create?customer=${c.id}`),
                  },
                  {
                    label: 'Send WhatsApp Reminder',
                    icon: MessageSquare,
                    onClick: () => triggerWhatsAppAction('Balance Statement', { recipient: c.name }),
                  },
                ];

                if (isAdmin) {
                  dropdownItems.push(
                    {
                      label: 'Edit Details',
                      icon: Edit2,
                      onClick: () => (onEditCustomer ? onEditCustomer(c) : null),
                    },
                    { divider: true },
                    {
                      label: deletingId === c.id ? 'Deactivating...' : 'Deactivate / Delete',
                      icon: Trash2,
                      danger: true,
                      onClick: async () => {
                        if (window.confirm(`Are you sure you want to deactivate customer "${c.name}"?`)) {
                          try {
                            setDeletingId(c.id);
                            await deleteCustomer(c.id);
                          } finally {
                            setDeletingId(null);
                          }
                        }
                      },
                    }
                  );
                }

                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/customers/${c.id}`)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 font-bold text-slate-900 group-hover:text-blue-600 whitespace-nowrap">
                      {c.name}
                      {c.contactPerson && (
                        <span className="block text-[10px] font-normal text-slate-400">
                          Attn: {c.contactPerson}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                      {c.email || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono whitespace-nowrap">
                      {c.phone || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {customerInvoicesCount}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(totalPurchases)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-emerald-600 font-semibold whitespace-nowrap">
                      {formatCurrency(totalPaid)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold whitespace-nowrap">
                      <span className={outstanding > 0 ? 'text-red-600 font-black' : 'text-slate-400'}>
                        {formatCurrency(outstanding)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <Badge variant={c.status === 'Active' ? 'success' : 'draft'} dot size="sm">
                        {c.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <Dropdown
                        trigger={
                          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                        items={dropdownItems}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
