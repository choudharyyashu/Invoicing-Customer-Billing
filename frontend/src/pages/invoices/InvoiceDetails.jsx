import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Printer,
  CreditCard,
  Copy,
  Trash2,
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { InvoicePreview } from '../../components/invoices/InvoicePreview';
import { RecordPaymentModal } from '../../components/invoices/RecordPaymentModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useApp } from '../../context/AppContext';
import { triggerPrint } from '../../utils/exportUtils';
import { invoiceApi } from '../../services/api';

const normalizeInvoice = (data) => ({
  ...data,
  customerName: data.customer?.name || data.customerName || 'Customer',
  customerEmail: data.customer?.email || data.customerEmail || '',
  customerAddress: data.customer?.address || data.customerAddress || '',
  subtotal: parseFloat(data.subtotal) || 0,
  vatAmount: parseFloat(data.vatAmount) || 0,
  discountAmount: parseFloat(data.discountAmount) || 0,
  total: parseFloat(data.total) || 0,
  amountPaid: parseFloat(data.amountPaid) || 0,
  balanceDue: parseFloat(data.balanceDue) || 0,
  items: (data.items || []).map((it) => ({
    ...it,
    rate: parseFloat(it.unitPrice ?? it.rate) || 0,
    unitPrice: parseFloat(it.unitPrice ?? it.rate) || 0,
    amount: parseFloat(it.total ?? it.subtotal ?? it.amount ?? ((parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice ?? it.rate) || 0))) || 0,
  })),
});

export const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    invoices,
    businessSettings,
    duplicateInvoice,
    deleteInvoice,
    finalizeInvoice,
    voidInvoice,
    triggerWhatsAppAction,
  } = useApp();

  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setLoadError(null);
      const res = await invoiceApi.getById(id);
      if (res?.data) {
        setInvoice(normalizeInvoice(res.data));
      }
    } catch (err) {
      console.warn('Failed to load invoice from API, checking context cache:', err);
      // Fallback to context invoice if already loaded
      const cached = invoices.find((i) => i.id === id || i.invoiceNumber === id);
      if (cached) {
        setInvoice(cached);
      } else {
        setLoadError(err.data?.message || err.message || 'Invoice not found');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, invoices]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Loading invoice details...</span>
      </div>
    );
  }

  if (loadError || !invoice) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">Invoice not found</h2>
        <p className="text-xs text-slate-500 mt-1">{loadError || 'The requested invoice could not be located.'}</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/invoices')}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteInvoice(invoice.id);
      navigate('/invoices');
    } catch (_) {
      // Toast handled by context
    }
  };

  const handleFinalize = async () => {
    try {
      setIsFinalizing(true);
      const updated = await finalizeInvoice(invoice.id);
      if (updated) {
        setInvoice(normalizeInvoice(updated));
      }
    } catch (_) {
      // Toast handled by context
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleVoid = async () => {
    const reason = window.prompt(`Enter reason for voiding invoice ${invoice.invoiceNumber}:`);
    if (reason && reason.trim()) {
      try {
        const updated = await voidInvoice(invoice.id, reason.trim());
        if (updated) {
          setInvoice(normalizeInvoice(updated));
        }
      } catch (_) {
        // Toast handled by context
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={invoice.invoiceNumber}
        subtitle={`Issued to ${invoice.customerName} on ${invoice.issueDate}`}
        breadcrumbs={[
          { label: 'Invoices', href: '/invoices' },
          { label: invoice.invoiceNumber },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 no-print">
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate('/invoices')}
            >
              Back
            </Button>
            <Button
              variant="outline"
              icon={MessageSquare}
              onClick={() =>
                triggerWhatsAppAction('Invoice Link', { recipient: invoice.customerName })
              }
            >
              Send WhatsApp
            </Button>
            <Button
              variant="outline"
              icon={Copy}
              onClick={async () => {
                const clone = await duplicateInvoice(invoice.id);
                if (clone) navigate(`/invoices/${clone.id}`);
              }}
            >
              Duplicate
            </Button>
            <Button
              variant="outline"
              icon={Printer}
              onClick={triggerPrint}
            >
              Print / Save PDF
            </Button>

            {/* Finalize action for draft invoices */}
            {invoice.status === 'Draft' && (
              <Button
                variant="primary"
                icon={CheckCircle2}
                disabled={isFinalizing}
                onClick={handleFinalize}
              >
                {isFinalizing ? 'Finalizing...' : 'Finalize & Issue'}
              </Button>
            )}

            {/* Record Payment action for unpaid active invoices */}
            {invoice.balanceDue > 0 && invoice.status !== 'Draft' && invoice.status !== 'Void' && (
              <Button
                variant="success"
                icon={CreditCard}
                onClick={() => setIsPaymentModalOpen(true)}
              >
                Record Payment
              </Button>
            )}

            {/* Void action for issued/active invoices */}
            {invoice.status !== 'Draft' && invoice.status !== 'Void' && (
              <Button
                variant="outline"
                icon={AlertTriangle}
                className="text-amber-700 border-amber-200 hover:bg-amber-50"
                onClick={handleVoid}
              >
                Void Invoice
              </Button>
            )}

            {/* Delete only allowed for Draft invoices */}
            {invoice.status === 'Draft' && (
              <Button
                variant="ghost"
                icon={Trash2}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete
              </Button>
            )}
          </div>
        }
      />

      {/* Invoice Document Preview */}
      <div className="py-2">
        <InvoicePreview invoice={invoice} businessSettings={businessSettings} />
      </div>

      {/* Modals */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          fetchInvoice();
        }}
        targetInvoice={invoice}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete draft ${invoice.invoiceNumber}?`}
        message="This will permanently delete this draft invoice from the database."
      />
    </div>
  );
};
