import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { formatCurrency } from '../../utils/formatCurrency';
import { useApp } from '../../context/AppContext';

const parseDateParts = (dateVal) => {
  if (!dateVal) return null;
  if (typeof dateVal === 'string') {
    const match = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10),
        day: parseInt(match[3], 10),
        isoDate: `${match[1]}-${match[2]}-${match[3]}`,
      };
    }
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    isoDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
  };
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-700 space-y-1">
        <p className="font-bold text-slate-300">{label}</p>
        <p className="text-blue-400 font-semibold">
          Sales: {formatCurrency(payload[0]?.value || 0)}
        </p>
        {payload[1] && (
          <p className="text-emerald-400 font-semibold">
            Purchases: {formatCurrency(payload[1]?.value || 0)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const EMPTY_ARRAY = [];

export const SalesChart = ({ invoices: propInvoices, purchases: propPurchases }) => {
  const appContext = useApp();
  const currencySymbol = appContext?.currencySymbol || '£';
  const rawInvoices = propInvoices ?? appContext?.invoices ?? EMPTY_ARRAY;
  const rawPurchases = propPurchases ?? appContext?.purchases ?? EMPTY_ARRAY;

  const [period, setPeriod] = useState('monthly'); // 'weekly' | 'monthly'
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'

  // Exclude drafts and void invoices according to business rules
  const eligibleInvoices = useMemo(() => {
    return (rawInvoices || []).filter((inv) => {
      const s = (inv?.status || '').trim().toLowerCase();
      return s !== 'draft' && s !== 'void';
    });
  }, [rawInvoices]);

  // Dynamic 7-month aggregation ending at current month
  const monthlyData = useMemo(() => {
    const buckets = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        name: d.toLocaleString('en-GB', { month: 'short' }),
        sales: 0,
        purchases: 0,
      });
    }

    eligibleInvoices.forEach((inv) => {
      const parts = parseDateParts(inv.issueDate || inv.date || inv.createdAt);
      if (!parts) return;
      const bucket = buckets.find((b) => b.year === parts.year && b.month === parts.month);
      if (bucket) {
        bucket.sales = Math.round((bucket.sales + (parseFloat(inv.total) || 0)) * 100) / 100;
      }
    });

    (rawPurchases || []).forEach((p) => {
      const parts = parseDateParts(p.date || p.purchaseDate || p.createdAt);
      if (!parts) return;
      const bucket = buckets.find((b) => b.year === parts.year && b.month === parts.month);
      if (bucket) {
        bucket.purchases = Math.round((bucket.purchases + (parseFloat(p.total) || 0)) * 100) / 100;
      }
    });

    return buckets;
  }, [eligibleInvoices, rawPurchases]);

  // Dynamic current week aggregation (Mon-Sun)
  const weeklyData = useMemo(() => {
    const buckets = [];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      buckets.push({
        isoDate,
        name: dayNames[i],
        sales: 0,
        purchases: 0,
      });
    }

    eligibleInvoices.forEach((inv) => {
      const parts = parseDateParts(inv.issueDate || inv.date || inv.createdAt);
      if (!parts) return;
      const bucket = buckets.find((b) => b.isoDate === parts.isoDate);
      if (bucket) {
        bucket.sales = Math.round((bucket.sales + (parseFloat(inv.total) || 0)) * 100) / 100;
      }
    });

    (rawPurchases || []).forEach((p) => {
      const parts = parseDateParts(p.date || p.purchaseDate || p.createdAt);
      if (!parts) return;
      const bucket = buckets.find((b) => b.isoDate === parts.isoDate);
      if (bucket) {
        bucket.purchases = Math.round((bucket.purchases + (parseFloat(p.total) || 0)) * 100) / 100;
      }
    });

    return buckets;
  }, [eligibleInvoices, rawPurchases]);

  const currentData = period === 'monthly' ? monthlyData : weeklyData;
  const hasEligibleData = eligibleInvoices.length > 0 || (rawPurchases || []).length > 0;

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        title="Sales & Revenue Overview"
        subtitle={
          hasEligibleData
            ? 'Track revenue trends and wholesale purchasing volume'
            : `Track revenue trends • ${currencySymbol}0.00 baseline (No issued invoices recorded)`
        }
        action={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
              <button
                onClick={() => setPeriod('weekly')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  period === 'weekly' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  period === 'monthly' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        }
      />

      <div className="w-full h-56 sm:h-64 pt-3 sm:pt-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="purGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, (dataMax) => (dataMax > 0 ? 'auto' : 1000)]}
                tickFormatter={(val) => (val === 0 ? `${currencySymbol}0` : val >= 1000 ? `${currencySymbol}${val / 1000}k` : `${currencySymbol}${val}`)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
              <Area type="monotone" dataKey="purchases" stroke="#10B981" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#purGrad)" />
            </AreaChart>
          ) : (
            <BarChart data={currentData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, (dataMax) => (dataMax > 0 ? 'auto' : 1000)]}
                tickFormatter={(val) => (val === 0 ? `${currencySymbol}0` : val >= 1000 ? `${currencySymbol}${val / 1000}k` : `${currencySymbol}${val}`)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="purchases" fill="#93C5FD" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            Invoiced Sales
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Purchases
          </span>
        </div>
        <button
          onClick={() => setChartType(chartType === 'area' ? 'bar' : 'area')}
          className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
        >
          {chartType === 'area' ? 'Bar View' : 'Area View'}
        </button>
      </div>
    </Card>
  );
};
