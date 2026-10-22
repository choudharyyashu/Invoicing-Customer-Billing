import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { TransactionTable } from '../../components/accounting/TransactionTable';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Percent, ArrowUpRight, ArrowDownRight, CheckCircle2, FileSpreadsheet } from 'lucide-react';

const PERIOD_RANGES = {
  'Q3 2026': { start: '2026-07-01', end: '2026-09-30', label: 'Current Period (1 Jul - 30 Sep 2026)' },
  'Q2 2026': { start: '2026-04-01', end: '2026-06-30', label: 'Q2 2026 (1 Apr - 30 Jun 2026)' },
  'Q1 2026': { start: '2026-01-01', end: '2026-03-31', label: 'Q1 2026 (1 Jan - 31 Mar 2026)' },
  'Q4 2025': { start: '2025-10-01', end: '2025-12-31', label: 'Q4 2025 (1 Oct - 31 Dec 2025)' },
  'ALL': { start: '1970-01-01', end: '2099-12-31', label: 'All Recorded Periods' },
};

function calculateVatForRange(range, invoices, purchases, transactions) {
  const invVat = (invoices || [])
    .filter((inv) => inv.status !== 'Draft' && inv.status !== 'Void')
    .filter((inv) => {
      const d = inv.issueDate ? (inv.issueDate.includes('T') ? inv.issueDate.split('T')[0] : inv.issueDate) : '';
      return !range || (d >= range.start && d <= range.end);
    })
    .reduce((sum, inv) => sum + (parseFloat(inv.vatAmount) || 0), 0);

  const txnIncomeVat = (transactions || [])
    .filter((t) => t.type === 'Income')
    .filter((t) => !range || (t.date >= range.start && t.date <= range.end))
    .reduce((sum, t) => sum + (parseFloat(t.vatAmount) || 0), 0);

  const collected = invVat > 0 ? invVat : txnIncomeVat;

  const purVat = (purchases || [])
    .filter((p) => p.status !== 'Cancelled')
    .filter((p) => !range || (p.date >= range.start && p.date <= range.end))
    .reduce((sum, p) => sum + (parseFloat(p.vatAmount) || 0), 0);

  // Exclude Purchase transactions from expVat so input VAT is not double-counted with purchases
  const expVat = (transactions || [])
    .filter((t) => t.type !== 'Income' && t.type !== 'Purchase' && t.status !== 'Cancelled')
    .filter((t) => !range || (t.date >= range.start && t.date <= range.end))
    .reduce((sum, t) => sum + (parseFloat(t.vatAmount) || 0), 0);

  const paid = purVat + expVat;
  const due = Math.max(0, collected - paid);
  return { collected, paid, due };
}

export const VAT = () => {
  const { transactions, invoices, purchases, businessSettings, refreshTransactions, currencySymbol } = useApp();

  const [period, setPeriod] = useState('ALL');

  useEffect(() => {
    if (typeof refreshTransactions === 'function') {
      refreshTransactions();
    }
  }, [refreshTransactions]);

  const selectedRange = PERIOD_RANGES[period] || PERIOD_RANGES['ALL'];
  const { collected: vatCollected, paid: vatPaid, due: vatDue } = calculateVatForRange(
    selectedRange,
    invoices,
    purchases,
    transactions
  );

  const quarters = ['Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'];
  const quarterlyData = quarters.map((qKey) => {
    const qRange = PERIOD_RANGES[qKey];
    const qData = calculateVatForRange(qRange, invoices, purchases, transactions);
    return {
      period: qKey + (qKey === period ? ' (Selected)' : ''),
      collected: qData.collected,
      paid: qData.paid,
      due: qData.due,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="VAT Overview & Return Summary"
        subtitle="UK standard 20% & zero-rated produce tax liability tracking for HMRC VAT submissions."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Accounting', href: '/accounting/vat' },
          { label: 'VAT Overview' },
        ]}
        actions={
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none w-full sm:w-auto"
            >
              <option value="ALL">All Recorded Periods (Full Ledger)</option>
              <option value="Q3 2026">Current Period (1 Jul - 30 Sep 2026)</option>
              <option value="Q2 2026">Q2 2026 (1 Apr - 30 Jun 2026)</option>
              <option value="Q1 2026">Q1 2026 (1 Jan - 31 Mar 2026)</option>
              <option value="Q4 2025">Q4 2025 (1 Oct - 31 Dec 2025)</option>
            </select>
          </div>
        }
      />

      {/* VAT Registration Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold">
              HMRC MTD Ready
            </span>
            <span className="text-xs text-slate-400">VAT Registration No:</span>
            <span className="font-mono font-bold text-white text-xs">{businessSettings.vatNumber}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard VAT Rate: 20.00% • Zero-Rated Fresh Fruit & Vegetables: 0.00%
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Next Return Due Date</span>
          <span className="text-sm font-bold text-amber-400">07 Nov 2026</span>
        </div>
      </div>

      {/* 4 VAT KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="p-4" className="bg-emerald-50/40 border-emerald-100">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <span>VAT Collected (Output)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 mt-2 block">
            {formatCurrency(vatCollected)}
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block">Charged on sales & olive oil</span>
        </Card>

        <Card padding="p-4" className="bg-blue-50/40 border-blue-100">
          <div className="flex items-center justify-between text-xs font-bold text-blue-800 uppercase tracking-wider">
            <span>VAT Paid (Input)</span>
            <ArrowDownRight className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-blue-700 mt-2 block">
            {formatCurrency(vatPaid)}
          </span>
          <span className="text-[10px] text-blue-600 mt-1 block">Reclaimable on expenses & fuel</span>
        </Card>

        <Card padding="p-4" className="bg-rose-50/40 border-rose-100">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800 uppercase tracking-wider">
            <span>Net VAT Payable to HMRC</span>
            <Percent className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-700 mt-2 block">
            {formatCurrency(vatDue)}
          </span>
          <span className="text-[10px] text-rose-600 mt-1 block">Output minus Input VAT</span>
        </Card>

        <Card padding="p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Standard UK Rate</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block">20% / 0%</span>
          <span className="text-[10px] text-slate-500 mt-1 block">Standard & zero produce rates</span>
        </Card>
      </div>

      {/* VAT Trends Chart */}
      <Card padding="p-5">
        <CardHeader
          title="Quarterly VAT Return History"
          subtitle="Output VAT collected versus input VAT reclaimed over the last 4 tax quarters"
        />
        <div className="w-full h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quarterlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
              <Tooltip
                formatter={(val) => [formatCurrency(val), '']}
                contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar name="VAT Output (Collected)" dataKey="collected" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar name="VAT Input (Reclaimed)" dataKey="paid" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              <Bar name="Net VAT Due" dataKey="due" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* VAT Transactions Ledger */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          VAT Transaction Breakdown
        </h3>
        <TransactionTable showVATColumns={true} />
      </div>
    </div>
  );
};
