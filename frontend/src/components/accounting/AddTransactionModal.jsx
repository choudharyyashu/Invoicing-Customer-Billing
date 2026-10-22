import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useApp } from '../../context/AppContext';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

export const AddTransactionModal = ({ isOpen, onClose, defaultType = 'Expense' }) => {
  const { addTransaction, currencySymbol, formatCurrency } = useApp();

  const [type, setType] = useState(defaultType);
  const [category, setCategory] = useState('Logistics & Fuel');
  const [description, setDescription] = useState('');
  const [customerOrSupplier, setCustomerOrSupplier] = useState('');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [netAmount, setNetAmount] = useState('');
  const [vatRate, setVatRate] = useState('20');

  const categories = {
    Income: ['Sales Receipt', 'Delivery Surcharge', 'Interest / Other Income', 'Refund Received'],
    Purchase: ['Wholesale Produce', 'Imported Pantry Goods', 'Packaging Stock', 'Direct Farm Stock'],
    Expense: ['Logistics & Fuel', 'Packaging Supplies', 'Utilities & Cold Storage', 'Vehicle Maintenance', 'Software & Comms', 'Rent & Warehouse', 'Insurance & Legal'],
  };

  const net = parseFloat(netAmount) || 0;
  const vat = (net * (parseFloat(vatRate) || 0)) / 100;
  const gross = net + vat;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || net <= 0) return;

    try {
      await addTransaction({
        type,
        category,
        description,
        customerOrSupplier,
        reference,
        date,
        netAmount: net,
        vatAmount: vat,
        grossAmount: gross,
      });
      onClose();
    } catch {
      // Error handled in AppContext toast
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span>Add Accounting Entry</span>
        </div>
      }
      subtitle="Log direct revenue, wholesale purchases or operational expenses."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={CheckCircle2} onClick={handleSubmit} disabled={!description || net <= 0}>
            Save Entry
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Transaction Type"
            required
            value={type}
            onChange={(e) => {
              const newType = e.target.value;
              setType(newType);
              setCategory(categories[newType][0]);
            }}
            options={[
              { value: 'Income', label: 'Income (Revenue)' },
              { value: 'Purchase', label: 'Purchase (Stock/Produce)' },
              { value: 'Expense', label: 'Operational Expense' },
            ]}
          />

          <Select
            label="Accounting Category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={(categories[type] || []).map((cat) => ({ value: cat, label: cat }))}
          />
        </div>

        <Input
          label="Description / Purpose"
          required
          placeholder="e.g. Fuel for delivery van or Warehouse refrigeration bill"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Vendor / Customer / Entity"
            placeholder="e.g. Shell UK Ltd or British Gas"
            value={customerOrSupplier}
            onChange={(e) => setCustomerOrSupplier(e.target.value)}
          />

          <Input
            label="Reference / Invoice #"
            placeholder="e.g. EXP-88219"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            label={`Net Amount (${currencySymbol})`}
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            value={netAmount}
            onChange={(e) => setNetAmount(e.target.value)}
          />

          <Select
            label="VAT Rate"
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
            options={[
              { value: '0', label: '0% (Zero-rated)' },
              { value: '20', label: '20% (Standard UK)' },
              { value: '5', label: '5% (Reduced)' },
            ]}
          />
        </div>

        {net > 0 && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Net: {formatCurrency(net)} + VAT: {formatCurrency(vat)}
            </span>
            <span className="font-bold text-slate-900 text-sm">
              Total Gross: {formatCurrency(gross)}
            </span>
          </div>
        )}
      </form>
    </Modal>
  );
};
