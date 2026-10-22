import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Trash2,
  TrendingUp,
  TrendingDown,
  Percent,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { exportToCSV } from '../../utils/exportUtils';
import { useApp } from '../../context/AppContext';

export const TransactionTable = ({ onAddTransaction, showVATColumns = false }) => {
  const { transactions, deleteTransaction } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'Income' | 'Purchase' | 'Expense'

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.reference && t.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.customerOrSupplier && t.customerOrSupplier.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'All' || t.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type) => {
    if (type === 'Income') return <Badge variant="success" dot size="sm">Income</Badge>;
    if (type === 'Purchase') return <Badge variant="info" dot size="sm">Purchase</Badge>;
    return <Badge variant="danger" dot size="sm">Expense</Badge>;
  };

  const handleExport = () => {
    const data = filtered.map((t) => ({
      ID: t.id,
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Description: t.description,
      Reference: t.reference || '',
      Party: t.customerOrSupplier || '',
      'Net Amount': t.netAmount,
      'VAT Amount': t.vatAmount,
      'Gross Amount': t.grossAmount,
      Status: t.status,
    }));
    exportToCSV(data, 'accounting_transactions.csv');
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
              placeholder="Search by description, reference, party..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Types</option>
            <option value="Income">Income (Sales)</option>
            <option value="Purchase">Purchases (Stock)</option>
            <option value="Expense">Operational Expenses</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" icon={Download} onClick={handleExport}>
            Export CSV
          </Button>
          {onAddTransaction && (
            <Button size="sm" variant="primary" icon={Plus} onClick={onAddTransaction}>
              Add Transaction
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[700px]">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 whitespace-nowrap">Date</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Type</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Category</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Description</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Party / Ref</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Net</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">VAT</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Gross Amount</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-12 text-slate-400">
                  No accounting records found.
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const isIncome = t.type === 'Income';
                return (
                  <tr key={t.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDate(t.date, { short: true })}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getTypeBadge(t.type)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                      {t.category}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 truncate max-w-[200px]">
                      {t.description}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      <span className="font-medium text-slate-700">{t.customerOrSupplier || '—'}</span>
                      {t.reference && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {t.reference}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-700 whitespace-nowrap">
                      {formatCurrency(t.netAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500 whitespace-nowrap">
                      {t.vatAmount > 0 ? formatCurrency(t.vatAmount) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold whitespace-nowrap">
                      <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                        {isIncome ? '+' : '-'}{formatCurrency(t.grossAmount)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
