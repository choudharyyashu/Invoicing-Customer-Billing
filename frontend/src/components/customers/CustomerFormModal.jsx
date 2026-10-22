import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useApp } from '../../context/AppContext';
import { Users, CheckCircle2, Info } from 'lucide-react';

export const CustomerFormModal = ({ isOpen, onClose, editCustomer = null }) => {
  const { addCustomer, updateCustomer, vans = [], currencySymbol } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    vatNumber: '',
    paymentTerms: 14,
    openingBalance: '',
    vanId: '',
    notes: '',
  });

  const [openingBalanceError, setOpeningBalanceError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (editCustomer) {
      setFormData({
        name: editCustomer.name || '',
        contactPerson: editCustomer.contactPerson || '',
        email: editCustomer.email || '',
        phone: editCustomer.phone || '',
        address: editCustomer.address || '',
        vatNumber: editCustomer.vatNumber || '',
        paymentTerms: editCustomer.paymentTerms || 14,
        vanId: editCustomer.vanId || '',
        openingBalance:
          editCustomer.openingBalance !== undefined && editCustomer.openingBalance > 0
            ? String(editCustomer.openingBalance)
            : '',
        notes: editCustomer.notes || '',
      });
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        vatNumber: '',
        paymentTerms: 14,
        vanId: '',
        openingBalance: '',
        notes: '',
      });
    }
    setOpeningBalanceError('');
    setServerError('');
  }, [editCustomer, isOpen]);

  const handleOpeningBalanceChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, openingBalance: val }));
    if (val !== '' && (isNaN(parseFloat(val)) || parseFloat(val) < 0)) {
      setOpeningBalanceError('Must be a positive number or zero');
    } else {
      setOpeningBalanceError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (openingBalanceError || isSubmitting) return;

    const parsedOpening =
      formData.openingBalance !== '' ? Math.max(0, parseFloat(formData.openingBalance) || 0) : 0;
    const payload = {
      ...formData,
      openingBalance: parsedOpening,
      vanId: formData.vanId || null,
      email: formData.email?.trim() || null,
      phone: formData.phone?.trim() || null,
      address: formData.address?.trim() || null,
      vatNumber: formData.vatNumber?.trim() || null,
      notes: formData.notes?.trim() || null,
    };

    try {
      setIsSubmitting(true);
      setServerError('');
      if (editCustomer) {
        await updateCustomer(editCustomer.id, payload);
      } else {
        await addCustomer(payload);
      }
      onClose();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to save customer details.';
      setServerError(msg);
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
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <span>{editCustomer ? 'Edit Customer' : 'Add New Customer'}</span>
        </div>
      }
      subtitle="Enter client contact, billing address and default payment terms."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={CheckCircle2}
            onClick={handleSubmit}
            disabled={!formData.name.trim() || !!openingBalanceError || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : editCustomer ? 'Save Changes' : 'Create Customer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{serverError}</span>
          </div>
        )}
        <Input
          label="Customer / Business Name"
          required
          placeholder="e.g. Green Valley Restaurant"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Person"
            placeholder="e.g. David Miller"
            value={formData.contactPerson}
            onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. accounts@greenvalley.co.uk"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            placeholder="e.g. +44 20 7946 0912"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <Input
            label="VAT Number (Optional)"
            placeholder="e.g. GB 923 8812 04"
            value={formData.vatNumber}
            onChange={(e) => setFormData((prev) => ({ ...prev, vatNumber: e.target.value }))}
          />
        </div>

        <Input
          label="Billing / Delivery Address"
          placeholder="e.g. 14 Highfield Avenue, London, NW11 9PX"
          value={formData.address}
          onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Payment Terms"
            value={formData.paymentTerms}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, paymentTerms: parseInt(e.target.value, 10) }))
            }
            options={[
              { value: 7, label: '7 Days Net' },
              { value: 14, label: '14 Days Net (Standard)' },
              { value: 30, label: '30 Days Net' },
              { value: 0, label: 'Due Upon Receipt' },
            ]}
          />
          <Select
            label="Assigned Delivery Van"
            value={formData.vanId || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, vanId: e.target.value }))}
            options={[
              { value: '', label: 'Unassigned (No specific van)' },
              ...(vans && vans.length > 0
                ? vans.map((v) => ({
                    value: v.id,
                    label: `${v.name}${v.vehicle ? ` (${v.vehicle})` : ''}`,
                  }))
                : [
                    { value: 'van1', label: 'Van 1' },
                    { value: 'van2', label: 'Van 2' },
                    { value: 'van3', label: 'Van 3' },
                  ]),
            ]}
          />
        </div>

        <Input
          label="Notes / Delivery Instructions"
          placeholder="e.g. Morning delivery before 8:30 AM"
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
        />

        {/* Opening Balance section */}
        <div className="border-t border-slate-100 pt-4 space-y-2">
          <Input
            label={
              editCustomer
                ? `Opening Balance (${currencySymbol}) — Adjust Existing Debt`
                : `Opening Balance (${currencySymbol}) — Pre-existing Outstanding Amount`
            }
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00  (leave blank if starting fresh)"
            value={formData.openingBalance}
            onChange={handleOpeningBalanceChange}
            error={openingBalanceError}
            helperText={
              editCustomer
                ? 'Updating this adjusts the outstanding balance by the difference from the saved value.'
                : 'Amount owed before their first invoice in this system (e.g. migrated from another ledger).'
            }
          />
          {!editCustomer && (
            <div className="flex items-start gap-1.5 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
              <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-700 leading-relaxed">
                This is <strong>not</strong> an invoice — it is a carried-forward opening balance only.
                It will show on the customer ledger and be included in their total outstanding amount.
              </p>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
