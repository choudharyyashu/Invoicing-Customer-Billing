import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { useApp } from '../../context/AppContext';
import { Database, AlertCircle, CheckCircle2, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

export const MigrationModal = ({ isOpen, onClose }) => {
  const { previewLocalStoragePurchasesMigration, executeLocalStoragePurchasesMigration } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setImportResult(null);
      setError(null);
      loadPreview();
    }
  }, [isOpen]);

  const loadPreview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await previewLocalStoragePurchasesMigration();
      if (!res.success) {
        setError(res.message || 'Failed to inspect local storage data.');
      } else {
        setPreviewData(res);
      }
    } catch (err) {
      setError(err.message || 'Error inspecting local data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    setIsImporting(true);
    setError(null);
    try {
      const res = await executeLocalStoragePurchasesMigration();
      setImportResult(res);
    } catch (err) {
      setError(err.message || 'Failed to execute import.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isImporting ? undefined : onClose}
      maxWidth="max-w-3xl"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <span>Migrate Local Purchases to Server Database</span>
        </div>
      }
      subtitle="Preview and safely import legacy browser records into MySQL with duplicate protection."
      footer={
        importResult ? (
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={onClose} disabled={isImporting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={isImporting ? Loader2 : ArrowRight}
              onClick={handleExecuteImport}
              disabled={isImporting || isLoading || !previewData || previewData.newRecordsCount === 0}
            >
              {isImporting
                ? 'Importing to MySQL...'
                : previewData?.newRecordsCount > 0
                ? `Confirm & Import (${previewData.newRecordsCount} New Records)`
                : 'No New Records to Import'}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4 text-xs">
        {/* Safety banner */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5 text-blue-900">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Safety & Integrity Guarantee</span>
            <span className="text-blue-700">
              Existing browser records are preserved. Any duplicate bills matching existing database records will be skipped automatically to prevent double-counting.
            </span>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Success completion state */}
        {importResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Migration Completed Successfully!</span>
            </div>
            <p className="text-emerald-800">
              Imported <strong>{importResult.data?.createdCount || 0}</strong> purchases into MySQL.
              {importResult.data?.skippedCount > 0 && (
                <span> Skipped {importResult.data.skippedCount} duplicate records.</span>
              )}
            </p>
          </div>
        )}

        {/* Loading preview state */}
        {isLoading && (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p>Scanning localStorage and comparing against MySQL database...</p>
          </div>
        )}

        {/* Preview Summary & Table */}
        {!isLoading && !importResult && previewData && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-slate-400 block font-medium">Found in Browser</span>
                <span className="text-base font-bold text-slate-900">{previewData.totalRecords} records</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Eligible to Import</span>
                <span className="text-base font-bold text-emerald-600">
                  {previewData.newRecordsCount} ({formatCurrency(previewData.totalImportAmount)})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Duplicates (Will Skip)</span>
                <span className="text-base font-bold text-slate-500">{previewData.duplicatesCount}</span>
              </div>
            </div>

            {/* Candidate list */}
            <div>
              <div className="font-semibold text-slate-700 mb-2">Itemized Preview:</div>
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {previewData.preview?.map((p, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 flex items-center justify-between text-xs ${
                      p.isDuplicate ? 'bg-slate-50/60 opacity-70' : 'bg-white hover:bg-blue-50/30'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{p.supplierName}</span>
                        {p.supplierInvoiceNo && (
                          <span className="text-slate-400 font-normal text-[11px]">
                            ({p.supplierInvoiceNo})
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Date: {p.date} • {p.itemCount} items
                        {p.duplicateReason && (
                          <span className="text-amber-600 ml-1.5">• {p.duplicateReason}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="font-bold text-slate-900">{formatCurrency(p.total)}</div>
                        <div className="text-[10px] text-slate-400">VAT: {formatCurrency(p.vatAmount)}</div>
                      </div>
                      <Badge variant={p.isDuplicate ? 'neutral' : 'success'} size="sm">
                        {p.isDuplicate ? 'Skip Duplicate' : 'Import'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
