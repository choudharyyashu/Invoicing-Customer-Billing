import React, { useState } from 'react';
import {
  Search,
  Download,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { exportToCSV } from '../../utils/exportUtils';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const PaymentTable = () => {
  const { payments, isPaymentsLoading, paymentsError, refreshPayments } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');

  const filtered = payments.filter((p) => {
    const pId = p.id || '';
    const custName = p.customerName || '';
    const ref = p.reference || '';
    const invNum = p.invoiceNumber || '';

    const matchesSearch =
      pId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invNum.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === 'All' || p.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const getMethodBadge = (method) => {
    if (method === 'Square') return <Badge variant="purple" size="sm">Square POS</Badge>;
    if (method === 'Bank Transfer') return <Badge variant="info" size="sm">Bank Transfer</Badge>;
    if (method === 'Cash') return <Badge variant="success" size="sm">Cash</Badge>;
    return <Badge variant="default" size="sm">{method}</Badge>;
  };

  const handleExport = () => {
    const data = filtered.map((p) => ({
      'Payment ID': p.id,
      Customer: p.customerName,
      'Invoice / Ref': p.invoiceNumber,
      Date: p.date,
      Method: p.method,
      Amount: p.amount,
      Reference: p.reference,
      Status: p.status,
    }));
    exportToCSV(data, 'payments_ledger.csv');
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
              placeholder="Search payments by ID, customer, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Methods</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Square">Square</option>
            <option value="Cash">Cash</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <Button size="sm" variant="outline" icon={Download} onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      {/* Error Alert */}
      {paymentsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-xs">
          <span>Failed to load payments from server: {paymentsError}</span>
          <Button size="sm" variant="outline" icon={RefreshCw} onClick={refreshPayments}>
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[700px]">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 whitespace-nowrap">Payment ID</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Customer</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Invoice #</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Date</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Method</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Reference</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Amount</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isPaymentsLoading ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading payments...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-slate-400">
                  No payment records found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {p.id}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                    {p.customerName || 'Customer'}
                  </td>
                  <td className="px-4 py-3.5 text-blue-600 font-medium whitespace-nowrap">
                    {p.invoiceNumber ? (
                      <span
                        onClick={() => p.invoiceId && navigate(`/invoices/${p.invoiceId}`)}
                        className="hover:underline cursor-pointer"
                      >
                        {p.invoiceNumber}
                      </span>
                    ) : (
                      'On Account'
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    {formatDate(p.date, { short: true })}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {getMethodBadge(p.method)}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {p.reference || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-black text-emerald-600 text-sm whitespace-nowrap">
                    +{formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <Badge
                      variant={p.status === 'Void' || p.status === 'Voided' ? 'danger' : 'success'}
                      dot={p.status !== 'Void' && p.status !== 'Voided'}
                      size="sm"
                    >
                      {p.status || 'Completed'}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
