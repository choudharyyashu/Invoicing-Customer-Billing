import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export const TodayOrdersWidget = () => {
  const { dailyOrders, purchasedFulfillment } = useApp();
  const navigate = useNavigate();

  // Aggregate today's requirement items
  const aggregation = {};
  dailyOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!aggregation[item.name]) {
        aggregation[item.name] = {
          name: item.name,
          unit: item.unit,
          totalQty: 0,
        };
      }
      aggregation[item.name].totalQty += item.quantity;
    });
  });

  const productsList = Object.values(aggregation);
  const totalProductsCount = productsList.length;
  const totalItemsCount = productsList.reduce((acc, p) => acc + p.totalQty, 0);

  // Calculate fulfilled vs pending
  let fulfilledCount = 0;
  productsList.forEach((p) => {
    const purchased = purchasedFulfillment[p.name] || 0;
    if (purchased >= p.totalQty) fulfilledCount++;
  });

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        title="Today's Orders & Purchasing"
        subtitle="Daily procurement aggregation (Local State - Unmigrated)"
        action={
          <button
            onClick={() => navigate('/orders')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            Open Purchasing List <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-2 my-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
        <div>
          <span className="block text-[11px] text-slate-500 font-semibold uppercase">Orders</span>
          <span className="text-lg font-black text-slate-900">{dailyOrders.length}</span>
        </div>
        <div>
          <span className="block text-[11px] text-slate-500 font-semibold uppercase">Products</span>
          <span className="text-lg font-black text-slate-900">{totalProductsCount}</span>
        </div>
        <div>
          <span className="block text-[11px] text-slate-500 font-semibold uppercase">Fulfilled</span>
          <span className="text-lg font-black text-emerald-600">
            {fulfilledCount}/{totalProductsCount}
          </span>
        </div>
      </div>

      {/* Snapshot list */}
      <div className="space-y-2 flex-1">
        {productsList.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5">
            <ShoppingCart className="w-8 h-8 text-slate-300 stroke-[1.5]" />
            <p className="font-medium text-slate-500">No customer orders recorded today</p>
            <p className="text-[11px] text-slate-400">Orders created will appear here for procurement aggregation</p>
          </div>
        ) : (
          productsList.slice(0, 4).map((p) => {
            const purchased = purchasedFulfillment[p.name] || 0;
            const isDone = purchased >= p.totalQty;
            return (
              <div key={p.name} className="flex items-center justify-between text-xs p-2 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-800">{p.name}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({p.unit})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{purchased} / {p.totalQty}</span>
                  <Badge variant={isDone ? 'success' : 'warning'} size="sm">
                    {isDone ? 'Ready' : 'Pending'}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Produce procurement mode</span>
        <button
          onClick={() => navigate('/orders')}
          className="font-bold text-blue-600 hover:text-blue-800"
        >
          View Full Aggregation →
        </button>
      </div>
    </Card>
  );
};
