import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  CreditCard,
  FileSpreadsheet,
  Plus,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Printer,
  Download,
  AlertTriangle,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { CustomerFormModal } from '../../components/customers/CustomerFormModal';
import { RecordPaymentModal } from '../../components/invoices/RecordPaymentModal';
import { useApp } from '../../context/AppContext';
import { customerApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { exportToCSV, triggerPrint } from '../../utils/exportUtils';

export const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    customers,
    invoices,
    payments,
    vans,
    triggerWhatsAppAction,
    businessSettings,
    currentUser,
  } = useApp();

  const [fetchedCustomer, setFetchedCustomer] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadDetail = async () => {
      try {
        setIsLoadingDetail(true);
        const res = await customerApi.getById(id);
        if (isMounted && res?.data) {
          setFetchedCustomer(res.data);
          setErrorDetail(null);
        }
      } catch (err) {
        if (isMounted) {
          setErrorDetail(err.message || 'Failed to load customer details');
        }
      } finally {
        if (isMounted) setIsLoadingDetail(false);
      }
    };

    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const customer = customers.find((c) => c.id === id) || fetchedCustomer;
  const isAdmin = currentUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'invoices' | 'payments' | 'statement'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  if (isLoadingDetail && !customer) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading customer profile...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">Customer not found</h2>
        {errorDetail && <p className="text-xs text-red-500 mt-1">{errorDetail}</p>}
        <Button variant="primary" className="mt-4" onClick={() => navigate('/customers')}>
          Back to Customers
        </Button>
      </div>
    );
  }

  // Filter invoices and payments for this specific customer
  const customerInvoices = invoices.filter((i) => i.customerId === customer.id);
  const customerPayments = payments.filter((p) => p.customerId === customer.id);

  // Generate Statement line transactions
  const openingBalance = parseFloat(customer.openingBalance) || 0;
  const statementLines = [];
  customerInvoices.forEach((inv) => {
    statementLines.push({
      date: inv.issueDate,
      reference: inv.invoiceNumber,
      description: `Invoice ${inv.invoiceNumber}`,
      debit: inv.total,
      credit: 0,
      type: 'Invoice',
    });
  });
  customerPayments.forEach((pay) => {
    statementLines.push({
      date: pay.date,
      reference: pay.reference || pay.id,
      description: `Payment Received (${pay.method})`,
      debit: 0,
      credit: pay.amount,
      type: 'Payment',
    });
  });

  // Sort statement lines chronologically
  statementLines.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Compute running balance — start from opening balance
  let runningBalance = openingBalance;
  const statementWithBalance = [
    // Opening balance line (only show if > 0)
    ...(openingBalance > 0 ? [{
      date: customer.createdAt || '—',
      reference: 'OPB',
      description: 'Opening Balance (Brought Forward)',
      debit: openingBalance,
      credit: 0,
      type: 'Opening',
      balance: openingBalance,
    }] : []),
    ...statementLines.map((line) => {
      runningBalance += (line.debit - line.credit);
      return { ...line, balance: runningBalance };
    }),
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'invoices', label: 'Invoices', icon: FileText, count: customerInvoices.length },
    { id: 'payments', label: 'Payments', icon: CreditCard, count: customerPayments.length },
    { id: 'statement', label: 'Financial Statement', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={customer.name}
        subtitle={customer.contactPerson ? `Contact: ${customer.contactPerson}` : 'Customer Account Profile'}
        breadcrumbs={[
          { label: 'Customers', href: '/customers' },
          { label: customer.name },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto no-print">
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate('/customers')}
              className="flex-1 sm:flex-none"
            >
              Back
            </Button>
            <Button
              variant="outline"
              icon={MessageSquare}
              onClick={() =>
                triggerWhatsAppAction('Account Summary', { recipient: customer.name })
              }
              className="flex-1 sm:flex-none"
            >
              WhatsApp
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                icon={Edit2}
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 sm:flex-none"
              >
                Edit Profile
              </Button>
            )}
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate(`/invoices/create?customer=${customer.id}`)}
              className="w-full sm:w-auto font-bold"
            >
              New Invoice
            </Button>
          </div>
        }
      />

      {/* Top Profile Summary Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Contact Info Card */}
        <Card padding="p-4" className="lg:col-span-2">
          <div className="flex items-start justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Contact & Billing Information
            </h4>
            <Badge variant={customer.status === 'Active' ? 'success' : 'draft'} size="sm" dot>
              {customer.status || 'Active'}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{customer.email || 'No email provided'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{customer.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-start gap-2 sm:col-span-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{customer.address || 'London, UK'}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2 pt-1 border-t border-slate-100">
              <span className="font-semibold text-slate-500">Delivery Van:</span>
              <span className="font-bold text-slate-800">
                {(() => {
                  const assignedVan = vans.find((v) => v.id === customer.vanId) || customer.van;
                  return assignedVan ? `${assignedVan.name} (${assignedVan.vehicle || assignedVan.id})` : (customer.vanId || 'Not Assigned');
                })()}
              </span>
            </div>
          </div>
        </Card>

        {/* Total Purchases */}
        <Card padding="p-4" className="flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Purchases</span>
          <span className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(customer.totalPurchases)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1">{customerInvoices.length} lifetime invoices</span>
        </Card>

        {/* Outstanding Balance */}
        <Card padding="p-4" className="flex flex-col justify-between bg-gradient-to-br from-white to-red-50/40 border-red-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Outstanding Balance</span>
            {customer.outstandingBalance > 0 && <AlertTriangle className="w-4 h-4 text-red-500" />}
          </div>
          <span className="text-2xl font-black text-red-600 mt-2">
            {formatCurrency(customer.outstandingBalance)}
          </span>
          {openingBalance > 0 && (
            <span className="text-[11px] text-amber-700 bg-amber-50 rounded-md px-2 py-0.5 mt-1 border border-amber-100 w-fit">
              Incl. {formatCurrency(openingBalance)} opening balance
            </span>
          )}
          <div className="mt-2 pt-2 border-t border-red-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Terms: {customer.paymentTerms || 14} Days</span>
            {customer.outstandingBalance > 0 && (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="font-bold text-blue-600 hover:text-blue-800"
              >
                Record Payment →
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Profile Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Invoices list */}
            <Card padding="p-5">
              <CardHeader
                title="Recent Customer Invoices"
                subtitle="Latest issued invoices and settlement states"
                action={
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    View All
                  </button>
                }
              />
              <div className="divide-y divide-slate-100 mt-2">
                {customerInvoices.slice(0, 4).map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 cursor-pointer px-2 rounded-lg"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{inv.invoiceNumber}</p>
                      <p className="text-slate-400 text-[11px]">{formatDate(inv.issueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{formatCurrency(inv.total)}</p>
                      <p className={inv.balanceDue > 0 ? 'text-red-600 font-bold' : 'text-emerald-600'}>
                        {inv.balanceDue > 0 ? `Due: ${formatCurrency(inv.balanceDue)}` : 'Paid'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Payments list */}
            <Card padding="p-5">
              <CardHeader
                title="Recent Payments Recorded"
                subtitle="Remittances received via Bank Transfer or Square"
                action={
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    View All
                  </button>
                }
              />
              <div className="divide-y divide-slate-100 mt-2">
                {customerPayments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No payment records yet.</p>
                ) : (
                  customerPayments.slice(0, 4).map((pay) => (
                    <div key={pay.id} className="py-2.5 flex items-center justify-between text-xs px-2">
                      <div>
                        <p className="font-bold text-slate-900">{pay.method}</p>
                        <p className="text-slate-400 text-[11px]">Ref: {pay.reference || pay.id} • {formatDate(pay.date)}</p>
                      </div>
                      <span className="font-black text-emerald-600 text-sm">
                        +{formatCurrency(pay.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Invoices */}
      {activeTab === 'invoices' && (
        <Card padding="p-0" className="overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[650px]">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-right">Paid</th>
                  <th className="p-4 text-right">Balance</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="hover:bg-blue-50/50 cursor-pointer"
                  >
                    <td className="p-4 font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="p-4">{formatDate(inv.issueDate)}</td>
                    <td className="p-4">{formatDate(inv.dueDate)}</td>
                    <td className="p-4 text-right font-bold text-slate-900">{formatCurrency(inv.total)}</td>
                    <td className="p-4 text-right text-emerald-600 font-semibold">{formatCurrency(inv.amountPaid)}</td>
                    <td className="p-4 text-right font-black text-red-600">{formatCurrency(inv.balanceDue)}</td>
                    <td className="p-4 text-center">
                      <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'} size="sm">
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Payments */}
      {activeTab === 'payments' && (
        <Card padding="p-0" className="overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[650px]">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-4">Payment ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Invoice</th>
                  <th className="p-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/50">
                    <td className="p-4 font-mono font-bold text-slate-900">{p.id}</td>
                    <td className="p-4">{formatDate(p.date)}</td>
                    <td className="p-4">{p.method}</td>
                    <td className="p-4 font-mono text-slate-500">{p.reference || '—'}</td>
                    <td className="p-4 text-blue-600">{p.invoiceNumber || 'On Account'}</td>
                    <td className="p-4 text-right font-black text-emerald-600 text-sm">+{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Financial Statement */}
      {activeTab === 'statement' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2 no-print">
            <Button size="sm" variant="outline" icon={Printer} onClick={triggerPrint}>
              Print Statement
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Download}
              onClick={() => exportToCSV(statementWithBalance, `statement_${customer.name}.csv`)}
            >
              Export CSV
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm print-area">
            {/* Statement Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">STATEMENT OF ACCOUNT</h2>
                <p className="text-xs text-slate-500 mt-1">{businessSettings.businessName}</p>
                <p className="text-xs text-slate-500">{businessSettings.address}</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-slate-400">Statement Date: <span className="font-bold text-slate-900">{formatDate(new Date().toISOString())}</span></p>
                <p className="text-slate-400 mt-1">Customer Ref: <span className="font-mono font-bold text-blue-600">{customer.id}</span></p>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 font-bold uppercase block mb-1">To:</span>
              <p className="font-bold text-base text-slate-900">{customer.name}</p>
              <p className="text-slate-600">{customer.address}</p>
              <p className="text-slate-600">{customer.email}</p>
            </div>

            {/* Statement Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[600px]">
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
                  {statementWithBalance.map((line, idx) => (
                    <tr key={idx}>
                      <td className="p-3">{formatDate(line.date)}</td>
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Closing Balance */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <div className="p-4 bg-slate-900 text-white rounded-xl text-right min-w-[240px]">
                <span className="text-xs uppercase tracking-wider text-slate-300 font-bold block">
                  Total Closing Balance Due
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {formatCurrency(customer.outstandingBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helper Modals */}
      <CustomerFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editCustomer={customer}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        targetInvoice={{ customerId: customer.id, customerName: customer.name, balanceDue: customer.outstandingBalance }}
      />
    </div>
  );
};
