import React, { useState, useEffect } from 'react';
import {
  FileText,
  Truck,
  CreditCard,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  Percent,
  ShoppingCart,
  Download,
  Printer,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { exportToCSV, triggerPrint } from '../../utils/exportUtils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export const Reports = () => {
  const { invoices, customers, payments, purchases, transactions, dailyOrders, refreshTransactions } = useApp();

  const [activeReportId, setActiveReportId] = useState(null);
  const [dateRange, setDateRange] = useState('All');

  useEffect(() => {
    if (typeof refreshTransactions === 'function') {
      refreshTransactions();
    }
  }, [refreshTransactions]);

  const reportCategories = [
    {
      id: 'sales',
      title: 'Sales & Invoicing Report',
      description: 'Breakdown of issued customer invoices, product volume, and billing revenue.',
      icon: FileText,
      iconColor: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'purchases',
      title: 'Wholesale Purchase Report',
      description: 'Detailed analysis of produce supplier expenses and market procurement.',
      icon: Truck,
      iconColor: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'payments',
      title: 'Payment & Settlement Report',
      description: 'Audit trail of customer payments across Bank Transfers, Square, and cash.',
      icon: CreditCard,
      iconColor: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'outstanding',
      title: 'Outstanding Receivables Report',
      description: 'Overdue invoices, aging analysis, and unsettled customer ledger accounts.',
      icon: AlertTriangle,
      iconColor: 'bg-rose-50 text-rose-600',
    },
    {
      id: 'income_expense',
      title: 'Income & Expense Report',
      description: 'Comprehensive profit and loss statement with operating expense breakdown.',
      icon: TrendingUp,
      iconColor: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'vat',
      title: 'VAT Liability & Return Report',
      description: 'Tax collected on sales vs tax paid on wholesale supplies for quarterly HMRC filings.',
      icon: Percent,
      iconColor: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'daily_orders',
      title: 'Daily Order Aggregation Report',
      description: 'Historical summary of daily restaurant orders and produce fulfillment.',
      icon: ShoppingCart,
      iconColor: 'bg-teal-50 text-teal-600',
    },
  ];

  const handleExportActive = () => {
    if (activeReportId === 'sales') {
      exportToCSV(invoices, 'sales_report.csv');
    } else if (activeReportId === 'purchases') {
      exportToCSV(purchases, 'purchases_report.csv');
    } else if (activeReportId === 'payments') {
      exportToCSV(payments, 'payments_report.csv');
    } else if (activeReportId === 'outstanding') {
      exportToCSV(invoices.filter((i) => i.balanceDue > 0), 'outstanding_report.csv');
    } else {
      exportToCSV(transactions, 'accounting_report.csv');
    }
  };

  const selectedReport = reportCategories.find((r) => r.id === activeReportId);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Business Reports & Analytics"
        subtitle="Generate, export and print formal financial, procurement, and tax audit summaries."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Accounting', href: '/reports' },
          { label: selectedReport ? selectedReport.title : 'Reports' },
        ]}
        actions={
          activeReportId && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto no-print">
              <Button
                variant="outline"
                icon={ArrowLeft}
                onClick={() => setActiveReportId(null)}
                className="flex-1 sm:flex-none"
              >
                All Reports
              </Button>
              <Button
                variant="outline"
                icon={Download}
                onClick={handleExportActive}
                className="flex-1 sm:flex-none"
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                icon={Printer}
                onClick={triggerPrint}
                className="w-full sm:w-auto font-bold"
              >
                Print Report
              </Button>
            </div>
          )
        }
      />

      {!activeReportId ? (
        /* Report Categories Hub Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reportCategories.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                hover
                onClick={() => setActiveReportId(report.id)}
                className="flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${report.iconColor} border border-slate-200/50`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Click to generate</span>
                  <span className="font-bold text-blue-600 group-hover:underline">
                    View Report →
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Active Report Detail View */
        <div className="space-y-6">
          {/* Sales Report View */}
          {activeReportId === 'sales' && (
            <div className="space-y-6 print-area">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card padding="p-4">
                  <span className="text-xs text-slate-400 uppercase font-bold">Total Invoices</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{invoices.length}</span>
                </Card>
                <Card padding="p-4">
                  <span className="text-xs text-slate-400 uppercase font-bold">Gross Revenue</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {formatCurrency(invoices.reduce((s, i) => s + (parseFloat(i.total) || 0), 0))}
                  </span>
                </Card>
                <Card padding="p-4">
                  <span className="text-xs text-slate-400 uppercase font-bold">Average Invoice Value</span>
                  <span className="text-2xl font-black text-blue-600 mt-1 block">
                    {formatCurrency(invoices.reduce((s, i) => s + (parseFloat(i.total) || 0), 0) / (invoices.length || 1))}
                  </span>
                </Card>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead className="bg-slate-50 uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Invoice #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Subtotal</th>
                      <th className="p-3 text-right">VAT</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((i) => (
                      <tr key={i.id}>
                        <td className="p-3 font-bold text-slate-900">{i.invoiceNumber}</td>
                        <td className="p-3 font-medium text-slate-800">{i.customerName}</td>
                        <td className="p-3 text-slate-500">{formatDate(i.issueDate)}</td>
                        <td className="p-3 text-right">{formatCurrency(i.subtotal)}</td>
                        <td className="p-3 text-right">{formatCurrency(i.vatAmount)}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(i.total)}</td>
                        <td className="p-3 text-center">
                          <Badge variant={i.status === 'Paid' ? 'success' : 'warning'} size="sm">
                            {i.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Outstanding Report View */}
          {activeReportId === 'outstanding' && (
            <div className="space-y-6 print-area">
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-200 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-red-900">Total Uncollected Balance</h3>
                  <p className="text-xs text-red-700">Accounts receivable requiring immediate settlement action.</p>
                </div>
                <span className="text-2xl font-black text-red-700">
                  {formatCurrency(invoices.reduce((s, i) => s + (parseFloat(i.balanceDue) || 0), 0))}
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead className="bg-slate-50 uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Invoice #</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3 text-right">Total Invoiced</th>
                      <th className="p-3 text-right">Paid</th>
                      <th className="p-3 text-right">Outstanding Due</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.filter((i) => i.balanceDue > 0).map((i) => (
                      <tr key={i.id}>
                        <td className="p-3 font-bold text-slate-900">{i.customerName}</td>
                        <td className="p-3 font-mono text-blue-600">{i.invoiceNumber}</td>
                        <td className="p-3 text-slate-500">{formatDate(i.dueDate)}</td>
                        <td className="p-3 text-right">{formatCurrency(i.total)}</td>
                        <td className="p-3 text-right text-emerald-600">{formatCurrency(i.amountPaid)}</td>
                        <td className="p-3 text-right font-black text-red-600">{formatCurrency(i.balanceDue)}</td>
                        <td className="p-3 text-center">
                          <Badge variant={i.status === 'Overdue' ? 'danger' : 'warning'} size="sm">
                            {i.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fallback general accounting table for other report views */}
          {activeReportId !== 'sales' && activeReportId !== 'outstanding' && (
            <div className="space-y-6 print-area">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                Displaying complete audit ledger records for <span className="font-bold text-slate-900">{selectedReport?.title}</span>.
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead className="bg-slate-50 uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Net</th>
                      <th className="p-3 text-right">VAT</th>
                      <th className="p-3 text-right">Gross Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((t) => (
                      <tr key={t.id}>
                        <td className="p-3">{formatDate(t.date)}</td>
                        <td className="p-3"><Badge variant="default" size="sm">{t.type}</Badge></td>
                        <td className="p-3 font-semibold">{t.category}</td>
                        <td className="p-3 text-slate-600">{t.description}</td>
                        <td className="p-3 text-right">{formatCurrency(t.netAmount)}</td>
                        <td className="p-3 text-right text-slate-500">{formatCurrency(t.vatAmount)}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(t.grossAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
