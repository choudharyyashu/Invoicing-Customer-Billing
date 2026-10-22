import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  Package,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

export const CustomerOrdersList = ({ selectedDate, onAddOrder }) => {
  const { dailyOrders, customers, products } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'Confirmed' | 'Invoiced'

  const dateOrders = dailyOrders.filter(
    (ord) => !selectedDate || ord.date === selectedDate
  );

  const filteredOrders = dateOrders.filter((ord) => {
    const matchesSearch =
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Invoiced' && ord.status === 'Invoiced') ||
      (filterStatus === 'Confirmed' && ord.status !== 'Invoiced');

    return matchesSearch && matchesStatus;
  });

  const handleGenerateInvoice = (order) => {
    // 1. Locate customer entity
    const customerObj =
      customers.find((c) => c.id === order.customerId || c.name === order.customerName) ||
      customers[0];

    // 2. Map order items to invoice line items using product catalog defaults
    const invoiceItems = order.items.map((item, idx) => {
      const matchProduct = products.find(
        (p) => p.id === item.productId || p.name.toLowerCase() === item.name.toLowerCase()
      );

      const rate = matchProduct?.defaultRate || 2.50;
      const vatRate = matchProduct?.defaultVat || 0;
      const qty = parseFloat(item.quantity) || 1;
      const amount = parseFloat((qty * rate).toFixed(2));

      return {
        id: (Date.now() + idx).toString(),
        description: item.name,
        quantity: qty,
        unit: item.unit || matchProduct?.unit || 'kg',
        rate,
        vatRate,
        amount,
      };
    });

    // 3. Navigate to Create Invoice with prefilled initial data and order linkage
    navigate('/invoices/create', {
      state: {
        initialData: {
          customer: customerObj,
          items: invoiceItems,
          reference: `PO-${order.id}`,
          orderId: order.id,
        },
      },
    });
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
              placeholder="Search by customer, order ID, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Order Statuses</option>
            <option value="Confirmed">Ready for Invoicing</option>
            <option value="Invoiced">Invoiced Orders</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredOrders.length}</strong> customer tickets ({selectedDate})
        </div>
      </div>

      {/* Orders Grid / Cards */}
      {filteredOrders.length === 0 ? (
        <Card padding="p-12" className="text-center bg-slate-50/50 border-dashed border-2 border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">No customer orders found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No WhatsApp daily orders have been entered for this date matching your filter.
          </p>
          {onAddOrder && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddOrder}
              className="mt-4 text-xs font-semibold"
            >
              + Add Customer Order
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isInvoiced = order.status === 'Invoiced';
            const totalQty = order.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

            return (
              <Card
                key={order.id}
                padding="p-4 sm:p-5"
                className={`transition-all border ${
                  isInvoiced
                    ? 'border-slate-200 bg-slate-50/40'
                    : 'border-blue-200/80 bg-white hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {order.customerName}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {order.id} • {formatDate(order.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isInvoiced ? (
                      <Badge variant="success" size="sm" dot>
                        Invoiced {order.invoiceNumber ? `(${order.invoiceNumber})` : ''}
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm" dot>
                        Ready to Invoice
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div className="py-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Produce Items ({order.items.length} lines • {totalQty} total units)
                  </span>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70 max-h-44 overflow-y-auto space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white border border-slate-100 shadow-2xs"
                      >
                        <span className="font-semibold text-slate-800 truncate pr-2">
                          {item.name}
                        </span>
                        <span className="font-bold text-blue-600 font-mono shrink-0 bg-blue-50 px-2 py-0.5 rounded">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    {isInvoiced ? 'Tax invoice already generated' : 'Manual WhatsApp Intake'}
                  </span>

                  {isInvoiced ? (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={ExternalLink}
                      onClick={() => navigate('/invoices')}
                      className="text-xs py-1.5 text-slate-600"
                    >
                      View in Invoices
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={FileText}
                      onClick={() => handleGenerateInvoice(order)}
                      className="text-xs py-1.5 font-bold shadow-xs shadow-blue-500/10"
                    >
                      Generate Invoice →
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
