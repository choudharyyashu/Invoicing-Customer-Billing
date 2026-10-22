import React, { useState, useMemo } from 'react';
import {
  Car,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  BookmarkPlus,
  TrendingUp,
  Fuel,
  Calendar,
  X,
  Info,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const VEHICLE_PRESETS = [
  'Van 1 (Ford Transit - LN72 XRT)',
  'Van 2 (Mercedes Sprinter - RO23 FHK)',
  'Van 3',
  'Car / Company Car',
  'Other',
];

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  vehicle: VEHICLE_PRESETS[0],
  startMileage: '',
  endMileage: '',
  distanceUnit: 'miles',
  purpose: '',
  rate: '0.45',
};

export const MileagePage = () => {
  const { mileages, addMileage, deleteMileage, postMileageToExpenses, currencySymbol } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterVehicle, setFilterVehicle] = useState('All');
  const [mileageError, setMileageError] = useState('');

  // Derived distance
  const derivedDistance = useMemo(() => {
    if (form.startMileage === '' || form.endMileage === '') return 0;
    const start = parseFloat(form.startMileage);
    const end = parseFloat(form.endMileage);
    if (isNaN(start) || isNaN(end)) return 0;
    return end > start ? +(end - start).toFixed(1) : 0;
  }, [form.startMileage, form.endMileage]);

  const derivedExpense = useMemo(() => {
    const rate = parseFloat(form.rate) || 0;
    return +(derivedDistance * rate).toFixed(2);
  }, [derivedDistance, form.rate]);

  // Validate start and end mileage whenever either changes
  const validateMileageInputs = (startVal, endVal) => {
    if (startVal === '' || endVal === '') {
      setMileageError('');
      return false;
    }
    const start = parseFloat(startVal);
    const end = parseFloat(endVal);
    if (isNaN(start) || isNaN(end)) {
      setMileageError('Mileage readings must be valid numbers.');
      return false;
    }
    if (start < 0 || end < 0) {
      setMileageError('Mileage readings cannot be negative.');
      return false;
    }
    if (end <= start) {
      setMileageError('Ending mileage must be strictly greater than starting mileage.');
      return false;
    }
    setMileageError('');
    return true;
  };

  const handleField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'startMileage' || key === 'endMileage') {
        validateMileageInputs(
          key === 'startMileage' ? value : prev.startMileage,
          key === 'endMileage' ? value : prev.endMileage
        );
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.purpose.trim() || !form.vehicle) return;
    
    if (form.startMileage === '' || form.endMileage === '') {
      setMileageError('Both start and end mileage readings are required.');
      return;
    }

    const isValid = validateMileageInputs(form.startMileage, form.endMileage);
    if (!isValid || derivedDistance <= 0) return;

    const res = addMileage({
      ...form,
      startMileage: parseFloat(form.startMileage),
      endMileage: parseFloat(form.endMileage),
      distance: derivedDistance,
      estimatedExpense: derivedExpense,
    });
    if (res) {
      setForm(emptyForm);
      setMileageError('');
      setShowForm(false);
    }
  };

  // Summary stats
  const totalMileage = mileages.reduce((sum, m) => sum + (m.distance || 0), 0);
  const totalExpense = mileages.reduce((sum, m) => sum + (m.estimatedExpense || 0), 0);
  const unpostedCount = mileages.filter((m) => !m.recordedInExpenses).length;

  // Unique vehicles for filter
  const vehicles = ['All', ...new Set(mileages.map((m) => m.vehicle))];

  const filtered = useMemo(() => {
    return filterVehicle === 'All'
      ? mileages
      : mileages.filter((m) => m.vehicle === filterVehicle);
  }, [mileages, filterVehicle]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Mileage & Vehicle Expenses"
        subtitle="Track business mileage per van, calculate HMRC-rate expense claims, and post directly to the accounting ledger."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Daily Purchasing', href: '/orders' },
          { label: 'Mileage & Vehicle' },
        ]}
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? 'Cancel' : 'Log Journey'}
          </Button>
        }
      />

      {/* KPI summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card padding="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Miles Logged</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{totalMileage.toFixed(0)}</span>
          <span className="text-[11px] text-slate-500">across all vans</span>
        </Card>
        <Card padding="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Est. Expense Claim</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">{formatCurrency(totalExpense)}</span>
          <span className="text-[11px] text-slate-500">at HMRC approved rate</span>
        </Card>
        <Card padding="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Records Logged</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{mileages.length}</span>
          <span className="text-[11px] text-slate-500">journeys total</span>
        </Card>
        <Card padding="p-4" className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Unposted to Ledger</span>
          <span className="text-2xl font-black text-amber-700 block mt-1">{unpostedCount}</span>
          <span className="text-[11px] text-amber-600">pending expense post</span>
        </Card>
      </div>

      {/* Add Journey form */}
      {showForm && (
        <Card padding="p-5" className="border-blue-200 bg-blue-50/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-sm text-slate-800">Log New Journey</span>
            </div>
            <button onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleField('date', e.target.value)}
                  className="w-full text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Vehicle</label>
                <select
                  value={form.vehicle}
                  onChange={(e) => handleField('vehicle', e.target.value)}
                  className="w-full text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {VEHICLE_PRESETS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Start Mileage (odometer)"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 42150"
                value={form.startMileage}
                onChange={(e) => handleField('startMileage', e.target.value)}
                error={form.startMileage !== '' && form.endMileage !== '' && mileageError ? true : ''}
              />
              <Input
                label="End Mileage (odometer)"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 42218"
                value={form.endMileage}
                onChange={(e) => handleField('endMileage', e.target.value)}
                error={mileageError}
              />
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Unit</label>
                <select
                  value={form.distanceUnit}
                  onChange={(e) => handleField('distanceUnit', e.target.value)}
                  className="w-full text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="miles">Miles</option>
                  <option value="km">Kilometres (km)</option>
                </select>
              </div>
            </div>

            {mileageError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                ⚠️ {mileageError}
              </div>
            )}

            <Input
              label="Journey Purpose / Description"
              required
              placeholder="e.g. Morning Spitalfields market collection and restaurant deliveries"
              value={form.purpose}
              onChange={(e) => handleField('purpose', e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <Input
                label={`Rate per mile (${currencySymbol})`}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.45"
                value={form.rate}
                onChange={(e) => handleField('rate', e.target.value)}
                helperText="HMRC approved rate for cars/vans: £0.45/mile (first 10k)"
              />
              <Card padding="p-3" className="bg-white border-slate-200">
                <span className="text-[11px] text-slate-500 block">Calculated Distance</span>
                <span className="text-xl font-black text-slate-900">{derivedDistance} <span className="text-sm font-medium text-slate-400">{form.distanceUnit}</span></span>
              </Card>
              <Card padding="p-3" className="bg-emerald-50 border-emerald-200">
                <span className="text-[11px] text-emerald-600 block font-bold">Est. Expense Claim</span>
                <span className="text-xl font-black text-emerald-700">{formatCurrency(derivedExpense)}</span>
              </Card>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-blue-100">
              <Button variant="outline" onClick={() => setShowForm(false)} type="button">Cancel</Button>
              <Button
                variant="primary"
                icon={CheckCircle2}
                type="submit"
                disabled={!form.purpose.trim() || derivedDistance <= 0}
              >
                Save Journey
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Vehicle filter */}
      {vehicles.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {vehicles.map((v) => (
            <button
              key={v}
              onClick={() => setFilterVehicle(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterVehicle === v
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {/* Mileage log table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Car className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">No mileage records yet</p>
            <p className="text-xs text-slate-400 mt-1">Use "Log Journey" to record business mileage</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[800px]">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Date
                </th>
                <th className="px-4 py-3.5">Vehicle</th>
                <th className="px-4 py-3.5">Purpose</th>
                <th className="px-4 py-3.5 text-center">Distance</th>
                <th className="px-4 py-3.5 text-center">Rate</th>
                <th className="px-4 py-3.5 text-center">Est. Claim</th>
                <th className="px-4 py-3.5 text-center">Ledger</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => (
                <tr key={m.id} className={`hover:bg-slate-50 ${!m.recordedInExpenses ? '' : 'bg-emerald-50/30'}`}>
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                    {formatDate(m.date)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">{m.vehicle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-[240px]">
                    <span className="truncate block">{m.purpose}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-black text-slate-900">
                    {m.distance} <span className="text-[11px] font-normal text-slate-400">{m.distanceUnit}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {currencySymbol}{parseFloat(m.rate || 0.45).toFixed(2)}/mi
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-700">
                    {formatCurrency(m.estimatedExpense)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {m.recordedInExpenses ? (
                      <Badge variant="success" size="sm" dot>Posted</Badge>
                    ) : (
                      <Badge variant="warning" size="sm" dot>Pending</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {!m.recordedInExpenses && (
                        <button
                          onClick={() => postMileageToExpenses(m.id)}
                          title="Post to Accounting Ledger"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold"
                        >
                          <BookmarkPlus className="w-3 h-3" /> Post to Ledger
                        </button>
                      )}
                      <button
                        onClick={() => deleteMileage(m.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
        <p>
          HMRC approved mileage rate for cars and vans: <strong>£0.45 per mile</strong> for the first 10,000 miles per tax year.
          Use "Post to Ledger" to add each journey's claim amount to the Accounting ledger as a vehicle expense.
          These figures are estimates only — consult your accountant for formal tax submissions.
        </p>
      </div>
    </div>
  );
};
