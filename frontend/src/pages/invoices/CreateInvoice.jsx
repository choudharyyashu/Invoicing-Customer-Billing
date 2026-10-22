import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Eye,
  Sparkles,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { InvoicePreview } from '../../components/invoices/InvoicePreview';
import { CustomerFormModal } from '../../components/customers/CustomerFormModal';
import { AIInvoiceModal } from '../../components/invoices/AIInvoiceModal';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { addDays, getTodayDateString } from '../../utils/formatDate';

export const CreateInvoice = () => {
  const { customers, products, businessSettings, createInvoice, currencySymbol } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialCustomerId = queryParams.get('customer') || customers[0]?.id || '';
  const passedInitialData = location.state?.initialData;

  const [activeView, setActiveView] = useState('editor'); // 'editor' | 'preview'
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Form State
  const nextNumber = `${businessSettings.invoicePrefix || 'INV-2026-'}${String(businessSettings.nextInvoiceNumber || 90).padStart(3, '0')}`;
  const invoiceNumber = nextNumber;
  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [issueDate, setIssueDate] = useState(getTodayDateString());
  const [dueDate, setDueDate] = useState(addDays(getTodayDateString(), 14));
  const [reference, setReference] = useState(`PO-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState(businessSettings.notesFooter || '');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [amountPaid, setAmountPaid] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');

  const [items, setItems] = useState([
    {
      id: '1',
      description: 'Vine Tomatoes',
      quantity: 20,
      unit: 'kg',
      rate: 3.20,
      vatRate: 0,
      amount: 64.00,
    },
    {
      id: '2',
      description: 'King Edward Potatoes',
      quantity: 50,
      unit: 'kg',
      rate: 1.45,
      vatRate: 0,
      amount: 72.50,
    },
  ]);

  const [linkedOrderId, setLinkedOrderId] = useState(null);

  useEffect(() => {
    if (passedInitialData) {
      if (passedInitialData.orderId) setLinkedOrderId(passedInitialData.orderId);
      if (passedInitialData.customer) setCustomerId(passedInitialData.customer.id);
      if (passedInitialData.items && passedInitialData.items.length) setItems(passedInitialData.items);
      if (passedInitialData.reference) setReference(passedInitialData.reference);
    }
  }, [passedInitialData]);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleAddItem = () => {
    const firstProd = products[0] || { name: 'New Item', defaultRate: 2.50, defaultVat: 0, unit: 'units' };
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: firstProd.name,
        quantity: 10,
        unit: firstProd.unit || 'units',
        rate: firstProd.defaultRate || 2.50,
        vatRate: firstProd.defaultVat || 0,
        amount: parseFloat(((10) * (firstProd.defaultRate || 2.50)).toFixed(2)),
      },
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };

        if (field === 'description') {
          const matchProd = products.find((p) => p.name === value);
          if (matchProd) {
            updated.unit = matchProd.unit;
            updated.rate = matchProd.defaultRate;
            updated.vatRate = matchProd.defaultVat;
          }
        }

        const q = field === 'quantity' ? parseFloat(value) || 0 : updated.quantity;
        const r = field === 'rate' ? parseFloat(value) || 0 : updated.rate;
        updated.amount = parseFloat((q * r).toFixed(2));

        return updated;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const vatAmount = items.reduce((sum, item) => {
    const rate = parseFloat(item.vatRate) || 0;
    return sum + ((parseFloat(item.amount) || 0) * (rate / 100));
  }, 0);
  const discount = parseFloat(discountAmount) || 0;
  const grandTotal = Math.max(0, subtotal + vatAmount - discount);
  const paid = parseFloat(amountPaid) || 0;
  const balanceDue = Math.max(0, grandTotal - paid);

  const previewInvoiceData = {
    invoiceNumber,
    customerId,
    customerName: selectedCustomer?.name || 'Customer Name',
    customerEmail: selectedCustomer?.email || 'accounts@client.com',
    customerAddress: selectedCustomer?.address || '123 Business Street, London',
    issueDate,
    dueDate,
    reference,
    items,
    subtotal,
    vatAmount,
    discountAmount: discount,
    total: grandTotal,
    amountPaid: paid,
    balanceDue,
    status: balanceDue === 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Sent',
    notes,
  };

  const handleSaveInvoice = async (status = 'Sent') => {
    if (!selectedCustomer) {
      setSubmitError('Please select a customer for this invoice.');
      return;
    }
    if (!items || items.length === 0) {
      setSubmitError('Invoice must contain at least one line item.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await createInvoice({
        customerId: selectedCustomer.id,
        issueDate,
        dueDate,
        reference,
        status,
        items,
        discountAmount: discount,
        amountPaid: paid,
        paymentMethod,
        notes,
        orderId: linkedOrderId,
      });
      navigate('/invoices');
    } catch (err) {
      setSubmitError(err.data?.message || err.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      <PageHeader
        title="Create Invoice"
        subtitle="Generate itemized tax invoice with automatic product rates, VAT, and balance tracking."
        breadcrumbs={[
          { label: 'Invoices', href: '/invoices' },
          { label: 'Create New' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={() => setIsAIModalOpen(true)}
              className="flex-1 sm:flex-none text-blue-700 bg-blue-50/60 hover:bg-blue-100/80 border-blue-200 text-xs py-2"
            >
              Paste Order to AI
            </Button>
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold text-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setActiveView('editor')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeView === 'editor' ? 'bg-white shadow-2xs text-blue-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeView === 'preview' ? 'bg-white shadow-2xs text-blue-600 font-bold' : 'hover:text-slate-900'
                }`}
              >
                Preview
              </button>
            </div>
          </div>
        }
      />

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <span>{submitError}</span>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-red-500 hover:text-red-800 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {activeView === 'preview' ? (
        <div className="space-y-4">
          <InvoicePreview invoice={previewInvoiceData} businessSettings={businessSettings} />
          <div className="flex flex-col sm:flex-row justify-end gap-2.5 sm:gap-3 max-w-3xl mx-auto pt-4">
            <Button variant="outline" onClick={() => setActiveView('editor')} className="w-full sm:w-auto">
              Back to Edit Form
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={() => handleSaveInvoice('Sent')}
              disabled={isSubmitting}
              className="w-full sm:w-auto font-bold"
            >
              {isSubmitting ? 'Creating...' : 'Create & Issue Invoice'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Main Invoice Editor Form */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Section 1: Customer */}
            <Card padding="p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Customer & Billing
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Plus}
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="text-xs py-1"
                >
                  + New Customer
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Select
                  label="Select Customer"
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  options={customers.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${formatCurrency(c.outstandingBalance)} balance)`,
                  }))}
                />

                <Input
                  label="Customer Email"
                  type="email"
                  disabled
                  value={selectedCustomer?.email || '—'}
                />
              </div>

              {selectedCustomer && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 text-slate-600">
                  <span className="truncate">Address: {selectedCustomer.address}</span>
                  <span className="font-semibold text-slate-800 shrink-0">
                    Terms: {selectedCustomer.paymentTerms || 14} Days
                  </span>
                </div>
              )}
            </Card>

            {/* Section 2: Invoice Details */}
            <Card padding="p-4 sm:p-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 mb-4 border-b border-slate-100">
                2. Invoice Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Input
                  label="Invoice Number"
                  disabled
                  value="Auto-generated (e.g. INV-2026-XXX)"
                />

                <Input
                  label="Issue Date"
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => {
                    setIssueDate(e.target.value);
                    setDueDate(addDays(e.target.value, selectedCustomer?.paymentTerms || 14));
                  }}
                />

                <Input
                  label="Due Date"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />

                <Input
                  label="Reference / PO"
                  placeholder="e.g. PO-9912"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
            </Card>

            {/* Section 3: Line Items */}
            <Card padding="p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  3. Line Items & Produce
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Plus}
                  onClick={handleAddItem}
                  className="text-xs py-1"
                >
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center"
                  >
                    {/* Item Description */}
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 sm:hidden">
                        Product / Description
                      </label>
                      <input
                        type="text"
                        list={`prod-list-${idx}`}
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Product description"
                        className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-300 bg-white"
                      />
                      <datalist id={`prod-list-${idx}`}>
                        {products.map((p) => (
                          <option key={p.id} value={p.name} />
                        ))}
                      </datalist>
                    </div>

                    {/* Numeric inputs grid on mobile */}
                    <div className="grid grid-cols-4 gap-2 sm:contents">
                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 sm:hidden">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="w-full text-xs text-center font-bold p-2 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>

                      {/* Unit */}
                      <div className="sm:col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 sm:hidden">Unit</label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                          placeholder="kg"
                          className="w-full text-xs text-center p-2 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>

                      {/* Rate */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 sm:hidden">Rate ({currencySymbol})</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                          className="w-full text-xs text-right font-medium p-2 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>

                      {/* VAT */}
                      <div className="sm:col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 sm:hidden">VAT</label>
                        <select
                          value={item.vatRate}
                          onChange={(e) => handleItemChange(item.id, 'vatRate', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="0">0%</option>
                          <option value="20">20%</option>
                        </select>
                      </div>
                    </div>

                    {/* Amount & Delete */}
                    <div className="flex items-center justify-between sm:contents pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      <div className="sm:col-span-1 text-right font-black text-xs text-slate-900">
                        <span className="sm:hidden text-slate-400 font-normal mr-1">Total:</span>
                        {formatCurrency(item.amount)}
                      </div>

                      <div className="sm:col-span-1 text-right">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notes & Terms */}
            <Card padding="p-4 sm:p-5">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Invoice Notes & Payment Instructions
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment instructions, remittance details, etc."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </Card>
          </div>

          {/* Right Summary Sidebar */}
          <div>
            <Card padding="p-4 sm:p-5" className="sticky top-20">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 mb-4 border-b border-slate-100">
                Payment Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Net):</span>
                  <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>VAT Amount:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(vatAmount)}</span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <span className="text-slate-600">Discount ({currencySymbol}):</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="w-24 text-right text-xs p-1.5 rounded-md border border-slate-200"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-600">Initial Paid ({currencySymbol}):</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={grandTotal}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-24 text-right text-xs p-1.5 rounded-md border border-slate-200 font-semibold text-emerald-700"
                    />
                  </div>

                  {paid > 0 && (
                    <Select
                      label="Payment Method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      options={[
                        { value: 'Bank Transfer', label: 'Bank Transfer' },
                        { value: 'Square', label: 'Square' },
                        { value: 'Cash', label: 'Cash' },
                      ]}
                    />
                  )}

                  <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 flex justify-between items-center font-bold text-blue-950">
                    <span>Balance Due:</span>
                    <span className="text-sm">{formatCurrency(balanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 sm:mt-6 space-y-2">
                <Button
                  variant="primary"
                  icon={CheckCircle2}
                  className="w-full font-bold py-2.5"
                  disabled={isSubmitting}
                  onClick={() => handleSaveInvoice('Sent')}
                >
                  {isSubmitting ? 'Creating Invoice...' : 'Create & Send Invoice'}
                </Button>

                <Button
                  variant="outline"
                  icon={Eye}
                  className="w-full py-2.5"
                  onClick={() => setActiveView('preview')}
                >
                  Preview Invoice
                </Button>

                <Button
                  variant="ghost"
                  icon={Save}
                  className="w-full text-slate-500 py-2"
                  disabled={isSubmitting}
                  onClick={() => handleSaveInvoice('Draft')}
                >
                  {isSubmitting ? 'Saving...' : 'Save as Draft'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Helper Modals */}
      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />

      <AIInvoiceModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onApplyExtracted={(data) => {
          if (data.customer) setCustomerId(data.customer.id);
          if (data.items) setItems(data.items);
          if (data.reference) setReference(data.reference);
        }}
      />
    </div>
  );
};
