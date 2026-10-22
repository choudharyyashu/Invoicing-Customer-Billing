import React, { useState, useMemo, useEffect } from 'react';
import {
  Truck,
  Users,
  CheckSquare,
  Square,
  Printer,
  Download,
  PackageSearch,
  ClipboardList,
  Plus,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AddDailyOrderModal } from '../../components/orders/AddDailyOrderModal';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatDate';
import { exportToCSV, triggerPrint } from '../../utils/exportUtils';

// Standard Delivery Van definitions
const VANS = [
  { id: 'van1', label: 'Van 1' },
  { id: 'van2', label: 'Van 2' },
  { id: 'van3', label: 'Van 3' },
];

// Helper to determine customer van assignment safely without fallback to van1
const getCustomerVanId = (customer, order) => {
  return order?.vanId || customer?.vanId || null;
};

/**
 * Aggregate ordered product quantities from a set of daily orders.
 * Products are matched by (name + unit) to avoid combining incompatible units.
 * Returns an array of { name, unit, totalQty, customerBreakdown[] } sorted by name.
 */
function aggregateOrders(ordersForCustomers) {
  const agg = {}; // key: `${name}||${unit}`
  ordersForCustomers.forEach((order) => {
    (order.items || []).forEach((item) => {
      const key = `${item.name}||${item.unit || 'units'}`;
      if (!agg[key]) {
        agg[key] = {
          name: item.name,
          unit: item.unit || 'units',
          totalQty: 0,
          customerBreakdown: [],
        };
      }
      const qty = parseFloat(item.quantity) || 0;
      agg[key].totalQty += qty;
      agg[key].customerBreakdown.push({
        customerName: order.customerName,
        qty,
      });
    });
  });

  return Object.values(agg).sort((a, b) => a.name.localeCompare(b.name));
}

