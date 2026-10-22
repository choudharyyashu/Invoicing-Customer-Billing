import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { PaymentTable } from '../../components/payments/PaymentTable';
import { RecordPaymentModal } from '../../components/invoices/RecordPaymentModal';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { Plus, CreditCard, Landmark, CheckCircle2 } from 'lucide-react';

export const Payments = () => {
  const { payments, isPaymentsLoading, paymentsError, refreshPayments } = useApp();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  useEffect(() => {
    if (typeof refreshPayments === 'function') {
      refreshPayments();
    }
  }, [refreshPayments]);

  const activePayments = payments.filter((p) => p.status !== 'Void' && p.status !== 'Voided');
  const totalReceived = activePayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const bankTransfersTotal = activePayments
    .filter((p) => p.method === 'Bank Transfer')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const squarePaymentsTotal = activePayments
    .filter((p) => p.method === 'Square')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Payments"
        subtitle="Track customer remittances, Square card transactions, direct bank transfers, and cash settlements."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales', href: '/payments' },
          { label: 'Payments' },
        ]}
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsRecordModalOpen(true)}
          >
            Record Payment
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Total Received</span>
          <span className="text-base font-bold text-slate-900">{formatCurrency(totalReceived)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Bank Transfers (BACS)</span>
          <span className="text-base font-bold text-blue-600">{formatCurrency(bankTransfersTotal)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Square Card Settlements</span>
          <span className="text-base font-bold text-purple-600">{formatCurrency(squarePaymentsTotal)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Total Transactions</span>
          <span className="text-base font-bold text-slate-900">{payments.length} payments</span>
        </div>
      </div>

      {/* Payments Table */}
      <PaymentTable />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
      />
    </div>
  );
};
