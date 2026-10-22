import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Eye,
  Trash2,
  FileSpreadsheet,
  Truck,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { exportToCSV } from '../../utils/exportUtils';
import { useApp } from '../../context/AppContext';

export const PurchaseTable = ({ onAddPurchase }) => {
  const { purchases, isPurchasesLoading, deletePurchase } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const filtered = purchases.filter((p) => {
    const pNum = p.purchaseNumber || '';
    const sName = p.supplierName || '';
    const sInv = p.supplierInvoiceNo || '';

    const matchesSearch =
      pNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sInv.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const data = filtered.map((p) => ({
      'Purchase #': p.purchaseNumber,
      Supplier: p.supplierName,
      'Supplier Invoice': p.supplierInvoiceNo || '',
      Date: p.date,
      Subtotal: p.subtotal,
      VAT: p.vatAmount,
      Total: p.total,
      Status: p.status,
    }));
    exportToCSV(data, 'purchases_log.csv');
  };

  const handleCancelPurchase = async (purchase) => {
    const targetId = purchase.realId || purchase.id;
    if (!window.confirm(`Are you sure you want to cancel purchase ${purchase.purchaseNumber}?`)) {
      return;
    }
    try {
      setIsCancelling(true);
      await deletePurchase(targetId, false);
      if (selectedPurchase?.id === purchase.id || selectedPurchase?.realId === purchase.realId) {
        setSelectedPurchase(null);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search purchases by supplier, #, bill ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending Bill</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" icon={Download} onClick={handleExport}>
            Export CSV
          </Button>
          <Button size="sm" variant="primary" icon={Plus} onClick={onAddPurchase}>
            Record Purchase
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[750px]">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 whitespace-nowrap">Purchase #</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Supplier</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Date</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Items Summary</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Subtotal</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">VAT</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Total</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-center">Status</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isPurchasesLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-100 rounded w-12 ml-auto"></div></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div></td>
                  <td className="px-4 py-3.5 text-center"><div className="h-4 bg-slate-100 rounded w-14 mx-auto"></div></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-100 rounded w-8 ml-auto"></div></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-12 text-slate-400">
                  <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-600">No purchases found</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {searchQuery ? 'Try adjusting your search filters.' : 'Record your first wholesale produce bill.'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const itemsSummary = p.items && p.items.length
                  ? p.items.map((i) => i.product || i.name).slice(0, 2).join(', ') + (p.items.length > 2 ? ` +${p.items.length - 2} more` : '')
                  : 'Produce batch';

                const isCancelled = p.status === 'Cancelled';

                return (
                  <tr
                    key={p.realId || p.id}
                    className={`hover:bg-blue-50/40 transition-colors ${isCancelled ? 'opacity-60 bg-slate-50/50' : ''}`}
                  >
                    <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {p.purchaseNumber}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                      {p.supplierName}
                      {p.supplierInvoiceNo && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Inv: {p.supplierInvoiceNo}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDate(p.date, { short: true })}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 truncate max-w-[200px]">
                      {itemsSummary}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-700 whitespace-nowrap">
                      {formatCurrency(p.subtotal)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500 whitespace-nowrap">
                      {p.vatAmount > 0 ? formatCurrency(p.vatAmount) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(p.total)}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <Badge
                        variant={isCancelled ? 'neutral' : p.status === 'Paid' ? 'success' : 'warning'}
                        dot
                        size="sm"
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="View Details"
                          onClick={() => setSelectedPurchase(p)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isCancelled && (
                          <button
                            type="button"
                            title="Cancel Purchase"
                            onClick={() => handleCancelPurchase(p)}
                            disabled={isCancelling}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Details View Modal */}
      {selectedPurchase && (
        <Modal
          isOpen={Boolean(selectedPurchase)}
          onClose={() => setSelectedPurchase(null)}
          maxWidth="max-w-2xl"
          title={
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <span>Purchase {selectedPurchase.purchaseNumber}</span>
            </div>
          }
          subtitle={`Supplier: ${selectedPurchase.supplierName} • Date: ${selectedPurchase.date}`}
          footer={
            <div className="flex items-center justify-between w-full">
              {selectedPurchase.status !== 'Cancelled' ? (
                <Button
                  variant="outline"
                  onClick={() => handleCancelPurchase(selectedPurchase)}
                  disabled={isCancelling}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancel Purchase Bill
                </Button>
              ) : (
                <span className="text-xs text-slate-400 italic">Bill has been cancelled</span>
              )}
              <Button variant="primary" onClick={() => setSelectedPurchase(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Header metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Supplier</span>
                <span className="font-bold text-slate-900">{selectedPurchase.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Supplier Invoice #</span>
                <span className="font-semibold text-slate-800">
                  {selectedPurchase.supplierInvoiceNo || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Date</span>
                <span className="font-semibold text-slate-800">{selectedPurchase.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Status</span>
                <Badge
                  variant={selectedPurchase.status === 'Cancelled' ? 'neutral' : selectedPurchase.status === 'Paid' ? 'success' : 'warning'}
                  dot
                  size="sm"
                >
                  {selectedPurchase.status}
                </Badge>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Produce Item</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Cost</th>
                    <th className="px-3 py-2 text-center">VAT</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPurchase.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium text-slate-900">{it.product || it.name}</td>
                      <td className="px-3 py-2 text-center text-slate-600">
                        {it.quantity} {it.unit || ''}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(it.unitCost)}</td>
                      <td className="px-3 py-2 text-center text-slate-500">{it.vatRate || 0}%</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">{formatCurrency(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-end">
              <div className="w-56 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(selectedPurchase.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(selectedPurchase.vatAmount)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1 flex justify-between font-black text-sm text-slate-900">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedPurchase.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