export const DailyOrders = () => {
  const { dailyOrders, customers } = useApp();

  // Van selection
  const [selectedVan, setSelectedVan] = useState('van1');

  // Intelligent initial date: uses latest date with orders or today
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    if (dailyOrders && dailyOrders.some((o) => o.date === today)) return today;
    if (dailyOrders && dailyOrders.length > 0) return dailyOrders[0].date;
    return today;
  });

  // Modal control
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [targetModalCustomer, setTargetModalCustomer] = useState('');

  // Scoped customer selections per van (e.g. { van1: [...], van2: [...], van3: [...] })
  const [selectedCustomerIdsByVan, setSelectedCustomerIdsByVan] = useState(() => {
    try {
      const saved = localStorage.getItem('lf_van_scoped_customer_selections');
      return saved ? JSON.parse(saved) : { van1: [], van2: [], van3: [] };
    } catch {
      return { van1: [], van2: [], van3: [] };
    }
  });

  // Persist selections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lf_van_scoped_customer_selections', JSON.stringify(selectedCustomerIdsByVan));
    } catch {
      // Ignore localStorage errors
    }
  }, [selectedCustomerIdsByVan]);

  // Orders for the selected date
  const ordersOnDate = useMemo(
    () => (dailyOrders || []).filter((o) => !selectedDate || o.date === selectedDate),
    [dailyOrders, selectedDate]
  );

  // All customers associated with the selected van
  const customersForVan = useMemo(() => {
    return (customers || []).filter((c) => {
      // Check customer's designated van (explicitly assigned)
      if (c.vanId && c.vanId === selectedVan) return true;
      // Or check if customer has an order on this date assigned to this van
      return ordersOnDate.some((o) => o.customerId === c.id && o.vanId === selectedVan);
    });
  }, [customers, selectedVan, ordersOnDate]);

  // Customers on this van who actually have an order on selectedDate
  const customersWithOrdersOnVan = useMemo(() => {
    const custIdsWithOrders = new Set(ordersOnDate.map((o) => o.customerId));
    return customersForVan.filter((c) => custIdsWithOrders.has(c.id));
  }, [customersForVan, ordersOnDate]);

  // Active van's selected customer IDs
  const activeSelectedCustomerIds = useMemo(() => {
    const current = selectedCustomerIdsByVan[selectedVan];
    if (Array.isArray(current) && current.length > 0) {
      return current;
    }
    // Auto-select customers who have orders on this van if list is uninitialized
    return customersWithOrdersOnVan.map((c) => c.id);
  }, [selectedCustomerIdsByVan, selectedVan, customersWithOrdersOnVan]);

  // Toggle selection for a customer within the active van
  const toggleCustomer = (custId) => {
    setSelectedCustomerIdsByVan((prev) => {
      const currentList = prev[selectedVan] || customersWithOrdersOnVan.map((c) => c.id);
      const nextList = currentList.includes(custId)
        ? currentList.filter((id) => id !== custId)
        : [...currentList, custId];
      return {
        ...prev,
        [selectedVan]: nextList,
      };
    });
  };

  const selectAllCustomers = () => {
    setSelectedCustomerIdsByVan((prev) => ({
      ...prev,
      [selectedVan]: customersForVan.map((c) => c.id),
    }));
  };

  const clearAllCustomers = () => {
    setSelectedCustomerIdsByVan((prev) => ({
      ...prev,
      [selectedVan]: [],
    }));
  };

  // Orders scoped strictly to the selected van and the selected customers
  const selectedOrders = useMemo(() => {
    return ordersOnDate.filter((o) => {
      const orderVan = getCustomerVanId((customers || []).find((c) => c.id === o.customerId), o);
      return orderVan === selectedVan && activeSelectedCustomerIds.includes(o.customerId);
    });
  }, [ordersOnDate, selectedVan, activeSelectedCustomerIds, customers]);

  // Aggregated wholesale purchase list for the active van
  const purchaseList = useMemo(() => aggregateOrders(selectedOrders), [selectedOrders]);

  const selectedVanLabel = VANS.find((v) => v.id === selectedVan)?.label || 'Van';

  const selectedCustomerNames = customersForVan
    .filter((c) => activeSelectedCustomerIds.includes(c.id))
    .map((c) => c.name);

  // CSV Export strictly consistent with the selected van's purchase list
  const handleExportCSV = () => {
    if (!purchaseList.length) return;
    const data = purchaseList.map((p) => ({
      Product: p.name,
      Unit: p.unit,
      'Total Quantity Required': p.totalQty,
      'Customer Breakdown': p.customerBreakdown.map((cb) => `${cb.qty} (${cb.customerName})`).join(' + '),
    }));
    exportToCSV(data, `${selectedVanLabel}_purchase_list_${selectedDate}.csv`);
  };

  // Callback when an order is created via the modal
  const handleOrderAdded = ({ customerId, vanId }) => {
    setSelectedCustomerIdsByVan((prev) => {
      const current = prev[vanId] || [];
      return {
        ...prev,
        [vanId]: current.includes(customerId) ? current : [...current, customerId],
      };
    });
  };

  const openAddOrderForCustomer = (cust) => {
    setTargetModalCustomer(cust.id);
    setIsAddOrderModalOpen(true);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Van Purchase Lists"
        subtitle="Manage route-specific daily produce procurement. Pick customers per delivery van to compute consolidated wholesale purchase quantities."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Daily Purchasing', href: '/orders' },
          { label: 'Van Purchase Lists' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto no-print">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setTargetModalCustomer('');
                setIsAddOrderModalOpen(true);
              }}
              className="text-xs font-bold py-2 shadow-sm"
            >
              Add Daily Order
            </Button>
            {purchaseList.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Printer}
                  onClick={triggerPrint}
                  className="text-xs font-semibold py-2"
                >
                  Print List
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Download}
                  onClick={handleExportCSV}
                  className="text-xs font-semibold py-2"
                >
                  Export CSV
                </Button>
              </div>
            )}
          </div>
        }
      />

      {/* ── Filter Toolbar: Integrated Date & Van Selector Bar ── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Van Tabs (Step 2: Select a van) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0 hidden sm:inline">
              Delivery Van:
            </span>
            {VANS.map((van) => {
              const isSelected = selectedVan === van.id;
              // Count orders currently assigned to this van on the selected date
              const vanOrderCount = ordersOnDate.filter((o) => {
                const oVan = getCustomerVanId((customers || []).find((c) => c.id === o.customerId), o);
                return oVan === van.id;
              }).length;

              return (
                <button
                  key={van.id}
                  onClick={() => setSelectedVan(van.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-500/20'
                      : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Truck className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span>{van.label}</span>
                  {vanOrderCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {vanOrderCount}
                    </span>
                  )}
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2 self-start md:self-auto w-full md:w-auto border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Order Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 hover:bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all flex-1 md:w-44"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Left Panel: Customer Route Selection (Step 3: Select multiple customers) ── */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <Card padding="p-4" className="border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {selectedVanLabel} Customers
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {activeSelectedCustomerIds.length} of {customersForVan.length} selected
                  </span>
                </div>
              </div>

              {customersForVan.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                  <button
                    onClick={selectAllCustomers}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    All
                  </button>
                  <span className="text-slate-300 text-xs">|</span>
                  <button
                    onClick={clearAllCustomers}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    None
                  </button>
                </div>
              )}
            </div>

            {customersForVan.length === 0 ? (
              <div className="text-center py-8 px-3 text-xs text-slate-400">
                <PackageSearch className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No Customers Assigned</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                  No customers are currently routed to {selectedVanLabel}.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Plus}
                  onClick={() => {
                    setTargetModalCustomer('');
                    setIsAddOrderModalOpen(true);
                  }}
                  className="mt-3 text-xs"
                >
                  Add Daily Order for {selectedVanLabel}
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-0.5 scrollbar-thin">
                {customersForVan.map((customer) => {
                  const isSelected = activeSelectedCustomerIds.includes(customer.id);
                  const custOrders = ordersOnDate.filter((o) => o.customerId === customer.id);
                  const hasOrder = custOrders.length > 0;
                  const totalItems = custOrders.reduce(
                    (sum, o) => sum + (o.items || []).reduce((s, i) => s + (parseFloat(i.quantity) || 0), 0),
                    0
                  );

                  return (
                    <div
                      key={customer.id}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs font-bold'
                          : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 font-medium'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleCustomer(customer.id)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer text-left"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <div className="truncate">
                          <p className="truncate text-xs">{customer.name}</p>
                          <p className="text-[10px] font-normal text-slate-400 mt-0.5">
                            {hasOrder ? (
                              <span className="text-emerald-700 font-semibold">
                                {totalItems} items ordered
                              </span>
                            ) : (
                              <span>No order on this date</span>
                            )}
                          </p>
                        </div>
                      </button>

                      {!hasOrder && (
                        <button
                          type="button"
                          onClick={() => openAddOrderForCustomer(customer)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors shrink-0 cursor-pointer"
                          title="Add daily order for this customer"
                        >
                          + Order
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Right Panel: Aggregated Purchase List (Step 4 & 5) ── */}
        <div className="lg:col-span-8">
          {activeSelectedCustomerIds.length === 0 ? (
            <Card padding="p-10" className="text-center flex flex-col items-center justify-center min-h-[360px] border-dashed border-2 border-slate-200 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-3 border border-slate-100">
                <ClipboardList className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No Customers Selected</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                Check one or more customers from the route list to calculate the consolidated wholesale purchase requirements for <span className="font-semibold text-slate-600">{selectedVanLabel}</span>.
              </p>
              {customersForVan.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={selectAllCustomers}
                  className="mt-4 text-xs font-bold"
                >
                  Select All {customersForVan.length} Customers
                </Button>
              )}
            </Card>
          ) : purchaseList.length === 0 ? (
            <Card padding="p-10" className="text-center flex flex-col items-center justify-center min-h-[360px] border-slate-200 bg-white">
              <PackageSearch className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No Produce Quantities Recorded</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                The selected customers do not have recorded produce requirements for {formatDate(selectedDate)} on {selectedVanLabel}.
              </p>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => {
                  setTargetModalCustomer('');
                  setIsAddOrderModalOpen(true);
                }}
                className="mt-4 text-xs font-bold"
              >
                Add Daily Order Now
              </Button>
            </Card>
          ) : (
            <div className="space-y-4 print-area">
              {/* Formal Print Header (visible ONLY during @media print) */}
              <div className="hidden print:block mb-4 border-b-2 border-black pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-black text-black tracking-tight uppercase">
                      Wholesale Purchase List — {selectedVanLabel}
                    </h1>
                    <p className="text-xs text-black mt-0.5">Date: {formatDate(selectedDate)}</p>
                  </div>
                  <div className="text-right text-xs text-black font-mono">
                    Total Lines: {purchaseList.length}
                  </div>
                </div>
                <div className="mt-2 text-xs text-black">
                  <span className="font-bold">Customers on Route:</span> {selectedCustomerNames.join(', ')}
                </div>
              </div>

              {/* On-Screen Summary Dashboard Strip */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs no-print">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                        {selectedVanLabel}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Route for {formatDate(selectedDate)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-slate-400 font-medium">Included:</span>
                      {selectedCustomerNames.map((name) => (
                        <span
                          key={name}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 flex sm:flex-col items-baseline sm:items-end justify-between">
                    <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {purchaseList.length}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:mt-1">
                      Product Items to Buy
                    </span>
                  </div>
                </div>
              </div>

              {/* Consolidated Produce Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-2xs print:border-black print:rounded-none">
                <table className="w-full text-left text-xs text-slate-800 border-collapse min-w-[560px] print:border-black">
                  <thead className="bg-slate-100 text-[11px] uppercase tracking-wider text-slate-700 font-bold border-b border-slate-300 print:bg-slate-200 print:border-black">
                    <tr>
                      <th className="px-3.5 py-3 w-10 text-center font-mono border-r border-slate-200 print:border-black">#</th>
                      <th className="px-4 py-3 border-r border-slate-200 print:border-black">Produce Item</th>
                      <th className="px-3 py-3 text-center border-r border-slate-200 print:border-black">Unit</th>
                      <th className="px-4 py-3 border-r border-slate-200 print:border-black">Customer Breakdown</th>
                      <th className="px-4 py-3 text-right font-black text-slate-900">Total Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 print:divide-black">
                    {purchaseList.map((p, idx) => (
                      <tr key={`${p.name}-${p.unit}`} className="hover:bg-blue-50/25 transition-colors">
                        <td className="px-3.5 py-3 text-center font-mono text-slate-500 text-[11px] border-r border-slate-200 print:border-black">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 text-xs border-r border-slate-200 print:border-black">
                          {p.name}
                        </td>
                        <td className="px-3 py-3 text-center border-r border-slate-200 print:border-black">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] print:bg-transparent print:p-0">
                            {p.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-r border-slate-200 print:border-black">
                          <div className="flex flex-wrap gap-1.5">
                            {p.customerBreakdown.map((cb, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[11px] border border-slate-200/80 print:border-none print:p-0"
                              >
                                <span className="font-black text-blue-700 print:text-black">{cb.qty}</span>
                                <span className="text-slate-600 font-medium max-w-[130px] truncate print:max-w-none">
                                  ({cb.customerName})
                                </span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span className="text-base font-black text-slate-900">{p.totalQty}</span>
                          <span className="text-[11px] font-medium text-slate-500 ml-1">{p.unit}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-300 text-xs print:bg-slate-100 print:border-black">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 font-bold text-slate-800 border-r border-slate-200 print:border-black">
                        Total Produce Lines for {selectedVanLabel}:
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-900 text-sm">
                        {purchaseList.length} <span className="text-xs font-normal text-slate-500">lines</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Daily Order Modal */}
      <AddDailyOrderModal
        isOpen={isAddOrderModalOpen}
        onClose={() => {
          setIsAddOrderModalOpen(false);
          setTargetModalCustomer('');
        }}
        defaultDate={selectedDate}
        defaultVanId={selectedVan}
        defaultCustomerId={targetModalCustomer}
        onOrderAdded={handleOrderAdded}
      />
    </div>
  );
};
