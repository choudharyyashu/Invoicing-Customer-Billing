import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { Plus, Trash2, Truck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const CreatePurchaseModal = ({ isOpen, onClose }) => {
  const { products, suppliers, createPurchase, currencySymbol } = useApp();

  const [supplierName, setSupplierName] = useState('');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [items, setItems] = useState([
    { product: 'King Edward Potatoes', quantity: 100, unit: 'kg', unitCost: 0.90, vatRate: 0, total: 90.00 },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { product: products[0]?.name || 'Vine Tomatoes', quantity: 20, unit: 'kg', unitCost: 1.80, vatRate: 0, total: 36.00 },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      const cur = { ...updated[index], [field]: value };

      if (field === 'quantity' || field === 'unitCost') {
        const q = field === 'quantity' ? parseFloat(value) || 0 : cur.quantity;
        const c = field === 'unitCost' ? parseFloat(value) || 0 : cur.unitCost;
        cur.total = parseFloat((q * c).toFixed(2));
      }

      updated[index] = cur;
      return updated;
    });
  };

  const subtotal = parseFloat(
    items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toFixed(2)
  );
  const vatAmount = parseFloat(
    items.reduce((sum, item) => {
      const rate = parseFloat(item.vatRate) || 0;
      return sum + ((parseFloat(item.total) || 0) * (rate / 100));
    }, 0).toFixed(2)
  );
  const grandTotal = parseFloat((subtotal + vatAmount).toFixed(2));

  const handleModalClose = () => {
    if (isSaving) return;
    setFormError(null);
    onClose();
  };

  const handleSubmit = async (finalStatus = 'Paid') => {
    setFormError(null);

    const trimmedSupplier = supplierName.trim();
    if (!trimmedSupplier) {
      setFormError('Supplier / Wholesale market name is required.');
      return;
    }

    if (!items || items.length === 0) {
      setFormError('Please add at least one line item to the purchase bill.');
      return;
    }

    const invalidItem = items.find(
      (it) => !it.product || !it.product.trim() || parseFloat(it.quantity) <= 0 || parseFloat(it.unitCost) < 0
    );
    if (invalidItem) {
      setFormError('Each item must have a valid description, quantity greater than 0, and non-negative cost.');
      return;
    }

    try {
      setIsSaving(true);
      await createPurchase({
        supplierName: trimmedSupplier,
        supplierInvoiceNo: supplierInvoiceNo.trim() || undefined,
        date,
        status: finalStatus,
        items: items.map((it) => ({
          product: it.product.trim(),
          quantity: parseFloat(it.quantity) || 1,
          unit: it.unit || 'units',
          unitCost: parseFloat(it.unitCost) || 0,
          vatRate: parseFloat(it.vatRate) || 0,
        })),
        subtotal,
        vatAmount,
        total: grandTotal,
      });

      // Reset form on success
      setSupplierName('');
      setSupplierInvoiceNo('');
      setDate(new Date().toISOString().split('T')[0]);
      setItems([
        { product: 'King Edward Potatoes', quantity: 100, unit: 'kg', unitCost: 0.90, vatRate: 0, total: 90.00 },
      ]);
      setFormError(null);
      onClose();
    } catch (err) {
      console.error('Error in createPurchase modal:', err);
      const isDuplicate =
        err.status === 409 ||
        err.data?.code === 'DUPLICATE_SUPPLIER_INVOICE' ||
        err.data?.message?.toLowerCase().includes('duplicate');

      if (isDuplicate) {
        setFormError(
          `Duplicate Supplier Invoice: A bill with reference "${supplierInvoiceNo}" for "${trimmedSupplier}" already exists in the system.`
        );
      } else {
        setFormError(err.data?.message || err.message || 'Failed to record purchase bill.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      maxWidth="max-w-3xl"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <span>Record Supplier Purchase Bill</span>
        </div>
      }
      subtitle="Log wholesale market purchases and produce costs for accounting & VAT tracking."
      footer={
        <>
          <Button variant="outline" onClick={handleModalClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit('Pending')}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save as Pending Bill'}
          </Button>
          <Button
            variant="primary"
            icon={isSaving ? Loader2 : CheckCircle2}
            onClick={() => handleSubmit('Paid')}
            disabled={isSaving}
            className={isSaving ? 'opacity-80' : ''}
          >
            {isSaving ? 'Saving to Database...' : 'Save Paid Purchase'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{formError}</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Supplier / Wholesale Market <span className="text-red-500">*</span>
            </label>
            <input
              list="supplier-suggestions"
              placeholder="e.g. Covent Garden Wholesale"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              disabled={isSaving}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
            />
            {suppliers && suppliers.length > 0 && (
              <datalist id="supplier-suggestions">
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Supplier Invoice / Bill #
            </label>
            <input
              placeholder="e.g. CGW-99120"
              value={supplierInvoiceNo}
              onChange={(e) => setSupplierInvoiceNo(e.target.value)}
              disabled={isSaving}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Purchase Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSaving}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Purchased Items & Costs
            </label>
            <Button size="sm" variant="outline" icon={Plus} onClick={handleAddItem} className="text-xs py-1">
              Add Line Item
            </Button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center">
                {/* Description */}
                <div className="sm:col-span-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 sm:hidden">Produce / Item</label>
                  <input
                    type="text"
                    placeholder="Produce / Item description"
                    value={item.product}
                    onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                    className="w-full text-xs font-semibold p-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                {/* Numbers row on mobile */}
                <div className="grid grid-cols-3 gap-2 sm:contents">
                  {/* Quantity */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 sm:hidden">Qty</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full text-xs text-center font-bold p-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  {/* Unit Cost */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 sm:hidden">Unit Cost ({currencySymbol})</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={`Cost ${currencySymbol}`}
                      value={item.unitCost}
                      onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                      className="w-full text-xs text-right font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  {/* VAT */}
                  <div className="sm:col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 sm:hidden">VAT</label>
                    <select
                      value={item.vatRate}
                      onChange={(e) => handleItemChange(idx, 'vatRate', e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="0">0%</option>
                      <option value="20">20%</option>
                    </select>
                  </div>
                </div>

                {/* Amount & Trash */}
                <div className="flex items-center justify-between sm:contents pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                  <div className="sm:col-span-2 text-right font-black text-xs text-slate-900 pr-1">
                    <span className="sm:hidden text-slate-400 font-normal mr-1">Total:</span>
                    {formatCurrency(item.total)}
                  </div>

                  <div className="sm:col-span-1 text-center">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-end">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>VAT:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(vatAmount)}</span>
            </div>
            <div className="border-t border-slate-200 pt-1 flex justify-between font-black text-sm text-slate-900">
              <span>Grand Total:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
