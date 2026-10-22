import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export const RecordPaymentModal = ({ isOpen, onClose, targetInvoice = null }) => {
  const { customers, invoices, recordPayment, currencySymbol, showToast } = useApp();

  const [customerId, setCustomerId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('Bank Transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    setSubmitError(null);
    if (targetInvoice) {
      setCustomerId(targetInvoice.customerId || '');
      setInvoiceId(targetInvoice.id || '');
      setAmount(targetInvoice.balanceDue?.toString() || targetInvoice.total?.toString() || '');
      setReference(`PAY-${targetInvoice.invoiceNumber}`);
    } else {
      setCustomerId(customers[0]?.id || '');
      setInvoiceId('');
      setAmount('');
      setReference(`BACS-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [targetInvoice, customers, isOpen]);

  // Available invoices for selected customer
  const customerInvoices = invoices.filter(
    (i) => i.customerId === customerId && (i.balanceDue > 0 || i.id === invoiceId)
  );

  const handleCustomerChange = (e) => {
    const newCustId = e.target.value;
    setCustomerId(newCustId);
    setSubmitError(null);
    const firstUnpaid = invoices.find((i) => i.customerId === newCustId && i.balanceDue > 0);
    if (firstUnpaid) {
      setInvoiceId(firstUnpaid.id);
      setAmount(firstUnpaid.balanceDue.toString());
    } else {
      setInvoiceId('');
      setAmount('');
    }
  };

  const handleInvoiceChange = (e) => {
    const invId = e.target.value;
    setInvoiceId(invId);
    setSubmitError(null);
    const selectedInv = invoices.find((i) => i.id === invId);
    if (selectedInv) {
      setAmount(selectedInv.balanceDue.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) {
      setSubmitError('Please select a customer.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setSubmitError('Payment amount must be greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await recordPayment({
        customerId,
        invoiceId: invoiceId || undefined,
        amount: numAmount,
        date,
        method,
        reference: reference?.trim() || undefined,
        notes: notes?.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setSubmitError(err.data?.message || err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <span>Record Customer Payment</span>
        </div>
      }
      subtitle="Log customer remittance, update invoice status and reconcile balance"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="success"
            icon={CheckCircle2}
            onClick={handleSubmit}
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
          >
            {isSubmitting ? 'Recording...' : 'Record Payment'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
            {submitError}
          </div>
        )}

        <Select
          label="Customer"
          required
          value={customerId}
          onChange={handleCustomerChange}
          options={customers.map((c) => ({
            value: c.id,
            label: `${c.name} (Outstanding: ${formatCurrency(c.outstandingBalance)})`,
          }))}
        />

        <Select
          label="Apply to Invoice"
          value={invoiceId}
          onChange={handleInvoiceChange}
          placeholder="Apply as generic On Account payment"
          options={customerInvoices.map((inv) => ({
            value: inv.id,
            label: `${inv.invoiceNumber} — Balance: ${formatCurrency(inv.balanceDue)} (Total: ${formatCurrency(inv.total)})`,
          }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={`Payment Amount (${currencySymbol})`}
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />

          <Input
            label="Payment Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Payment Method"
            required
            value={method}
            onChange={(e) => {
              const val = e.target.value;
              setMethod(val);
              if (val === 'Square') {
                showToast('Square POS card terminal integration is currently not implemented.', 'warning');
              }
            }}
            options={[
              { value: 'Bank Transfer', label: 'Bank Transfer (BACS/Faster Pay)' },
              { value: 'Square', label: 'Square POS (Currently Not Implemented)' },
              { value: 'Cash', label: 'Cash on Delivery' },
              { value: 'Cheque', label: 'Cheque' },
              { value: 'Other', label: 'Other' },
            ]}
          />

          <Input
            label="Reference / Transaction ID"
            placeholder="e.g. BACS-88419 or SQ-TXN-129"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>

        <Input
          label="Notes (Optional)"
          placeholder="e.g. Settlement received via Barclays online"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </form>
    </Modal>
  );
};
