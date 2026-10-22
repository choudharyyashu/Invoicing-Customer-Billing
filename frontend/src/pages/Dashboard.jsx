import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AlertCircle,
  CreditCard,
  Truck,
  Percent,
  Plus,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/dashboard/StatCard';
import { SalesChart } from '../components/dashboard/SalesChart';
import { OutstandingSummary } from '../components/dashboard/OutstandingSummary';
import { RecentInvoices } from '../components/dashboard/RecentInvoices';
import { TodayOrdersWidget } from '../components/dashboard/TodayOrdersWidget';
import { formatCurrency } from '../utils/formatCurrency';
import { useApp } from '../context/AppContext';
import { RecordPaymentModal } from '../components/invoices/RecordPaymentModal';
import { AIInvoiceModal } from '../components/invoices/AIInvoiceModal';

export const Dashboard = () => {
  const {
    invoices,
    customers,
    payments,
    purchases,
    isInvoicesLoading,
    isPaymentsLoading,
    isCustomersLoading,
    invoicesError,
    paymentsError,
    customersError,
    refreshInvoices,
    refreshPayments,
    refreshCustomers,
  } = useApp();
  const navigate = useNavigate();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // 1. Total Sales: Sum of recognized sales invoices (excluding Draft and Void) from real MySQL database
  const recognizedInvoices = invoices.filter((i) => {
    const s = (i.status || '').trim().toLowerCase();
    return s !== 'draft' && s !== 'void';
  });
  const totalSales = recognizedInvoices.reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);

  // 2. Outstanding Balance: Sum of balanceDue on active recognized invoices from real MySQL database
  const totalOutstanding = recognizedInvoices.reduce((sum, i) => sum + (parseFloat(i.balanceDue) || 0), 0);
  const customersWithOutstandingCount = customers.filter(
    (c) => (parseFloat(c.outstandingBalance) || 0) > 0
  ).length;

  // 3. Payments Received: Sum of all non-void payments from real MySQL database
  const activePayments = payments.filter((p) => p.status !== 'Void' && p.status !== 'Voided');
  const totalPaymentsReceived = activePayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  // 4. Purchases: Live API & MySQL procurement data
  const activePurchases = purchases.filter((p) => p.status !== 'Cancelled');
  const totalPurchasesAmount = activePurchases.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
  const totalPurchaseVat = activePurchases.reduce((sum, p) => sum + (parseFloat(p.vatAmount) || 0), 0);
  const totalInvoiceVat = recognizedInvoices.reduce((sum, i) => sum + (parseFloat(i.vatAmount) || 0), 0);
  const vatDue = Math.max(0, totalInvoiceVat - totalPurchaseVat);

  const hasApiError = Boolean(invoicesError || paymentsError || customersError);

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Good morning, Fresh Harvest 👋"
        subtitle="Here's what's happening with your business today across invoicing, procurement, and balances."
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={() => setIsAIModalOpen(true)}
              className="flex-1 sm:flex-none text-blue-700 bg-blue-50/60 hover:bg-blue-100/80 border-blue-200 text-xs py-2"
            >
              AI Assistant
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={CreditCard}
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex-1 sm:flex-none text-xs py-2"
            >
              Payment
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/invoices/create')}
              className="w-full sm:w-auto text-xs py-2 font-bold"
            >
              Create Invoice
            </Button>
          </div>
        }
      />

      {/* API Error Alert Banner */}
      {hasApiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>
              Failed to load live data:{' '}
              {[invoicesError, paymentsError, customersError].filter(Boolean).join(' • ')}
            </span>
          </div>
          <button
            onClick={() => {
              if (invoicesError) refreshInvoices();
              if (paymentsError) refreshPayments();
              if (customersError) refreshCustomers();
            }}
            className="text-xs font-bold text-red-700 hover:text-red-900 underline ml-2 cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Top 5 KPI Cards - Responsive 2-col on mobile, 3-col on tablet, 5-col on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Sales (Live MySQL Database) */}
        <StatCard
          icon={TrendingUp}
          label="Total Sales"
          value={isInvoicesLoading && invoices.length === 0 ? 'Loading...' : formatCurrency(totalSales)}
          change={recognizedInvoices.length > 0 ? `${recognizedInvoices.length} issued` : 'No invoices'}
          changeType={totalSales > 0 ? 'positive' : 'neutral'}
          subtitle="live database"
          iconColor="bg-blue-50 text-blue-600 border-blue-100"
          onClick={() => navigate('/invoices')}
        />

        {/* Outstanding (Live MySQL Database) */}
        <StatCard
          icon={AlertCircle}
          label="Outstanding"
          value={isInvoicesLoading && invoices.length === 0 ? 'Loading...' : formatCurrency(totalOutstanding)}
          change={`${customersWithOutstandingCount} ${customersWithOutstandingCount === 1 ? 'client' : 'clients'}`}
          changeType={totalOutstanding > 0 ? 'negative' : 'positive'}
          subtitle={totalOutstanding > 0 ? 'pending collection' : 'all settled'}
          iconColor="bg-amber-50 text-amber-600 border-amber-100"
          onClick={() => navigate('/invoices')}
        />

        {/* Payments Received (Live MySQL Database) */}
        <StatCard
          icon={CreditCard}
          label="Payments"
          value={isPaymentsLoading && payments.length === 0 ? 'Loading...' : formatCurrency(totalPaymentsReceived)}
          change={activePayments.length > 0 ? `${activePayments.length} recorded` : '0 payments'}
          changeType={totalPaymentsReceived > 0 ? 'positive' : 'neutral'}
          subtitle="live receipts"
          iconColor="bg-emerald-50 text-emerald-600 border-emerald-100"
          onClick={() => navigate('/payments')}
        />

        {/* Purchases (Live API & MySQL) */}
        <StatCard
          icon={Truck}
          label="Purchases"
          value={formatCurrency(totalPurchasesAmount)}
          change={activePurchases.length > 0 ? `${activePurchases.length} bills` : '0 bills'}
          changeType="neutral"
          subtitle="live procurement"
          iconColor="bg-purple-50 text-purple-600 border-purple-100"
          onClick={() => navigate('/purchases')}
        />

        {/* VAT Liability */}
        <StatCard
          icon={Percent}
          label="VAT Liability"
          value={formatCurrency(vatDue)}
          change={vatDue > 0 ? 'Net Due' : 'Zero Due'}
          changeType={vatDue > 0 ? 'negative' : 'positive'}
          subtitle="output minus input VAT"
          iconColor="bg-rose-50 text-rose-600 border-rose-100"
          className="col-span-2 sm:col-span-1"
          onClick={() => navigate('/accounting/vat')}
        />
      </div>

      {/* Main Charts & Aging Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <SalesChart invoices={recognizedInvoices} purchases={purchases} />
        </div>
        <div>
          <OutstandingSummary />
        </div>
      </div>

      {/* Second Row: Recent Invoices & Today's Orders Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <RecentInvoices />
        </div>
        <div>
          <TodayOrdersWidget />
        </div>
      </div>

      {/* Modals */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      <AIInvoiceModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onApplyExtracted={(data) => {
          navigate('/invoices/create', { state: { initialData: data } });
        }}
      />
    </div>
  );
};
