import React, { useState } from 'react';
import {
  Search,
  Check,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  Edit3,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { exportToCSV, triggerPrint } from '../../utils/exportUtils';

export const ProductRequirementTable = ({ selectedDate }) => {
  const {
    dailyOrders,
    purchasedFulfillment,
    updatePurchasedQty,
    markProductAllPurchased,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'Pending' | 'Purchased'
  const [editingProduct, setEditingProduct] = useState(null);
  const [editQty, setEditQty] = useState('');

  // Filter orders by selected date (or all if matches)
  const matchingOrders = dailyOrders.filter(
    (ord) => !selectedDate || ord.date === selectedDate
  );

  // Aggregate items from all matching orders
  // Structure: { [productName]: { name, unit, customerBreakdown: [{ customerName, qty }], totalRequired } }
  const aggregation = {};

  matchingOrders.forEach((order) => {
    order.items.forEach((item) => {
      const pName = item.name;
      if (!aggregation[pName]) {
        aggregation[pName] = {
          name: pName,
          unit: item.unit || 'units',
          customerBreakdown: [],
          totalRequired: 0,
        };
      }
      aggregation[pName].customerBreakdown.push({
        customerName: order.customerName,
        quantity: item.quantity,
      });
      aggregation[pName].totalRequired += item.quantity;
    });
  });

  const productRows = Object.values(aggregation);

  const filtered = productRows.filter((p) => {
    const purchased = purchasedFulfillment[p.name] || 0;
    const remaining = Math.max(0, p.totalRequired - purchased);
    const isPurchased = remaining === 0;

    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Purchased' && isPurchased) ||
      (filterStatus === 'Pending' && !isPurchased);

    return matchesSearch && matchesStatus;
  });

  const handleSaveEdit = (productName) => {
    updatePurchasedQty(productName, editQty);
    setEditingProduct(null);
    setEditQty('');
  };

  const handleExport = () => {
    const data = filtered.map((p) => {
      const purchased = purchasedFulfillment[p.name] || 0;
      const remaining = Math.max(0, p.totalRequired - purchased);
      const breakdownStr = p.customerBreakdown.map((c) => `${c.quantity} (${c.customerName})`).join(' + ');

      return {
        Product: p.name,
        Unit: p.unit,
        'Customer Orders': breakdownStr,
        'Total Required': p.totalRequired,
        Purchased: purchased,
        Remaining: remaining,
        Status: remaining === 0 ? 'Purchased' : 'Pending',
      };
    });
    exportToCSV(data, `procurement_requirement_${selectedDate}.csv`);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search required produce & items..."
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
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Procurement Only</option>
            <option value="Purchased">Fulfilled / Purchased Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" icon={Printer} onClick={triggerPrint}>
            Print List
          </Button>
          <Button size="sm" variant="outline" icon={Download} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Spreadsheet-style Aggregation Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs print-area">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Aggregated Procurement Requirement Sheet ({selectedDate})
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filtered.length} unique produce lines
          </span>
        </div>

        <table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[700px]">
          <thead className="bg-slate-100/70 text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 whitespace-nowrap">Product Name</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-center">Unit</th>
              <th className="px-4 py-3.5">Customer Orders Breakdown</th>
              <th className="px-4 py-3.5 text-center whitespace-nowrap">Total Required</th>
              <th className="px-4 py-3.5 text-center whitespace-nowrap">Purchased</th>
              <th className="px-4 py-3.5 text-center whitespace-nowrap">Remaining</th>
              <th className="px-4 py-3.5 text-center whitespace-nowrap">Status</th>
              <th className="px-4 py-3.5 text-right whitespace-nowrap no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-slate-400">
                  No products aggregated for this date.
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const purchased = purchasedFulfillment[p.name] || 0;
                const remaining = Math.max(0, p.totalRequired - purchased);
                const isPurchased = remaining === 0;
                const isEditing = editingProduct === p.name;

                return (
                  <tr
                    key={p.name}
                    className={`hover:bg-blue-50/30 transition-colors ${
                      isPurchased ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {/* Product Name */}
                    <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {p.name}
                    </td>

                    {/* Unit */}
                    <td className="px-4 py-3.5 text-center font-mono text-slate-500 whitespace-nowrap">
                      {p.unit}
                    </td>

                    {/* Breakdown of customer orders */}
                    <td className="px-4 py-3.5 text-slate-700">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {p.customerBreakdown.map((cb, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] border border-slate-200"
                            title={cb.customerName}
                          >
                            <span className="font-bold text-blue-600">{cb.quantity}</span>
                            <span className="text-slate-500 truncate max-w-[110px]">
                              {cb.customerName}
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total Required */}
                    <td className="px-4 py-3.5 text-center font-black text-slate-900 text-sm whitespace-nowrap bg-slate-50/50">
                      {p.totalRequired}
                    </td>

                    {/* Purchased Qty (with inline edit) */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            autoFocus
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(p.name)}
                            className="w-16 px-1.5 py-0.5 text-xs text-center border border-blue-500 rounded font-bold"
                          />
                          <button
                            onClick={() => handleSaveEdit(p.name)}
                            className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingProduct(p.name);
                            setEditQty(purchased.toString());
                          }}
                          className="inline-flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded hover:bg-slate-100"
                          title="Click to edit quantity"
                        >
                          <span className="font-bold text-slate-900">{purchased}</span>
                          <Edit3 className="w-3 h-3 text-slate-400 no-print" />
                        </div>
                      )}
                    </td>

                    {/* Remaining */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`font-black text-xs ${
                          remaining > 0 ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {remaining}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <Badge variant={isPurchased ? 'success' : 'warning'} size="sm" dot>
                        {isPurchased ? 'Purchased' : 'Pending'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap no-print">
                      {!isPurchased ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markProductAllPurchased(p.name, p.totalRequired)}
                          className="text-[11px] py-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        >
                          Mark Purchased
                        </Button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
