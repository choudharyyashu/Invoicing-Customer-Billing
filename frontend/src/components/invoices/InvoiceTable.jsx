import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  MoreVertical,
  Eye,
  Copy,
  CreditCard,
  Trash2,
  MessageSquare,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Dropdown } from '../ui/Dropdown';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { exportToCSV } from '../../utils/exportUtils';
import { useApp } from '../../context/AppContext';

// Helper: open a single invoice detail page in print mode
const printSingleInvoice = (invId, navigate) => {
  navigate(`/invoices/${invId}`);
  // Use a brief timeout so the page loads before triggering print
  setTimeout(() => window.print(), 600);
};

export const InvoiceTable = ({ onRecordPayment }) => {
  const {
    invoices,
    isInvoicesLoading,
    invoicesError,
    refreshInvoices,
    duplicateInvoice,
    deleteInvoice,
    finalizeInvoice,
    voidInvoice,
    triggerWhatsAppAction,
  } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('All');

  const uniqueCustomers = ['All', ...new Set(invoices.map((i) => i.customerName).filter(Boolean))];

  const filtered = invoices.filter((inv) => {
    const invNum = inv.invoiceNumber || '';
    const custName = inv.customerName || '';
    const ref = inv.reference || '';

    const matchesSearch =
      invNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    const matchesCust = customerFilter === 'All' || custName === customerFilter;

    return matchesSearch && matchesStatus && matchesCust;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="success" dot size="sm">Paid</Badge>;
      case 'Partially Paid':
        return <Badge variant="warning" dot size="sm">Partially Paid</Badge>;
      case 'Overdue':
        return <Badge variant="danger" dot size="sm">Overdue</Badge>;
      case 'Sent':
      case 'Issued':
        return <Badge variant="info" dot size="sm">Sent</Badge>;
      case 'Void':
        return <Badge variant="danger" size="sm">Void</Badge>;
      case 'Draft':
      default:
        return <Badge variant="draft" size="sm">Draft</Badge>;
    }
  };

  const handleVoid = async (inv) => {
    const reason = window.prompt(`Enter reason for voiding invoice ${inv.invoiceNumber}:`);
    if (reason && reason.trim()) {
      try {
        await voidInvoice(inv.id, reason.trim());
      } catch (_) {
        // Toast handled in context
      }
    }
  };

  const handleExportCSV = () => {
    const data = filtered.map((i) => ({
      'Invoice Number': i.invoiceNumber,
      Customer: i.customerName,
      'Issue Date': i.issueDate,
      'Due Date': i.dueDate,
      Reference: i.reference,
      Status: i.status,
      Subtotal: i.subtotal,
      VAT: i.vatAmount,
      Total: i.total,
      'Amount Paid': i.amountPaid,
      'Balance Due': i.balanceDue,
    }));
    exportToCSV(data, 'invoices_export.csv');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar / Filters */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice #, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 sm:bg-white"
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Sent">Sent</option>
              <option value="Overdue">Overdue</option>
              <option value="Draft">Draft</option>
              <option value="Void">Void</option>
            </select>

            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="flex-1 sm:flex-none text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-blue-500 max-w-[140px] sm:max-w-[180px] truncate"
            >
              {uniqueCustomers.map((cust) => (
                <option key={cust} value={cust}>
                  {cust === 'All' ? 'All Customers' : cust}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <Button
            size="sm"
            variant="outline"
            icon={Download}
            onClick={handleExportCSV}
            className="w-full sm:w-auto"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {invoicesError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-xs">
          <span>Failed to load invoices from server: {invoicesError}</span>
          <Button size="sm" variant="outline" icon={RefreshCw} onClick={refreshInvoices}>
            Retry
          </Button>
        </div>
      )}

      {/* Invoice Table with Mobile Horizontal Scrolling */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[700px]">
          <thead className="bg-slate-50/90 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 whitespace-nowrap">Invoice #</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Customer</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Issue Date</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Due Date</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Amount</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Paid</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Balance</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-center">Status</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isInvoicesLoading ? (
              <tr>
                <td colSpan="9" className="text-center py-12 text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading invoices...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-12 text-slate-400">
                  No invoices found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3.5 font-bold text-slate-900 group-hover:text-blue-600">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800 truncate max-w-[180px]">
                    {inv.customerName}
                    {inv.reference && (
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Ref: {inv.reference}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    {formatDate(inv.issueDate, { short: true })}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    <span className={inv.status === 'Overdue' ? 'text-red-600 font-bold' : ''}>
                      {formatDate(inv.dueDate, { short: true })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-emerald-600 font-semibold whitespace-nowrap">
                    {inv.amountPaid > 0 ? formatCurrency(inv.amountPaid) : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold whitespace-nowrap">
                    <span className={inv.balanceDue > 0 ? 'text-red-600' : 'text-slate-400'}>
                      {formatCurrency(inv.balanceDue)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    {getStatusBadge(inv.status)}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      trigger={
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                      items={[
                        {
                          label: 'View Invoice',
                          icon: Eye,
                          onClick: () => navigate(`/invoices/${inv.id}`),
                        },
                        {
                          label: 'Print Invoice',
                          icon: Printer,
                          onClick: () => printSingleInvoice(inv.id, navigate),
                        },
                        ...(inv.balanceDue > 0 && inv.status !== 'Draft' && inv.status !== 'Void'
                          ? [
                              {
                                label: 'Record Payment',
                                icon: CreditCard,
                                onClick: () => (onRecordPayment ? onRecordPayment(inv) : navigate('/payments')),
                              },
                            ]
                          : []),
                        ...(inv.status === 'Draft'
                          ? [
                              {
                                label: 'Finalize & Issue',
                                icon: CheckCircle2,
                                onClick: () => finalizeInvoice(inv.id),
                              },
                            ]
                          : []),
                        {
                          label: 'Duplicate Invoice',
                          icon: Copy,
                          onClick: () => duplicateInvoice(inv.id),
                        },
                        {
                          label: 'Send via WhatsApp',
                          icon: MessageSquare,
                          onClick: () => triggerWhatsAppAction('Invoice Details', { recipient: inv.customerName }),
                        },
                        ...(inv.status === 'Draft'
                          ? [
                              { divider: true },
                              {
                                label: 'Delete Draft',
                                icon: Trash2,
                                danger: true,
                                onClick: () => deleteInvoice(inv.id),
                              },
                            ]
                          : inv.status !== 'Void'
                          ? [
                              { divider: true },
                              {
                                label: 'Void Invoice',
                                icon: AlertTriangle,
                                danger: true,
                                onClick: () => handleVoid(inv),
                              },
                            ]
                          : []),
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
