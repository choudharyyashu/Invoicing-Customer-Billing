import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, ShoppingCart, CheckCircle2 } from 'lucide-react';

const VAN_OPTIONS = [
  { value: 'van1', label: 'Van 1' },
  { value: 'van2', label: 'Van 2' },
  { value: 'van3', label: 'Van 3' },
];

export const AddDailyOrderModal = ({
  isOpen,
  onClose,
  defaultDate,
  defaultVanId = 'van1',
  defaultCustomerId = '',
  onOrderAdded,
}) => {
  const { customers, products, addDailyOrder, updateCustomer } = useApp();

  const [customerId, setCustomerId] = useState('');
  const [vanId, setVanId] = useState(defaultVanId);
  const [date, setDate] = useState(() => defaultDate || new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([
    {
      productId: products[0]?.id || 'PROD-001',
      name: products[0]?.name || 'Vine Tomatoes',
      quantity: 5,
      unit: products[0]?.unit || 'kg',
    },
  ]);

  // Sync state when modal is opened or defaults change
  useEffect(() => {
    if (isOpen) {
      const initialCustId =
        defaultCustomerId ||
        customers.find((c) => c.vanId === defaultVanId)?.id ||
        customers[0]?.id ||
        '';
      setCustomerId(initialCustId);
      setDate(defaultDate || new Date().toISOString().split('T')[0]);

      // If customer has a specific van, default to it; otherwise defaultVanId
      const custObj = customers.find((c) => c.id === initialCustId);
      setVanId(custObj?.vanId || defaultVanId || 'van1');

      const firstProd = products[0] || { id: 'PROD-001', name: 'Vine Tomatoes', unit: 'kg' };
      setItems([
        {
          productId: firstProd.id,
          name: firstProd.name,
          quantity: 5,
          unit: firstProd.unit || 'kg',
        },
      ]);
    }
  }, [isOpen, defaultDate, defaultVanId, defaultCustomerId, customers, products]);

  const handleCustomerChange = (newCustId) => {
    setCustomerId(newCustId);
    const selected = customers.find((c) => c.id === newCustId);
    if (selected?.vanId) {
      setVanId(selected.vanId);
    }
  };

  const handleAddItem = () => {
    const firstProd = products[0] || { id: 'PROD-001', name: 'Vine Tomatoes', unit: 'kg' };
    setItems((prev) => [
      ...prev,
      { productId: firstProd.id, name: firstProd.name, quantity: 5, unit: firstProd.unit || 'units' },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      if (field === 'productId') {
        const prod = products.find((p) => p.id === value);
        updated[index] = {
          ...updated[index],
          productId: value,
          name: prod?.name || '',
          unit: prod?.unit || 'units',
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: field === 'quantity' ? Math.max(1, parseFloat(value) || 0) : value,
        };
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selCust = customers.find((c) => c.id === customerId);
    if (!selCust || items.length === 0) return;

    // If customer didn't have a van assigned or user explicitly set van, update customer's van
    if (!selCust.vanId || selCust.vanId !== vanId) {
      updateCustomer(selCust.id, { vanId });
    }

    const createdOrder = addDailyOrder({
      customerId,
      customerName: selCust.name,
      vanId,
      date,
      items,
      status: 'Confirmed',
    });

    if (onOrderAdded) {
      onOrderAdded({ order: createdOrder, customerId, vanId });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <span>Add Daily Order</span>
        </div>
      }
      subtitle="Input customer produce requirements for van morning wholesale aggregation."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={CheckCircle2} onClick={handleSubmit}>
            Save Daily Order
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Customer"
            required
            value={customerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
            options={customers.map((c) => {
              const vanLabel = c.vanId ? ` (${c.vanId.toUpperCase()})` : '';
              return { value: c.id, label: `${c.name}${vanLabel}` };
            })}
          />

          <Select
            label="Delivery Van"
            required
            value={vanId}
            onChange={(e) => setVanId(e.target.value)}
            options={VAN_OPTIONS}
          />

          <Input
            label="Order Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Ordered Products
            </label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              icon={Plus}
              onClick={handleAddItem}
              className="text-xs py-1"
            >
              Add Product
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex-1">
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                    className="w-full text-xs font-semibold p-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-full text-xs text-center font-bold p-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <span className="text-xs text-slate-500 font-mono w-14 text-center">
                  {item.unit}
                </span>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};
