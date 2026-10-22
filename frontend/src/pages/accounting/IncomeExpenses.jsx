import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { TransactionTable } from '../../components/accounting/TransactionTable';
import { AddTransactionModal } from '../../components/accounting/AddTransactionModal';
import { TransactionMigrationModal } from '../../components/accounting/TransactionMigrationModal';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent, Database } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 space-y-1">
        <p className="font-bold text-slate-300">{label}</p>
        <p className="text-emerald-400 font-semibold">
          Income: {formatCurrency(payload[0]?.value || 0)}
        </p>
        <p className="text-red-400 font-semibold">
          Expenses & Stock: {formatCurrency(payload[1]?.value || 0)}
        </p>
        <p className="text-blue-400 font-bold border-t border-slate-700 pt-1">
          Net Profit: {formatCurrency((payload[0]?.value || 0) - (payload[1]?.value || 0))}
        </p>
      </div>
    );
  }
  return null;
};

export const IncomeExpenses = () => {
  const { transactions, refreshTransactions, isTransactionsLoading, transactionsError, currencySymbol } = useApp();

  const [dateFilter, setDateFilter] = useState('month'); // 'today' | 'week' | 'month' | 'year'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

  useEffect(() => {
    if (typeof refreshTransactions === 'function') {
      refreshTransactions();
    }
  }, [refreshTransactions]);

  // Check if browser has unmigrated localStorage records
  const hasLocalTransactions = (() => {
    try {
      const saved = localStorage.getItem('lf_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0;
      }
    } catch {
      return false;
    }
    return false;
  })();

  // Filter transactions by selected dateFilter ('week' | 'month' | 'year')
  const now = new Date();
  const filteredTransactions = (transactions || [])
    .filter((t) => t.status !== 'Cancelled')
    .filter((t) => {
    if (!t.date) return true;
    const tDate = new Date(t.date);
    if (isNaN(tDate.getTime())) return true;
    if (dateFilter === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return tDate >= sevenDaysAgo;
    }
    if (dateFilter === 'month') {
      return tDate.getFullYear() === now.getFullYear() && tDate.getMonth() === now.getMonth();
    }
    if (dateFilter === 'year') {
      return tDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Compute Totals from filtered records
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'Income')
    .reduce((sum, t) => sum + (parseFloat(t.grossAmount) || 0), 0);

  const totalPurchases = filteredTransactions
    .filter((t) => t.type === 'Purchase')
    .reduce((sum, t) => sum + (parseFloat(t.grossAmount) || 0), 0);

  const totalOtherExpenses = filteredTransactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + (parseFloat(t.grossAmount) || 0), 0);

  const totalCosts = totalPurchases + totalOtherExpenses;
  const netProfit = totalIncome - totalCosts;

  const totalVAT = filteredTransactions.reduce((sum, t) => {
    if (t.type === 'Income') return sum + (parseFloat(t.vatAmount) || 0);
    return sum - (parseFloat(t.vatAmount) || 0);
  }, 0);

  // Monthly breakdown for chart derived dynamically from transaction history
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyAgg = {};
  const currentNow = new Date();

  // Initialize last 6 calendar months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentNow.getFullYear(), currentNow.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyAgg[key] = {
      name: monthNames[d.getMonth()],
      income: 0,
      expenses: 0,
      net: 0,
    };
  }

  (transactions || []).forEach((t) => {
    if (!t.date || t.status === 'Cancelled') return;
    const key = t.date.substring(0, 7);
    if (monthlyAgg[key]) {
      const gross = parseFloat(t.grossAmount) || 0;
      if (t.type === 'Income') {
        monthlyAgg[key].income += gross;
      } else {
        monthlyAgg[key].expenses += gross;
      }
      monthlyAgg[key].net = monthlyAgg[key].income - monthlyAgg[key].expenses;
    }
  });

  const comparisonData = Object.values(monthlyAgg);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Income & Expenses"
        subtitle="Track cash inflows, wholesale purchases, and operating expenses with net profit visibility."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Accounting', href: '/accounting/income-expenses' },
          { label: 'Income & Expenses' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 flex-1 sm:flex-none justify-between">
              <button
                onClick={() => setDateFilter('week')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md flex-1 sm:flex-none text-center ${
                  dateFilter === 'week' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md flex-1 sm:flex-none text-center ${
                  dateFilter === 'month' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setDateFilter('year')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md flex-1 sm:flex-none text-center ${
                  dateFilter === 'year' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                Year
              </button>
            </div>

            {hasLocalTransactions && (
              <Button
                variant="outline"
                icon={Database}
                onClick={() => setIsMigrationModalOpen(true)}
                className="w-full sm:w-auto text-blue-700 bg-blue-50/60 hover:bg-blue-100/80 border-blue-200"
              >
                Import Browser Records
              </Button>
            )}

            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto"
            >
              Add Entry
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card padding="p-4" className="bg-emerald-50/40 border-emerald-100">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Income</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">
            {formatCurrency(totalIncome)}
          </span>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Client invoice receipts</span>
        </Card>

        <Card padding="p-4" className="bg-blue-50/40 border-blue-100">
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Wholesale Purchases</span>
          <span className="text-xl font-black text-blue-700 mt-1 block">
            {formatCurrency(totalPurchases)}
          </span>
          <span className="text-[10px] text-blue-600 mt-0.5 block">Market produce stock</span>
        </Card>

        <Card padding="p-4" className="bg-amber-50/40 border-amber-100">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Other Expenses</span>
          <span className="text-xl font-black text-amber-700 mt-1 block">
            {formatCurrency(totalOtherExpenses)}
          </span>
          <span className="text-[10px] text-amber-600 mt-0.5 block">Fuel, utilities, logistics</span>
        </Card>

        <Card padding="p-4" className="bg-gradient-to-br from-white to-slate-50 border-slate-200">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Net Operating Profit</span>
          <span className={`text-xl font-black mt-1 block ${netProfit >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
            {formatCurrency(netProfit)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Income minus all costs</span>
        </Card>

        <Card padding="p-4" className="bg-purple-50/40 border-purple-100 col-span-2 sm:col-span-1">
          <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Net VAT</span>
          <span className="text-xl font-black text-purple-700 mt-1 block">
            {formatCurrency(totalVAT)}
          </span>
          <span className="text-[10px] text-purple-600 mt-0.5 block">Collected - Paid</span>
        </Card>
      </div>

      {/* Income vs Expenses Chart */}
      <Card padding="p-5">
        <CardHeader
          title="Income vs Expenses (Monthly Performance)"
          subtitle="Revenue inflows compared with procurement stock and operational overheads"
        />
        <div className="w-full h-72 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${currencySymbol}${val / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Bar name={`Gross Income (${currencySymbol})`} dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar name={`Total Expenses & Stock (${currencySymbol})`} dataKey="expenses" fill="#F87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Accounting Transactions Table */}
      <TransactionTable onAddTransaction={() => setIsAddModalOpen(true)} />

      {/* Add Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Migration Modal */}
      <TransactionMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
      />
    </div>
  );
};
