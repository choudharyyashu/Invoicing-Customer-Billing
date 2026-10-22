import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const RecentInvoices = () => {
  const { invoices } = useApp();
  const navigate = useNavigate();

  const recent = invoices.slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="success" dot size="sm">Paid</Badge>;
      case 'Partially Paid':
        return <Badge variant="warning" dot size="sm">Partial</Badge>;
      case 'Overdue':
        return <Badge variant="danger" dot size="sm">Overdue</Badge>;
      case 'Sent':
        return <Badge variant="info" dot size="sm">Sent</Badge>;
      case 'Draft':
      default:
        return <Badge variant="draft" size="sm">Draft</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader
        title="Recent Invoices"
        subtitle="Latest billing activities and customer statuses"
        action={
          <button
            onClick={() => navigate('/invoices')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            View All Invoices <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />

      <div className="overflow-x-auto -mx-6 px-6 pt-2">
        <table className="w-full text-left text-xs min-w-[480px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
              <th className="pb-3 font-semibold">Invoice #</th>
              <th className="pb-3 font-semibold">Customer</th>
              <th className="pb-3 font-semibold">Due Date</th>
              <th className="pb-3 font-semibold text-right">Amount</th>
              <th className="pb-3 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recent.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400">
                  No invoices recorded yet.
                </td>
              </tr>
            ) : (
              recent.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 font-bold text-slate-900 group-hover:text-blue-600">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 text-slate-700 font-medium truncate max-w-[140px]">
                    {inv.customerName}
                  </td>
                  <td className="py-3 text-slate-500">
                    {formatDate(inv.dueDate, { short: true })}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="py-3 text-center">
                    {getStatusBadge(inv.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
