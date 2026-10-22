import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  CreditCard,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Download,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Eye,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { InvoicePreview } from '../../components/invoices/InvoicePreview';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { exportToCSV, triggerPrint } from '../../utils/exportUtils';

export const CustomerPortal = () => {
  const {
    currentUser,
    customers,
    invoices,
    payments,
    businessSettings,
    triggerWhatsAppAction,
    currencySymbol,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  // Identify current customer from logged-in session
  const customer =
    customers.find((c) => c.id === currentUser?.customerId || c.email === currentUser?.email) ||
    customers[0];

  const [activeTab, setActiveTab] = useState(
    tabFromUrl && ['invoices', 'payments', 'statement'].includes(tabFromUrl)
      ? tabFromUrl
      : 'invoices'
  );
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (tabFromUrl && ['invoices', 'payments', 'statement'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl) {
      setActiveTab('invoices');
    }
  }, [tabFromUrl]);

  // Filter only this customer's data
  const myInvoices = invoices.filter((i) => i.customerId === customer?.id);
  const myPayments = payments.filter((p) => p.customerId === customer?.id);

  const totalInvoiced = myInvoices.reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);
  const totalPaid = myPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const outstandingBalance = customer?.outstandingBalance ?? Math.max(0, totalInvoiced - totalPaid);

  const paidInvoicesCount = myInvoices.filter((i) => i.status === 'Paid').length;
  const sortedPayments = [...myPayments].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestPayment = sortedPayments[0] || null;

  // Generate Statement transactions for this customer
  const statementTransactions = [];
  myInvoices.forEach((inv) => {
    statementTransactions.push({
      date: inv.issueDate,
      reference: inv.invoiceNumber,
      description: `Invoice ${inv.invoiceNumber}`,
      invoice: inv.invoiceNumber,
      debit: inv.total,
      credit: 0,
    });
  });

  myPayments.forEach((pay) => {
    statementTransactions.push({
      date: pay.date,
      reference: pay.reference || pay.id,
      description: `Payment Received (${pay.method})`,
      invoice: pay.invoiceNumber || '—',
      debit: 0,
      credit: pay.amount,
    });
  });

  statementTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  let runningBalance = parseFloat(customer?.openingBalance) || 0;
  const statementWithBalance = statementTransactions.map((t) => {
    runningBalance += (t.debit - t.credit);
    return { ...t, balance: Math.round(runningBalance * 100) / 100 };
  });

  const handleExportStatement = () => {
    const data = statementWithBalance.map((r) => ({
      Date: r.date,
      Reference: r.reference,
      Description: r.description,
      [`Debit (${currencySymbol})`]: r.debit,
      [`Credit (${currencySymbol})`]: r.credit,
      [`Balance (${currencySymbol})`]: r.balance,
    }));
    exportToCSV(data, `statement_${customer?.name || 'account'}.csv`);
  };

  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'payments':
        return {
          title: 'Payment Receipts & Remittances',
          subtitle: `Official records of payments and remittances for ${customer?.name || 'your account'}`,
          actionBtnText: 'Print Receipts',
          breadcrumb: 'Payment Receipts',
        };
      case 'statement':
        return {
          title: 'Statement of Account',
          subtitle: `Running balance ledger and chronological history for ${customer?.name || 'your account'}`,
          actionBtnText: 'Print Statement',
          breadcrumb: 'Statement of Account',
        };
      case 'invoices':
      default:
        return {
          title: 'My Invoices & Billing',
          subtitle: `Wholesale produce invoices, payment terms, and status for ${customer?.name || 'your account'}`,
          actionBtnText: 'Print Invoices',
          breadcrumb: 'My Invoices',
        };
    }
  };

  const headerMeta = getHeaderMeta();

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Dynamic Dedicated Header */}
      <PageHeader
        title={headerMeta.title}
        subtitle={headerMeta.subtitle}
        breadcrumbs={[
          { label: 'Customer Portal', href: '/portal?tab=invoices' },
          { label: headerMeta.breadcrumb },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto no-print">
            <Button
              variant="outline"
              icon={MessageSquare}
              onClick={() =>
                triggerWhatsAppAction('Statement Inquiry', { recipient: customer?.name })
              }
              className="flex-1 sm:flex-none text-xs"
            >
              WhatsApp Support
            </Button>
            <Button
              variant="primary"
              icon={Printer}
              onClick={triggerPrint}
              className="w-full sm:w-auto text-xs font-bold"
            >
              {headerMeta.actionBtnText}
            </Button>
          </div>
        }
      />

      {/* Customer Info & Order Instructions Alert */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-blue-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">{customer?.name}</h2>
              <span className="text-xs text-blue-200">Account ID: <strong className="text-white font-mono">{customer?.id}</strong></span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-200 pt-1">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {customer?.email}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {customer?.phone}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {customer?.address}</span>
          </div>
        </div>

        {/* WhatsApp Notice Box */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 text-xs w-full lg:max-w-md">
          <div className="flex items-center gap-1.5 font-bold text-white mb-1">
            <Info className="w-4 h-4 text-amber-300" />
            <span>Daily Produce Ordering</span>
          </div>
          <p className="text-blue-100 text-[11px] leading-relaxed">
            Orders are sent directly through <strong>WhatsApp</strong> by your team members. This portal allows your accounting team to track invoices, payments, and live statement balances.
          </p>
        </div>
      </div>

      {/* 1. MY INVOICES & BALANCE VIEW */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Invoices & Balance KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Outstanding Balance */}
            <Card
              padding="p-4 sm:p-5"
              className={`col-span-2 sm:col-span-1 border-2 ${
                outstandingBalance > 0
                  ? 'bg-gradient-to-br from-white to-red-50/50 border-red-200'
                  : 'bg-gradient-to-br from-white to-emerald-50/50 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Outstanding Balance
                </span>
                {outstandingBalance > 0 ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <span
                className={`text-2xl sm:text-3xl font-black mt-2 block ${
                  outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {formatCurrency(outstandingBalance)}
              </span>
              <span className="text-[11px] font-medium text-slate-500 mt-1 block">
                {outstandingBalance > 0 ? 'Payment due per agreed terms' : 'All invoices settled'}
              </span>
            </Card>

            {/* Total Invoiced */}
            <Card padding="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Invoiced
                </span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-2xl font-black text-slate-900 mt-2 block">
                {formatCurrency(totalInvoiced)}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {myInvoices.length} lifetime tax invoices
              </span>
            </Card>

            {/* Invoices Settled */}
            <Card padding="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Invoices Settled
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-2xl font-black text-emerald-600 mt-2 block">
                {paidInvoicesCount} / {myInvoices.length}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {paidInvoicesCount === myInvoices.length && myInvoices.length > 0
                  ? 'All invoices paid in full'
                  : 'Fully settled invoices'}
              </span>
            </Card>

            {/* Payment Terms */}
            <Card padding="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Payment Terms
                </span>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-2xl font-black text-blue-600 mt-2 block">
                {customer?.paymentTerms || 14} Days
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Net remittance period
              </span>
            </Card>
          </div>

          {/* Issued Invoices Table Card */}
          <Card padding="p-0" className="overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Issued Invoices
                </h3>
                <p className="text-[11px] text-slate-500">
                  Click any invoice row to view or print the full itemized breakdown.
                </p>
              </div>
              <Badge variant="default" size="sm">
                {myInvoices.length} Invoices
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Issue Date</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5 text-right">Invoice Total</th>
                    <th className="p-3.5 text-right">Amount Paid</th>
                    <th className="p-3.5 text-right">Balance Due</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-slate-400">
                        No invoices found for your account.
                      </td>
                    </tr>
                  ) : (
                    myInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                      >
                        <td className="p-3.5 font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="p-3.5 text-slate-600">{formatDate(inv.issueDate)}</td>
                        <td className="p-3.5 text-slate-600">{formatDate(inv.dueDate)}</td>
                        <td className="p-3.5 text-right font-bold text-slate-900">
                          {formatCurrency(inv.total)}
                        </td>
                        <td className="p-3.5 text-right text-emerald-600 font-semibold">
                          {formatCurrency(inv.amountPaid)}
                        </td>
                        <td className="p-3.5 text-right font-black text-red-600">
                          {formatCurrency(inv.balanceDue)}
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge
                            variant={
                              inv.status === 'Paid'
                                ? 'success'
                                : inv.status === 'Overdue'
                                ? 'danger'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvoice(inv);
                            }}
                            className="px-2.5 py-1 rounded-lg text-blue-600 hover:bg-blue-100 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 2. PAYMENT RECEIPTS VIEW */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Specific KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Paid & Remitted */}
            <Card padding="p-4 sm:p-5" className="border-2 bg-gradient-to-br from-white to-emerald-50/50 border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Paid & Remitted
                </span>
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2 block">
                {formatCurrency(totalPaid)}
              </span>
              <span className="text-[11px] font-medium text-slate-500 mt-1 block">
                Total funds credited to account
              </span>
            </Card>

            {/* Receipts Recorded */}
            <Card padding="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Receipts Recorded
                </span>
                <ShieldCheck className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-2xl font-black text-slate-900 mt-2 block">
                {myPayments.length}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Verified payment records
              </span>
            </Card>

            {/* Latest Remittance */}
            <Card padding="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Latest Remittance
                </span>
                <Calendar className="w-4 h-4 text-indigo-500" />
              </div>
              <span className="text-2xl font-black text-indigo-600 mt-2 block">
                {latestPayment ? formatCurrency(latestPayment.amount) : formatCurrency(0)}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {latestPayment ? formatDate(latestPayment.date) : 'No remittances yet'}
              </span>
            </Card>

            {/* Payment Channel */}
            <Card padding="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Payment Channels
                </span>
                <Building2 className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-2xl font-black text-slate-800 mt-2 block">
                Bank & Card
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Direct Transfer / Square Terminal
              </span>
            </Card>
          </div>

          {/* Payment Records & Remittances Table Card */}
          <Card padding="p-0" className="overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Payment Records & Remittances
                </h3>
                <p className="text-[11px] text-slate-500">
                  Official receipts of funds received by Bank Transfer or Square Card.
                </p>
              </div>
              <Badge variant="success" size="sm">
                {myPayments.length} Payments Recorded
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Payment Ref</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5">Applied Invoice</th>
                    <th className="p-3.5 text-right">Amount Received</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myPayments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400">
                        No payment receipts recorded yet.
                      </td>
                    </tr>
                  ) : (
                    myPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono font-bold text-slate-900">{p.reference || p.id}</td>
                        <td className="p-3.5 text-slate-600">{formatDate(p.date)}</td>
                        <td className="p-3.5 font-medium text-slate-800">{p.method}</td>
                        <td className="p-3.5 text-blue-600 font-medium">{p.invoiceNumber || 'On Account'}</td>
                        <td className="p-3.5 text-right font-black text-emerald-600 text-sm">
                          +{formatCurrency(p.amount)}
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge variant="success" size="sm">
                            Completed
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 3. STATEMENT OF ACCOUNT VIEW */}
      {activeTab === 'statement' && (
        <div className="space-y-6">
          {/* Statement Specific KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Opening Balance */}
            <Card padding="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Opening Balance
                </span>
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-2xl font-black text-slate-900 mt-2 block">
                {formatCurrency(customer?.openingBalance || 0)}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Brought forward balance
              </span>
            </Card>

            {/* Total Debits Billed */}
            <Card padding="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Debits
                </span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-2xl font-black text-slate-900 mt-2 block">
                {formatCurrency(totalInvoiced)}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {myInvoices.length} invoices issued
              </span>
            </Card>

            {/* Total Credits Paid */}
            <Card padding="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Credits
                </span>
                <CreditCard className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-2xl font-black text-emerald-600 mt-2 block">
                {formatCurrency(totalPaid)}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {myPayments.length} remittances applied
              </span>
            </Card>

            {/* Closing Balance Due */}
            <Card
              padding="p-4 sm:p-5"
              className={`border-2 ${
                outstandingBalance > 0
                  ? 'bg-gradient-to-br from-white to-red-50/50 border-red-200'
                  : 'bg-gradient-to-br from-white to-emerald-50/50 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Closing Balance Due
                </span>
                {outstandingBalance > 0 ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <span
                className={`text-2xl font-black mt-2 block ${
                  outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {formatCurrency(outstandingBalance)}
              </span>
              <span className="text-[11px] font-medium text-slate-500 mt-1 block">
                Current net balance payable
              </span>
            </Card>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-3 no-print">
            <span className="text-xs text-slate-500">
              Showing complete debit & credit history for <strong className="text-slate-800">{customer?.name}</strong>.
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" icon={Download} onClick={handleExportStatement}>
                Export CSV
              </Button>
              <Button size="sm" variant="primary" icon={Printer} onClick={triggerPrint}>
                Print / Save PDF
              </Button>
            </div>
          </div>

          {/* Formal Printable Statement Container */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 shadow-sm print-area text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">STATEMENT OF ACCOUNT</h2>
                <p className="text-xs font-bold text-slate-700 mt-1">{businessSettings.businessName}</p>
                <p className="text-xs text-slate-500">{businessSettings.address}</p>
                <p className="text-xs text-slate-500">VAT Reg: {businessSettings.vatNumber} • Email: {businessSettings.email}</p>
              </div>

              <div className="sm:text-right text-xs space-y-1">
                <p className="text-slate-500">Date: <strong className="text-slate-900">{formatDate(new Date().toISOString())}</strong></p>
                <p className="text-slate-500">Account Ref: <strong className="font-mono text-blue-600 font-bold">{customer?.id}</strong></p>
                <p className="text-slate-500">Currency: <strong className="text-slate-900">{businessSettings?.currency || 'GBP'} ({currencySymbol})</strong></p>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Account Holder</span>
                <p className="font-bold text-sm text-slate-900">{customer?.name}</p>
                <p className="text-slate-600">{customer?.address}</p>
                <p className="text-slate-600">Contact: {customer?.contactPerson}</p>
              </div>
              <div className="sm:text-right space-y-1">
                <p className="text-slate-500">Payment Terms: <strong className="text-slate-800">{customer?.paymentTerms || 14} Days</strong></p>
                <p className="text-slate-500">Email: <strong className="text-slate-800">{customer?.email}</strong></p>
              </div>
            </div>

            {/* Statement Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px] border-collapse">
                <thead className="bg-slate-100 text-[11px] uppercase font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Debit (Invoiced)</th>
                    <th className="p-3 text-right">Credit (Paid)</th>
                    <th className="p-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {statementWithBalance.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400">
                        No transactions recorded for this account.
                      </td>
                    </tr>
                  ) : (
                    statementWithBalance.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-600">{formatDate(line.date)}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{line.reference}</td>
                        <td className="p-3 text-slate-700">{line.description}</td>
                        <td className="p-3 text-right font-medium text-slate-900">
                          {line.debit > 0 ? formatCurrency(line.debit) : '—'}
                        </td>
                        <td className="p-3 text-right text-emerald-600 font-medium">
                          {line.credit > 0 ? formatCurrency(line.credit) : '—'}
                        </td>
                        <td className="p-3 text-right font-black text-slate-900">
                          {formatCurrency(line.balance)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Remittance & Closing Balance Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="text-xs text-slate-500 max-w-sm space-y-1">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Bank Remittance Details
                </p>
                <p>Bank: <strong className="text-slate-800">{businessSettings.bankName}</strong></p>
                <p>Sort Code: <strong className="font-mono text-slate-800">{businessSettings.sortCode}</strong></p>
                <p>Account Number: <strong className="font-mono text-slate-800">{businessSettings.accountNumber}</strong></p>
                <p>Account Name: <strong className="text-slate-800">{businessSettings.accountName}</strong></p>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-xl text-right w-full sm:w-auto sm:min-w-[240px]">
                <span className="text-xs uppercase tracking-wider text-slate-300 font-bold block">
                  Total Closing Balance Due
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {formatCurrency(outstandingBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal for Customer View */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          maxWidth="max-w-3xl"
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle={`Issued on ${formatDate(selectedInvoice.issueDate)} • Balance Due: ${formatCurrency(selectedInvoice.balanceDue)}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={triggerPrint}>
                Print Invoice
              </Button>
            </>
          }
        >
          <InvoicePreview
            invoice={selectedInvoice}
            businessSettings={businessSettings}
          />
        </Modal>
      )}
    </div>
  );
};
