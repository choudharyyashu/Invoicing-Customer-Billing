import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, CheckCircle2, ArrowRight, Wand2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatCurrency';

export const AIInvoiceModal = ({ isOpen, onClose, onApplyExtracted }) => {
  const { products, customers } = useApp();

  const [promptText, setPromptText] = useState(
    "Green Valley Restaurant:\n15kg King Edward Potatoes\n8 Vine Tomatoes\n12 Spanish Brown Onions\n6 Crisp Iceberg Lettuce\n2 Extra Virgin Olive Oil 5L"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const samplePrompts = [
    {
      label: "Green Valley Morning Produce",
      text: "Green Valley Restaurant:\n15kg King Edward Potatoes\n8 Vine Tomatoes\n12 Spanish Brown Onions\n6 Crisp Iceberg Lettuce\n2 Extra Virgin Olive Oil 5L",
    },
    {
      label: "The Fresh Kitchen Salad Batch",
      text: "The Fresh Kitchen:\n20 Crisp Iceberg Lettuce\n15 English Cucumbers\n10kg Mixed Bell Peppers\n4 boxes Avocados",
    },
    {
      label: "Bella Bistro Italian Pantry",
      text: "Bella Bistro:\n12 cans San Marzano Canned Tomatoes\n4 tins Extra Virgin Olive Oil 5L\n10 bunches Fresh Basil\n8kg Portobello Mushrooms",
    },
  ];

  const handleSimulateAI = () => {
    if (!promptText.trim()) return;
    setIsProcessing(true);

    // Simulate smart AI extraction latency
    setTimeout(() => {
      // Find matching customer
      const lower = promptText.toLowerCase();
      let matchedCust = customers.find((c) => lower.includes(c.name.toLowerCase()));
      if (!matchedCust) matchedCust = customers[0];

      // Parse lines
      const lines = promptText.split('\n');
      const parsedItems = [];

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.includes(':')) return;

        // Try to match product
        let foundProduct = products.find((p) => trimmed.toLowerCase().includes(p.name.toLowerCase().slice(0, 5)));
        
        // Extract quantity
        const qtyMatch = trimmed.match(/(\d+(\.\d+)?)/);
        const qty = qtyMatch ? parseFloat(qtyMatch[0]) : 1;

        if (foundProduct) {
          const rate = foundProduct.defaultRate;
          const vat = foundProduct.defaultVat;
          parsedItems.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            description: foundProduct.name,
            quantity: qty,
            unit: foundProduct.unit,
            rate: rate,
            vatRate: vat,
            amount: parseFloat((qty * rate).toFixed(2)),
          });
        } else {
          // Fallback clean item
          parsedItems.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            description: trimmed.replace(/^\d+[\s\w]*/, '').trim() || trimmed,
            quantity: qty,
            unit: 'units',
            rate: 2.50,
            vatRate: 0,
            amount: parseFloat((qty * 2.50).toFixed(2)),
          });
        }
      });

      if (parsedItems.length === 0) {
        parsedItems.push({
          id: '1',
          description: 'King Edward Potatoes',
          quantity: 20,
          unit: 'kg',
          rate: 1.45,
          vatRate: 0,
          amount: 29.00,
        });
      }

      setExtractedData({
        customer: matchedCust,
        items: parsedItems,
        reference: `AI-PO-${Math.floor(1000 + Math.random() * 9000)}`,
      });
      setIsProcessing(false);
    }, 900);
  };

  const handleApply = () => {
    if (extractedData && onApplyExtracted) {
      onApplyExtracted(extractedData);
      onClose();
      setExtractedData(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>AI Invoice Assistant</span>
        </div>
      }
      subtitle="Paste free-text order messages or select a sample to instantly generate invoice line items."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {extractedData ? (
            <Button variant="primary" icon={CheckCircle2} onClick={handleApply}>
              Apply Extracted Items to Invoice
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={Wand2}
              loading={isProcessing}
              onClick={handleSimulateAI}
            >
              Generate Invoice Items
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-3.5 text-xs">
        {/* Quick Sample Selector */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick Test Order Samples:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPromptText(s.text);
                  setExtractedData(null);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors text-slate-700 font-medium cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Order Text / Message:
          </label>
          <textarea
            rows={3}
            value={promptText}
            onChange={(e) => {
              setPromptText(e.target.value);
              setExtractedData(null);
            }}
            placeholder="e.g. John's Kitchen: 5 vine tomatoes, 10kg potatoes, 4 lettuce..."
            className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 leading-relaxed"
          />
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2.5 animate-pulse">
            <Wand2 className="w-4 h-4 text-blue-600 animate-spin" />
            <div>
              <p className="text-xs font-bold text-blue-900">AI Parsing in progress...</p>
              <p className="text-[11px] text-blue-700">Identifying produce items, quantities, and customer profile.</p>
            </div>
          </div>
        )}

        {/* Extracted Preview */}
        {extractedData && (
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 animate-fade-in space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">
                  Extracted {extractedData.items.length} Line Items
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800">
                Customer: {extractedData.customer?.name}
              </span>
            </div>

            <div className="max-h-36 overflow-y-auto rounded-lg border border-emerald-200/60 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 sticky top-0">
                  <tr>
                    <th className="p-2">Product</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {extractedData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium text-slate-800">{item.description}</td>
                      <td className="p-2 text-center text-slate-600">{item.quantity} {item.unit}</td>
                      <td className="p-2 text-right text-slate-600">{formatCurrency(item.rate)}</td>
                      <td className="p-2 text-right font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
