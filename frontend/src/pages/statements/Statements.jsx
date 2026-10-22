import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FileSpreadsheet,
  Printer,
  Download,
  MessageSquare,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { exportToCSV, triggerPrint } from '../../utils/exportUtils';

import { customerApi } from '../../services/api';

export const Statements = () => {
  const { customers, invoices, payments, businessSettings, triggerWhatsAppAction, currencySymbol } = useApp();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialCustId = queryParams.get('customer') || customers[0]?.id || '';

  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustId);
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [statementData, setStatementData] = useState(null);
  const [isLoadingStatement, setIsLoadingStatement] = useState(false);

  const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  useEffect(() => {
    let isMounted = true;
    const fetchStatement = async () => {
      if (!customer?.id) return;
      try {
        setIsLoadingStatement(true);
        const res = await customerApi.getStatement(customer.id, {
          startDate: fromDate || undefined,
          endDate: toDate || undefined,
        });
        if (isMounted && res?.data) {
          setStatementData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Could not fetch server statement, falling back to local calculation:', err);
          setStatementData(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingStatement(false);
        }
      }
    };

    fetchStatement();
    return () => {
      isMounted = false;
    };
  }, [customer?.id, fromDate, toDate]);

  // Derived financial summary (prioritize verified server statement)
  const openingBalance = statementData?.summary?.openingBalance !== undefined
    ? statementData.summary.openingBalance
    : (parseFloat(customer?.openingBalance) || 0);

  const totalPurchases = statementData?.summary?.totalInvoiced !== undefined
    ? statementData.summary.totalInvoiced
    : (invoices || []).filter((i) => i.customerId === customer?.id && i.status !== 'Draft' && i.status !== 'Void')
        .reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);

  const totalPaid = statementData?.summary?.totalPaid !== undefined
    ? statementData.summary.totalPaid
    : (payments || []).filter((p) => p.customerId === customer?.id && p.status !== 'Void')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const closingBalance = statementData?.summary?.currentOutstandingBalance !== undefined
    ? statementData.summary.currentOutstandingBalance
    : (customer?.outstandingBalance !== undefined ? parseFloat(customer.outstandingBalance) : (openingBalance + totalPurchases - totalPaid));

  // Ledger transaction rows
  const rowsWithBalance = statementData?.transactions || (() => {
    const customerInvoices = (invoices || []).filter(
      (i) => i.customerId === customer?.id && i.status !== 'Draft' && (!fromDate || i.issueDate >= fromDate) && (!toDate || i.issueDate <= toDate)
    );
    const customerPayments = (payments || []).filter(
      (p) => p.customerId === customer?.id && p.status !== 'Void' && (!fromDate || p.date >= fromDate) && (!toDate || p.date <= toDate)
    );

    const txns = [];
    customerInvoices.forEach((inv) => {
      txns.push({
        id: inv.id,
        date: inv.issueDate,
        reference: inv.invoiceNumber,
        description: `Invoice ${inv.invoiceNumber} - ${inv.items?.length || 1} produce items`,
        invoice: inv.invoiceNumber,
        debit: parseFloat(inv.total) || 0,
        credit: 0,
      });
    });

    customerPayments.forEach((pay) => {
      txns.push({
        id: pay.id,
        date: pay.date,
        reference: pay.reference || pay.id,
        description: `Customer Remittance (${pay.method})`,
        invoice: pay.invoiceNumber || '—',
        debit: 0,
        credit: parseFloat(pay.amount) || 0,
      });
    });

    txns.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runBal = openingBalance;
    return txns.map((t) => {
      runBal += (t.debit - t.credit);
      return { ...t, balance: Math.round(runBal * 100) / 100 };
    });
  })();

  const handleExport = () => {
    const data = rowsWithBalance.map((r) => ({
      Date: r.date,
      Reference: r.reference,
      Description: r.description,
      Invoice: r.invoice,
      [`Debit (${currencySymbol})`]: r.debit,
      [`Credit (${currencySymbol})`]: r.credit,
      [`Balance (${currencySymbol})`]: r.balance,
    }));
    exportToCSV(data, `statement_${customer?.name || 'client'}.csv`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Customer Statements"
        subtitle="Generate and dispatch formal client account statements with debit/credit ledger breakdown."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales', href: '/statements' },
          { label: 'Statements' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto no-print">
            <Button
              variant="outline"
              icon={MessageSquare}
              onClick={() =>
                triggerWhatsAppAction('Statement Link', { recipient: customer?.name })
              }
              className="flex-1 sm:flex-none"
            >
              WhatsApp
            </Button>
            <Button size="md" variant="outline" icon={Download} onClick={handleExport} className="flex-1 sm:flex-none">
              Export CSV
            </Button>
            <Button size="md" variant="primary" icon={Printer} onClick={triggerPrint} className="w-full sm:w-auto font-bold">
              Print / PDF
            </Button>
          </div>
        }
      />

      {/* Filter / Customer Selector Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-end gap-4 no-print">
        <div className="flex-1 w-full">
          <Select
            label="Select Customer"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.name} — Balance: ${formatCurrency(c.outstandingBalance)}`,
            }))}
          />
        </div>

        <div className="w-full sm:w-44">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-slate-200"
          />
        </div>

        <div className="w-full sm:w-44">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-slate-200"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
        <Card padding="p-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opening Balance</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{formatCurrency(openingBalance)}</span>
        </Card>
        <Card padding="p-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchases (Debits)</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{formatCurrency(totalPurchases)}</span>
        </Card>
        <Card padding="p-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payments (Credits)</span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">{formatCurrency(totalPaid)}</span>
        </Card>
        <Card padding="p-4" className="bg-blue-50/50 border-blue-200">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Closing Balance Due</span>
          <span className="text-xl font-black text-blue-950 mt-1 block">{formatCurrency(closingBalance)}</span>
        </Card>
      </div>

      {/* Printable Statement Document */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-4 sm:p-8 sm:p-10 print-area text-slate-800">
        {/* Statement Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {businessSettings.businessName}
                </h2>
                <p className="text-xs text-slate-500">{businessSettings.tradingName}</p>
              </div>
            </div>
            <div className="text-xs text-slate-500 space-y-0.5 mt-2">
              <p>{businessSettings.address}</p>
              <p>VAT Reg: {businessSettings.vatNumber} | Email: {businessSettings.email}</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              STATEMENT OF ACCOUNT
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Period: <span className="font-semibold text-slate-800">{formatDate(fromDate)} – {formatDate(toDate)}</span>
            </p>
            <p className="text-xs text-slate-500">
              Generated On: <span className="font-semibold text-slate-800">{formatDate(new Date().toISOString())}</span>
            </p>
          </div>
        </div>

        {/* Customer Account Info */}
        <div className="py-6 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Account Holder
            </span>
            <h3 className="text-lg font-bold text-slate-900">{customer?.name}</h3>
            <p className="text-xs text-slate-500">{customer?.address}</p>
            <p className="text-xs text-slate-500">VAT No: {customer?.vatNumber || 'N/A'}</p>
          </div>

          <div className="sm:text-right text-xs space-y-1">
            <p><span className="text-slate-400">Account ID:</span> <span className="font-mono font-bold text-slate-900">{customer?.id}</span></p>
            <p><span className="text-slate-400">Payment Terms:</span> <span className="font-semibold text-slate-800">{customer?.paymentTerms || 14} Days</span></p>
            <p><span className="text-slate-400">Default Currency:</span> <span className="font-semibold text-slate-800">{businessSettings?.currency || 'GBP'} ({currencySymbol})</span></p>
          </div>
        </div>

        {/* Statement Transactions Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold bg-slate-50/70">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3 text-right">Debit (Charge)</th>
                <th className="py-2.5 px-3 text-right">Credit (Payment)</th>
                <th className="py-2.5 px-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rowsWithBalance.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No transactions recorded for this period.
                  </td>
                </tr>
              ) : (
                rowsWithBalance.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-slate-600">{formatDate(row.date)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{row.reference}</td>
                    <td className="py-3 px-3 text-slate-700">{row.description}</td>
                    <td className="py-3 px-3 text-blue-600 font-medium">{row.invoice}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-900">
                      {row.debit > 0 ? formatCurrency(row.debit) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-600">
                      {row.credit > 0 ? formatCurrency(row.credit) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      {formatCurrency(row.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Remittance Box & Balance Due */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="text-xs text-slate-500 max-w-sm space-y-1">
            <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Payment Remittance Instructions</p>
            <p>Please remit all overdue balances via Direct Bank Transfer:</p>
            <p>Bank: <span className="font-medium text-slate-700">{businessSettings.bankName}</span> | Sort Code: <span className="font-mono font-bold text-slate-800">{businessSettings.sortCode}</span></p>
            <p>Account Number: <span className="font-mono font-bold text-slate-800">{businessSettings.accountNumber}</span></p>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl text-right w-full sm:w-auto sm:min-w-[260px]">
            <span className="text-xs uppercase tracking-wider text-slate-300 font-bold block">
              Total Outstanding Balance Due
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {formatCurrency(closingBalance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
