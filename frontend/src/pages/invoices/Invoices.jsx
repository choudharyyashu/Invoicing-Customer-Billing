import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, FileText, CreditCard, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { InvoiceTable } from '../../components/invoices/InvoiceTable';
import { RecordPaymentModal } from '../../components/invoices/RecordPaymentModal';
import { AIInvoiceModal } from '../../components/invoices/AIInvoiceModal';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';

export const Invoices = () => {
  const { invoices, refreshInvoices } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof refreshInvoices === 'function') {
      refreshInvoices();
    }
  }, [refreshInvoices]);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [targetInvoiceForPayment, setTargetInvoiceForPayment] = useState(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const handleOpenPayment = (inv) => {
    setTargetInvoiceForPayment(inv);
    setIsPaymentModalOpen(true);
  };

  // Stat calculations (Active non-void invoices)
  const activeInvoices = invoices.filter((i) => i.status !== 'Void');
  const totalBilled = activeInvoices.reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);
  const totalCollected = invoices.reduce((sum, i) => sum + (parseFloat(i.amountPaid) || 0), 0);
  const totalOutstanding = activeInvoices.reduce((sum, i) => sum + (parseFloat(i.balanceDue) || 0), 0);
  const overdueCount = activeInvoices.filter((i) => i.status === 'Overdue').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Invoices"
        subtitle="Create, manage and track customer billing, payment schedules, and outstanding balances."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales', href: '/invoices' },
          { label: 'Invoices' },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              icon={Sparkles}
              onClick={() => setIsAIModalOpen(true)}
              className="text-blue-700 bg-blue-50/50 hover:bg-blue-100/70 border-blue-200"
            >
              AI Assistant
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/invoices/create')}
            >
              Create Invoice
            </Button>
          </>
        }
      />

      {/* Mini metric bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Total Invoiced</span>
          <span className="text-base font-bold text-slate-900">{formatCurrency(totalBilled)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Paid to Date</span>
          <span className="text-base font-bold text-emerald-600">{formatCurrency(totalCollected)}</span>
        </div>
        <div className="bg-red-50 rounded-lg px-2 py-1.5 -mx-1 border border-red-100">
          <span className="text-red-600 block font-bold uppercase tracking-wide" style={{ fontSize: '10px' }}>Invoice Outstanding</span>
          <span className="text-base font-black text-red-700">{formatCurrency(totalOutstanding)}</span>
          <span className="text-[10px] text-red-400 block mt-0.5">Unpaid &amp; partial invoices only</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Overdue Invoices</span>
          <span className="text-base font-bold text-red-600">{overdueCount} invoices</span>
        </div>
      </div>

      {/* Invoices List & Filters */}
      <InvoiceTable onRecordPayment={handleOpenPayment} />

      {/* Modals */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setTargetInvoiceForPayment(null);
        }}
        targetInvoice={targetInvoiceForPayment}
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
