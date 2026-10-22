import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useApp } from '../../context/AppContext';
import {
  Building,
  FileText,
  CreditCard,
  MessageSquare,
  Bell,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { getCurrencySymbol, setActiveCurrency } from '../../utils/formatCurrency';

export const Settings = () => {
  const {
    businessSettings,
    setBusinessSettings,
    showToast,
    resetFactoryData,
    exchangeRates,
    refreshExchangeRates,
    isRatesLoading,
    getExchangeRate,
  } = useApp();

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({ ...businessSettings });
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (businessSettings) {
      setFormData({ ...businessSettings });
    }
  }, [businessSettings]);

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: Building },
    { id: 'invoices', label: 'Invoice Settings', icon: FileText },
    { id: 'payments', label: 'Bank & Square POS', icon: CreditCard },
    { id: 'whatsapp', label: 'WhatsApp (Optional)', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    // { id: 'demo', label: 'Demo Data', icon: RotateCcw },
  ];

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      await setBusinessSettings(formData);
    } catch {
      // Toast notifications are already dispatched in AppContext
    }
  };

  const toggleWhatsAppConnection = () => {
    const nextStatus = formData.whatsAppStatus === 'connected' ? 'disconnected' : 'connected';
    const updated = { ...formData, whatsAppStatus: nextStatus };
    setFormData(updated);
    setBusinessSettings(updated);
    showToast(
      nextStatus === 'connected'
        ? 'Mock WhatsApp business number connected!'
        : 'Mock WhatsApp disconnected.',
      'info'
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Settings & Business Preferences"
        subtitle="Manage company information, invoice templates, tax rates, Square terminals, and mock WhatsApp integrations."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' },
        ]}
        actions={
          <Button variant="primary" icon={Save} onClick={handleSave}>
            Save All Changes
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Business Profile */}
      {activeTab === 'profile' && (
        <Card padding="p-6">
          <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Company & Legal Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Registered Business Name"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />

              <Input
                label="Trading Name"
                value={formData.tradingName}
                onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Accounts Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Business Telephone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <Input
              label="Physical / Warehouse Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="UK VAT Registration Number"
                value={formData.vatNumber}
                onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
              />

              <Input
                label="Companies House Number"
                value={formData.companyNumber}
                onChange={(e) => setFormData({ ...formData, companyNumber: e.target.value })}
              />
            </div>

            <div className="pt-3">
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Save Profile
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Invoice Settings */}
      {activeTab === 'invoices' && (
        <Card padding="p-6">
          <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Invoice Prefix & Default Terms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Invoice Prefix"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
              />

              <Input
                label="Next Invoice Sequence #"
                type="number"
                value={formData.nextInvoiceNumber}
                onChange={(e) => setFormData({ ...formData, nextInvoiceNumber: parseInt(e.target.value, 10) || 1 })}
              />

              <Select
                label="Default Payment Terms"
                value={formData.defaultPaymentTerms}
                onChange={(e) => setFormData({ ...formData, defaultPaymentTerms: parseInt(e.target.value, 10) })}
                options={[
                  { value: 7, label: '7 Days Net' },
                  { value: 14, label: '14 Days Net' },
                  { value: 30, label: '30 Days Net' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Default Currency"
                value={formData.currency}
                onChange={(e) => {
                  const newCurr = e.target.value;
                  const newSym = getCurrencySymbol(newCurr);
                  setFormData({ ...formData, currency: newCurr, currencySymbol: newSym });
                  setActiveCurrency(newCurr);
                }}
                options={[
                  { value: 'GBP', label: 'GBP (£) - British Pound' },
                  { value: 'EUR', label: 'EUR (€) - Euro' },
                  { value: 'USD', label: 'USD ($) - US Dollar' },
                ]}
              />

              <Select
                label="Standard VAT Rate"
                value={formData.defaultVatRate}
                onChange={(e) => setFormData({ ...formData, defaultVatRate: parseInt(e.target.value, 10) })}
                options={[
                  { value: 20, label: '20% (UK Standard)' },
                  { value: 0, label: '0% (Produce Zero-Rated)' },
                ]}
              />
            </div>

            {/* Live FX Rates API Card */}
            <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/60 border border-emerald-200/90 rounded-2xl space-y-2.5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950">
                    Live FX Rates Engine (open.er-api.com)
                  </span>
                  <Badge variant="success" size="sm">
                    {exchangeRates ? 'Live API Connected' : 'Auto-Sync Ready'}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await refreshExchangeRates?.(true);
                    showToast('Live FX exchange rates updated from open.er-api.com', 'success');
                  }}
                  disabled={isRatesLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs hover:bg-emerald-50 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRatesLoading ? 'animate-spin' : ''}`} />
                  {isRatesLoading ? 'Syncing...' : 'Sync Live Rates'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100 flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium uppercase">GBP to USD</span>
                  <span className="font-mono font-bold text-emerald-900 mt-0.5">
                    1 GBP = ${getExchangeRate ? getExchangeRate('GBP', 'USD').toFixed(4) : '1.3400'} USD
                  </span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100 flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium uppercase">GBP to EUR</span>
                  <span className="font-mono font-bold text-emerald-900 mt-0.5">
                    1 GBP = €{getExchangeRate ? getExchangeRate('GBP', 'EUR').toFixed(4) : '1.1900'} EUR
                  </span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100 flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium uppercase">Active Selection</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5">
                    100 GBP = {formData.currency === 'USD' ? `$${(100 * (getExchangeRate ? getExchangeRate('GBP', 'USD') : 1.34)).toFixed(2)}` : formData.currency === 'EUR' ? `€${(100 * (getExchangeRate ? getExchangeRate('GBP', 'EUR') : 1.19)).toFixed(2)}` : '£100.00'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-700/90 leading-relaxed">
                Base accounting ledger is maintained in <strong>GBP (£)</strong>. Switching currency automatically recalculates all invoices, customer balances, payments, and financial summaries in real-time according to live open exchange rates.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Invoice Footer Terms & Remittance Notes
              </label>
              <textarea
                rows={4}
                value={formData.notesFooter}
                onChange={(e) => setFormData({ ...formData, notesFooter: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-3">
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Save Invoice Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 3: Payments */}
      {activeTab === 'payments' && (
        <Card padding="p-6">
          <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Direct Bank Transfer Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Bank Name"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />

              <Input
                label="Account Name"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Sort Code"
                value={formData.sortCode}
                onChange={(e) => setFormData({ ...formData, sortCode: e.target.value })}
              />

              <Input
                label="Account Number"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div
                className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => showToast('Square POS card terminal integration is currently not implemented.', 'warning')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-300 text-slate-700 flex items-center justify-center font-bold">
                    SQ
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Square Card Payments</h4>
                    <p className="text-xs text-slate-500">Contactless card terminal & POS sync (Click to test).</p>
                  </div>
                </div>
                <Badge variant="draft" size="sm">Currently Not Implemented</Badge>
              </div>
            </div>

            <div className="pt-3">
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Save Payment Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 4: WhatsApp (Optional) */}
      {activeTab === 'whatsapp' && (
        <Card padding="p-6">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">WhatsApp Messaging</h3>
                  <p className="text-xs text-slate-500">Direct customer invoice & statement delivery.</p>
                </div>
              </div>
              <Badge variant="draft">Currently Not Implemented</Badge>
            </div>

            <div className="p-4 bg-amber-50/90 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-2">
              <p className="font-semibold text-amber-950">
                Notice: WhatsApp messaging integration is currently not implemented.
              </p>
              <p>
                Sending automated WhatsApp messages requires configuring official Meta WhatsApp Business Cloud API or Twilio credentials. Invoices and monthly statements can still be exported and shared manually as PDF files.
              </p>
            </div>

            <Input
              label="Business WhatsApp Number"
              placeholder="+44 7700 900123"
              disabled
              value={formData.whatsAppPhone || '+44 7700 900123'}
              onChange={(e) => setFormData({ ...formData, whatsAppPhone: e.target.value })}
            />

            <div>
              <Button
                variant="outline"
                onClick={() => showToast('WhatsApp integration is currently not implemented.', 'warning')}
              >
                Connect WhatsApp (Currently Not Implemented)
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: Notifications */}
      {activeTab === 'notifications' && (
        <Card padding="p-6">
          <div className="max-w-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Email & System Notification Triggers
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifications?.emailOnInvoiceDue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: { ...formData.notifications, emailOnInvoiceDue: e.target.checked },
                    })
                  }
                  className="rounded text-blue-600"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Overdue Invoice Reminders</span>
                  <span className="text-slate-500">Alert admin when an invoice exceeds payment terms.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifications?.emailOnPayment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: { ...formData.notifications, emailOnPayment: e.target.checked },
                    })
                  }
                  className="rounded text-blue-600"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Payment Receipt Confirmation</span>
                  <span className="text-slate-500">Trigger receipt when payment is recorded on account.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifications?.dailySummary}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: { ...formData.notifications, dailySummary: e.target.checked },
                    })
                  }
                  className="rounded text-blue-600"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Daily Morning Procurement Summary</span>
                  <span className="text-slate-500">Aggregate today's required wholesale produce by 6:00 AM.</span>
                </div>
              </label>
            </div>

            <div className="pt-3">
              <Button variant="primary" icon={CheckCircle2} onClick={handleSave}>
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 6: Demo Data Management (Hidden as requested) */}
      {/* 
      {activeTab === 'demo' && (
        <Card padding="p-6">
          <div className="max-w-2xl space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-red-500" />
                Reset Demo Mock Data
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                Reset the local browser storage to reload all initial sample restaurants (Green Valley, The Fresh Kitchen, Bella Bistro), produce lines, mock invoices, and purchasing aggregations.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800 space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                What happens during factory reset:
              </p>
              <ul className="list-disc list-inside space-y-1 text-amber-700 pl-1">
                <li>Restores default sample customer accounts and orders.</li>
                <li>Restores initial wholesale purchase lists and mock cashflow transactions.</li>
                <li>Restores default company preferences, VAT rates, and invoice settings.</li>
                <li>Refetches live database catalogs from the backend server.</li>
              </ul>
            </div>

            <Button
              variant="danger"
              icon={RotateCcw}
              loading={isResetting}
              disabled={isResetting}
              onClick={() => setIsResetModalOpen(true)}
            >
              Reset to Factory Demo Data
            </Button>
          </div>
        </Card>
      )}

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => !isResetting && setIsResetModalOpen(false)}
        onConfirm={async () => {
          setIsResetting(true);
          try {
            await resetFactoryData();
          } finally {
            setIsResetting(false);
            setIsResetModalOpen(false);
          }
        }}
        loading={isResetting}
        title="Reset to Factory Demo Data?"
        message="This will reset all local browser demo data (sample orders, mock transactions, fulfillment, vehicle mileage, and business preferences) back to factory defaults, and re-sync all live database collections."
        confirmText={isResetting ? 'Resetting Demo Data...' : 'Yes, Reset Everything'}
        confirmVariant="danger"
      />
      */}
    </div>
  );
};
