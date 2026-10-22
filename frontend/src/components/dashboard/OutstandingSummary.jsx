import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { formatCurrency } from '../../utils/formatCurrency';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const OutstandingSummary = () => {
  const { invoices } = useApp();
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate Aging using actual due dates and balanceDue
  const unpaidInvoices = (invoices || []).filter((i) => {
    const s = (i.status || '').toLowerCase();
    return s !== 'draft' && s !== 'void' && (parseFloat(i.balanceDue) || 0) > 0;
  });
  const totalOutstanding = unpaidInvoices.reduce((sum, i) => sum + (parseFloat(i.balanceDue) || 0), 0);

  let current = 0;
  let days1to30 = 0;
  let days31to60 = 0;
  let days60plus = 0;

  unpaidInvoices.forEach((inv) => {
    const bal = parseFloat(inv.balanceDue) || 0;
    if (bal <= 0) return;

    let dueDate = null;
    if (inv.dueDate) {
      dueDate = new Date(inv.dueDate);
      if (!isNaN(dueDate.getTime())) {
        dueDate.setHours(0, 0, 0, 0);
      } else {
        dueDate = null;
      }
    }

    if (dueDate && dueDate.getTime() >= today.getTime()) {
      current += bal;
    } else if (dueDate) {
      const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        days1to30 += bal;
      } else if (diffDays <= 60) {
        days31to60 += bal;
      } else {
        days60plus += bal;
      }
    } else {
      if (inv.status === 'Overdue') {
        days1to30 += bal;
      } else {
        current += bal;
      }
    }
  });

  current = Math.round(current * 100) / 100;
  days1to30 = Math.round(days1to30 * 100) / 100;
  days31to60 = Math.round(days31to60 * 100) / 100;
  days60plus = Math.round(days60plus * 100) / 100;

  const brackets = [
    { label: 'Current (Not Due)', amount: current, percentage: totalOutstanding ? (current / totalOutstanding) * 100 : 0, color: 'bg-blue-600', textColor: 'text-blue-700', bg: 'bg-blue-50' },
    { label: '1–30 Days Overdue', amount: days1to30, percentage: totalOutstanding ? (days1to30 / totalOutstanding) * 100 : 0, color: 'bg-amber-500', textColor: 'text-amber-700', bg: 'bg-amber-50' },
    { label: '31–60 Days Overdue', amount: days31to60, percentage: totalOutstanding ? (days31to60 / totalOutstanding) * 100 : 0, color: 'bg-orange-500', textColor: 'text-orange-700', bg: 'bg-orange-50' },
    { label: '60+ Days Overdue', amount: days60plus, percentage: totalOutstanding ? (days60plus / totalOutstanding) * 100 : 0, color: 'bg-red-500', textColor: 'text-red-700', bg: 'bg-red-50' },
  ];

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        title="Outstanding Aging Summary"
        subtitle={`${unpaidInvoices.length} invoices with balances pending`}
        action={
          <button
            onClick={() => navigate('/invoices')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />

      <div className="py-2">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-xs text-slate-500 font-medium">Total Pending Receivables</span>
          <span className="text-xl font-black text-slate-900">{formatCurrency(totalOutstanding)}</span>
        </div>

        {/* Progress bar visual */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
          {brackets.map((b, i) => (
            <div
              key={i}
              className={`${b.color} transition-all duration-500`}
              style={{ width: `${Math.max(b.percentage, 0)}%` }}
              title={`${b.label}: ${formatCurrency(b.amount)}`}
            />
          ))}
        </div>

        {/* Detailed bracket breakdown list */}
        <div className="mt-4 space-y-2.5">
          {brackets.map((b, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${b.color}`} />
                <span className="text-slate-600 font-medium">{b.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">{formatCurrency(b.amount)}</span>
                <span className="text-[11px] text-slate-400 font-mono w-10 text-right">
                  {b.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Fast action recommended:</span>
        <button
          onClick={() => navigate('/statements')}
          className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          Send Statement Reminders →
        </button>
      </div>
    </Card>
  );
};
