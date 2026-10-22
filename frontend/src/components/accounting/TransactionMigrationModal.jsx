import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { Database, AlertTriangle, CheckCircle2, X, RefreshCw, ArrowRight } from 'lucide-react';

export const TransactionMigrationModal = ({ isOpen, onClose }) => {
  const { importTransactionsFromLocalStorage, refreshTransactions } = useApp();

  const [isImporting, setIsImporting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);

  if (!isOpen) return null;

  let localTransactions = [];
  try {
    const saved = localStorage.getItem('lf_transactions');
    if (saved) {
      localTransactions = JSON.parse(saved);
      if (!Array.isArray(localTransactions)) localTransactions = [];
    }
  } catch {
    localTransactions = [];
  }

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setResultMessage(null);
      const res = await importTransactionsFromLocalStorage();
      setResultMessage(res.message || 'Import completed.');
      await refreshTransactions();
    } catch (err) {
      setResultMessage(err.message || 'Failed to import transactions.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Migrate Browser Transactions to MySQL</h3>
              <p className="text-xs text-slate-500">Safely transfer local accounting records into MySQL database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-3 text-xs text-blue-800">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Duplicate-Safe & Non-Destructive</p>
              <p className="text-blue-700/80 mt-0.5">
                Each record is verified against MySQL. Existing transaction numbers or identical date & amount matches are safely skipped. Your original browser cache will be preserved.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs">
            <div className="flex justify-between font-semibold text-slate-700 pb-2 border-b border-slate-200">
              <span>Records Found in Browser</span>
              <span className="font-bold text-slate-900">{localTransactions.length} entries</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto mt-2">
              {localTransactions.slice(0, 10).map((t, idx) => (
                <div key={idx} className="py-1.5 flex justify-between text-slate-600">
                  <div className="truncate max-w-[260px]">
                    <span className="font-medium text-slate-800">{t.description || 'Transaction'}</span>
                    <span className="text-[10px] text-slate-400 block">{t.date} · {t.type} · {t.category}</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatCurrency(parseFloat(t.grossAmount) || 0)}
                  </span>
                </div>
              ))}
              {localTransactions.length > 10 && (
                <p className="text-[10px] text-slate-400 text-center pt-2 italic">
                  + {localTransactions.length - 10} more records...
                </p>
              )}
            </div>
          </div>

          {resultMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
              {resultMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 bg-slate-50">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={isImporting ? RefreshCw : ArrowRight}
            onClick={handleImport}
            disabled={isImporting || localTransactions.length === 0}
            className={isImporting ? 'animate-pulse' : ''}
          >
            {isImporting ? 'Migrating to MySQL...' : `Import ${localTransactions.length} Records`}
          </Button>
        </div>
      </div>
    </div>
  );
};
