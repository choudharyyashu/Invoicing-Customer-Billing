import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { PurchaseTable } from '../../components/purchases/PurchaseTable';
import { CreatePurchaseModal } from '../../components/purchases/CreatePurchaseModal';
import { MigrationModal } from '../../components/purchases/MigrationModal';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { Plus, Database, RefreshCw, AlertCircle } from 'lucide-react';

export const Purchases = () => {
  const { purchases, isPurchasesLoading, purchasesError, refreshPurchases } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

  // Check if localStorage contains legacy records
  const hasLocalPurchases = (() => {
    try {
      const saved = localStorage.getItem('lf_purchases');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0;
      }
    } catch {
      return false;
    }
    return false;
  })();

  // Filter out cancelled purchases for active accounting metrics
  const activePurchases = purchases.filter((p) => p.status !== 'Cancelled');
  const totalPurchases = activePurchases.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
  const pendingBills = activePurchases.filter((p) => p.status === 'Pending');
  const pendingAmount = pendingBills.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);

  // Compute real period totals from purchase dates
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const thisWeekAmount = activePurchases.reduce((sum, p) => {
    if (!p.date) return sum;
    const pDate = new Date(p.date);
    return !isNaN(pDate.getTime()) && pDate >= sevenDaysAgo ? sum + (parseFloat(p.total) || 0) : sum;
  }, 0);

  const thisMonthAmount = activePurchases.reduce((sum, p) => {
    if (!p.date) return sum;
    const pDate = new Date(p.date);
    return !isNaN(pDate.getTime()) && pDate >= startOfMonth ? sum + (parseFloat(p.total) || 0) : sum;
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Purchases & Supplier Bills"
        subtitle="Record wholesale produce procurement, supplier invoices, VAT on purchases, and payables."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchasing', href: '/purchases' },
          { label: 'Purchases' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => refreshPurchases()}
              disabled={isPurchasesLoading}
              className={isPurchasesLoading ? 'opacity-70' : ''}
            >
              Refresh
            </Button>
            {hasLocalPurchases && (
              <Button
                variant="outline"
                size="sm"
                icon={Database}
                onClick={() => setIsMigrationModalOpen(true)}
                className="text-blue-700 bg-blue-50/70 border-blue-200 hover:bg-blue-100/70 font-semibold"
              >
                Migrate Local Storage Data
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
              className="font-bold"
            >
              Record Purchase Bill
            </Button>
          </div>
        }
      />

      {/* Error state */}
      {purchasesError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{purchasesError}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => refreshPurchases()}>
            Retry
          </Button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Total Purchases</span>
          <span className="text-base font-bold text-slate-900">{formatCurrency(totalPurchases)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">This Week</span>
          <span className="text-base font-bold text-emerald-600">
            {formatCurrency(thisWeekAmount)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">This Month</span>
          <span className="text-base font-bold text-blue-600">{formatCurrency(thisMonthAmount)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Pending Supplier Bills</span>
          <span className="text-base font-bold text-amber-600">
            {formatCurrency(pendingAmount)} ({pendingBills.length})
          </span>
        </div>
      </div>

      {/* Table */}
      <PurchaseTable onAddPurchase={() => setIsCreateModalOpen(true)} />

      {/* Create Purchase Modal */}
      <CreatePurchaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Migration Modal */}
      <MigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
      />
    </div>
  );
};
