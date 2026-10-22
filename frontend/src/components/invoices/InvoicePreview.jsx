import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Badge } from '../ui/Badge';
import { Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InvoicePreview = ({ invoice, businessSettings, customer: propCustomer }) => {
  const { customers } = useApp() || {};

  if (!invoice) return null;

  // Locate associated customer from context or prop to get real-time account balances
  const customer =
    propCustomer ||
    (customers &&
      customers.find(
        (c) => c.id === invoice.customerId || c.name === invoice.customerName
      ));

  // Distinguish customer's overall outstanding account balance from this specific invoice's balance due
  const customerOutstanding =
    customer?.outstandingBalance !== undefined
      ? parseFloat(customer.outstandingBalance)
      : parseFloat(invoice.balanceDue || 0);

  const invoiceBalanceDue =
    invoice.balanceDue !== undefined
      ? parseFloat(invoice.balanceDue)
      : Math.max(0, (parseFloat(invoice.total) || 0) - (parseFloat(invoice.amountPaid) || 0));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="success" size="sm" dot>PAID IN FULL</Badge>;
      case 'Partially Paid':
        return <Badge variant="warning" size="sm" dot>PARTIALLY PAID</Badge>;
      case 'Overdue':
        return <Badge variant="danger" size="sm" dot>OVERDUE</Badge>;
      case 'Sent':
      case 'Issued':
        return <Badge variant="info" size="sm" dot>SENT / DUE</Badge>;
      case 'Void':
        return <Badge variant="danger" size="sm">VOID</Badge>;
      case 'Draft':
      default:
        return <Badge variant="draft" size="sm">DRAFT</Badge>;
    }
  };

  const customerAddress = invoice.customerAddress || customer?.address;
  const customerEmail = invoice.customerEmail || customer?.email;
  const customerPhone = customer?.phone;
  const customerVat = customer?.vatNumber;

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-3.5 sm:p-6 sm:p-10 max-w-4xl mx-auto print-area text-slate-900 print:p-0 print:border-none print:shadow-none print:rounded-none">
      {/* 1. Centered INVOICE Heading at Top */}
      <div className="text-center pb-4 mb-6 border-b-2 border-slate-900 print:border-black">
        <div className="flex items-center justify-between no-print mb-2">
          <div className="text-xs text-slate-500 font-medium">Official Invoice Document</div>
          <div>{getStatusBadge(invoice.status)}</div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-slate-900 uppercase">
          INVOICE
        </h1>
      </div>

      {/* 2. Upper Section: Company & Customer Info (Left) + Compact Bordered Summary Table (Right) */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-300 print:border-black">
        {/* Upper Left: Company & Customer Details */}
        <div className="flex-1 space-y-4">
          {/* Company Details */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0 print:border print:border-black print:bg-white print:text-black">
              <Layers className="w-6 h-6 text-white print:text-black" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {businessSettings?.businessName || 'Fresh Harvest Wholesale & Logistics'}
              </h2>
              {businessSettings?.tradingName && (
                <p className="text-xs text-slate-600 font-medium">
                  {businessSettings.tradingName}
                </p>
              )}
              <div className="text-xs text-slate-600 mt-1 space-y-0.5 leading-relaxed">
                <p>{businessSettings?.address || 'Unit 4, Spitalfields Wholesale Park, London, E1 6AQ'}</p>
                <p>
                  VAT No: <span className="font-semibold text-slate-800">{businessSettings?.vatNumber || 'GB 381 9024 11'}</span>
                </p>
                <p>
                  Tel: {businessSettings?.phone || '+44 20 8123 4567'} | Email: {businessSettings?.email || 'accounts@freshharvestdirect.co.uk'}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Details (Below Company Details) */}
          <div className="pt-3 border-t border-slate-200 print:border-slate-400">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Customer / Billed To:
            </p>
            <h3 className="text-sm font-bold text-slate-900">
              {invoice.customerName}
            </h3>
            {customerAddress && (
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{customerAddress}</p>
            )}
            <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap gap-x-3">
              {customerEmail && <span>Email: {customerEmail}</span>}
              {customerPhone && <span>Tel: {customerPhone}</span>}
            </div>
            {customerVat && (
              <p className="text-xs text-slate-600 mt-0.5">
                Customer VAT: <span className="font-semibold text-slate-800">{customerVat}</span>
              </p>
            )}
          </div>
        </div>

        {/* Upper Right: Compact Bordered Summary Table */}
        <div className="w-full sm:w-auto shrink-0 self-stretch sm:self-auto flex flex-col items-end">
          <table className="border-collapse border border-slate-400 text-xs w-full sm:w-72 bg-white print:border-black">
            <tbody>
              <tr className="border-b border-slate-300 print:border-black">
                <th className="py-2 px-3 bg-slate-50 border-r border-slate-300 font-bold text-slate-800 text-left print:bg-slate-100 print:border-black">
                  Invoice Number
                </th>
                <td className="py-2 px-3 font-mono font-bold text-slate-900 text-right">
                  {invoice.invoiceNumber}
                </td>
              </tr>
              <tr className="border-b border-slate-300 print:border-black">
                <th className="py-2 px-3 bg-slate-50 border-r border-slate-300 font-bold text-slate-800 text-left print:bg-slate-100 print:border-black">
                  Date
                </th>
                <td className="py-2 px-3 font-medium text-slate-900 text-right">
                  {formatDate(invoice.issueDate)}
                </td>
              </tr>
              <tr className="border-b border-slate-300 print:border-black">
                <th className="py-2 px-3 bg-slate-50 border-r border-slate-300 font-bold text-slate-800 text-left print:bg-slate-100 print:border-black">
                  Total
                </th>
                <td className="py-2 px-3 font-bold text-slate-900 text-right">
                  {formatCurrency(invoice.total)}
                </td>
              </tr>
              <tr>
                <th className="py-2 px-3 bg-slate-50 border-r border-slate-300 font-bold text-slate-800 text-left print:bg-slate-100 print:border-black">
                  Outstanding Balance
                  <span className="block text-[10px] font-normal text-slate-500">
                    (Customer Account)
                  </span>
                </th>
                <td className="py-2 px-3 font-bold text-slate-900 text-right text-sm">
                  {formatCurrency(customerOutstanding)}
                </td>
              </tr>
            </tbody>
          </table>

          {invoice.reference && (
            <p className="text-[11px] text-slate-500 text-right mt-1.5 font-medium">
              Reference / PO: <span className="font-mono font-bold text-slate-800">{invoice.reference}</span>
            </p>
          )}
          {invoice.dueDate && (
            <p className="text-[11px] text-slate-500 text-right mt-0.5">
              Payment Due: <span className="font-semibold text-slate-800">{formatDate(invoice.dueDate)}</span>
            </p>
          )}
        </div>
      </div>

      {/* 3. Item Table with columns: item number, product, quantity, unit price, and amount */}
      <div className="py-6 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse border border-slate-400 print:border-black min-w-[500px]">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400 print:bg-slate-200 print:border-black text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3 w-12 text-center border-r border-slate-300 print:border-black">#</th>
              <th className="py-2.5 px-4 border-r border-slate-300 print:border-black">Product</th>
              <th className="py-2.5 px-3 text-center border-r border-slate-300 print:border-black">Quantity</th>
              <th className="py-2.5 px-3 text-right border-r border-slate-300 print:border-black">Unit Price</th>
              <th className="py-2.5 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 print:divide-black">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500 border-r border-slate-300 print:border-black">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-300 print:border-black">
                    {item.description || item.product || item.name}
                    {parseFloat(item.vatRate) > 0 && (
                      <span className="text-[10px] font-normal text-slate-500 ml-1.5">
                        (VAT {item.vatRate}%)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium text-slate-800 border-r border-slate-300 print:border-black">
                    {item.quantity} {item.unit || ''}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-800 border-r border-slate-300 print:border-black whitespace-nowrap">
                    {formatCurrency(item.unitPrice ?? item.rate ?? item.unitRate ?? 0)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(item.total ?? item.subtotal ?? item.amount ?? ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice ?? item.rate) || 0)))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-4 text-center text-slate-500">
                  No line items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Bottom Summary: Subtotal, Total, Amount Due (+ Remittance & Notes on Left) */}
      <div className="pt-2 flex flex-col sm:flex-row justify-between items-start gap-6">
        {/* Left: Bank Remittance Details & Notes */}
        <div className="w-full sm:max-w-sm space-y-3">
          <div className="border border-slate-300 rounded-lg p-3 text-xs bg-slate-50/60 print:border-black print:bg-white">
            <p className="font-bold text-slate-900 uppercase tracking-wide text-[10px] mb-1.5">
              Bank Remittance Details
            </p>
            <div className="space-y-0.5 text-slate-700">
              <p><span className="text-slate-500">Bank:</span> {businessSettings?.bankName || 'Barclays Business UK'}</p>
              <p><span className="text-slate-500">Account Name:</span> {businessSettings?.accountName || 'Fresh Harvest Direct Ltd'}</p>
              <p><span className="text-slate-500">Sort Code:</span> <span className="font-mono font-bold text-slate-900">{businessSettings?.sortCode || '20-44-67'}</span></p>
              <p><span className="text-slate-500">Account No:</span> <span className="font-mono font-bold text-slate-900">{businessSettings?.accountNumber || '83920194'}</span></p>
            </div>
          </div>

          {invoice.notes && (
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-0.5">
                Notes & Terms:
              </span>
              <span>{invoice.notes}</span>
            </div>
          )}
        </div>

        {/* Right: Bottom Summary Table */}
        <div className="w-full sm:w-72 shrink-0">
          <table className="border-collapse border border-slate-400 text-xs w-full bg-white print:border-black">
            <tbody>
              <tr className="border-b border-slate-300 print:border-black">
                <th className="py-2 px-3 bg-slate-50 border-r border-slate-300 font-semibold text-slate-700 text-left print:bg-slate-100 print:border-black">
                  Subtotal
                </th>
                <td className="py-2 px-3 font-semibold text-slate-900 text-right">
                  {formatCurrency(invoice.subtotal)}
                </td>
              </tr>

              {invoice.vatAmount > 0 && (
                <tr className="border-b border-slate-300 print:border-black">
                  <th className="py-2 px-3 bg-slate-50 border-r border-slate-300 font-medium text-slate-700 text-left print:bg-slate-100 print:border-black">
                    VAT (20% Standard)
                  </th>
                  <td className="py-2 px-3 font-semibold text-slate-900 text-right">
                    {formatCurrency(invoice.vatAmount)}
                  </td>
                </tr>
              )}

              {invoice.discountAmount > 0 && (
                <tr className="border-b border-slate-300 print:border-black">
                  <th className="py-2 px-3 bg-slate-50 border-r border-slate-300 font-medium text-emerald-700 text-left print:bg-slate-100 print:border-black">
                    Discount
                  </th>
                  <td className="py-2 px-3 font-semibold text-emerald-700 text-right">
                    -{formatCurrency(invoice.discountAmount)}
                  </td>
                </tr>
              )}

              <tr className="border-b border-slate-300 font-bold bg-slate-100 print:border-black print:bg-slate-100">
                <th className="py-2 px-3 border-r border-slate-300 text-slate-900 text-left print:border-black">
                  Total
                </th>
                <td className="py-2 px-3 text-slate-900 text-right text-sm">
                  {formatCurrency(invoice.total)}
                </td>
              </tr>

              {invoice.amountPaid > 0 && (
                <tr className="border-b border-slate-300 print:border-black">
                  <th className="py-2 px-3 bg-slate-50 border-r border-slate-300 font-medium text-slate-700 text-left print:bg-slate-100 print:border-black">
                    Amount Paid
                  </th>
                  <td className="py-2 px-3 font-semibold text-emerald-700 text-right">
                    -{formatCurrency(invoice.amountPaid)}
                  </td>
                </tr>
              )}

              <tr className="font-black bg-slate-100 print:bg-slate-200">
                <th className="py-2.5 px-3 border-r border-slate-300 text-slate-900 text-left print:border-black">
                  Amount Due
                  <span className="block text-[10px] font-normal text-slate-500">
                    (This Invoice)
                  </span>
                </th>
                <td className="py-2.5 px-3 text-slate-900 text-right text-base font-black">
                  {formatCurrency(invoiceBalanceDue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
