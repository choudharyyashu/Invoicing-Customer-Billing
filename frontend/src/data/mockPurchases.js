export const initialPurchases = [
  {
    id: 'PUR-2026-034',
    purchaseNumber: 'PUR-2026-034',
    supplierName: 'Covent Garden Wholesale Produce',
    supplierInvoiceNo: 'CGW-99120',
    date: '2026-10-05',
    status: 'Paid',
    items: [
      { id: '1', product: 'Spanish Brown Onions', quantity: 30, unit: 'kg', unitCost: 1.10, vatRate: 0, total: 33.00 },
      { id: '2', product: 'Crisp Iceberg Lettuce', quantity: 24, unit: 'units', unitCost: 0.70, vatRate: 0, total: 16.80 },
      { id: '3', product: 'English Cucumbers', quantity: 20, unit: 'units', unitCost: 0.55, vatRate: 0, total: 11.00 },
      { id: '4', product: 'Fresh Washed Carrots', quantity: 20, unit: 'kg', unitCost: 0.75, vatRate: 0, total: 15.00 },
    ],
    subtotal: 75.80,
    vatAmount: 0.00,
    total: 75.80,
    notes: 'Morning wholesale market collection'
  },
  {
    id: 'PUR-2026-033',
    purchaseNumber: 'PUR-2026-033',
    supplierName: 'Spitalfields Fresh Market Ltd',
    supplierInvoiceNo: 'SFM-44219',
    date: '2026-10-04',
    status: 'Pending',
    items: [
      { id: '1', product: 'King Edward Potatoes', quantity: 100, unit: 'kg', unitCost: 0.90, vatRate: 0, total: 90.00 },
      { id: '2', product: 'Vine Tomatoes', quantity: 40, unit: 'kg', unitCost: 2.10, vatRate: 0, total: 84.00 },
      { id: '3', product: 'Mixed Bell Peppers', quantity: 25, unit: 'kg', unitCost: 2.40, vatRate: 0, total: 60.00 },
    ],
    subtotal: 234.00,
    vatAmount: 0.00,
    total: 234.00,
    notes: 'Payment due on Friday'
  },
  {
    id: 'PUR-2026-032',
    purchaseNumber: 'PUR-2026-032',
    supplierName: 'Mediterranean Imports Direct',
    supplierInvoiceNo: 'MID-7731',
    date: '2026-09-28',
    status: 'Paid',
    items: [
      { id: '1', product: 'Extra Virgin Olive Oil 5L', quantity: 10, unit: 'tins', unitCost: 19.50, vatRate: 20, total: 195.00 },
      { id: '2', product: 'San Marzano Canned Tomatoes (2.5kg)', quantity: 36, unit: 'cans', unitCost: 4.20, vatRate: 20, total: 151.20 },
    ],
    subtotal: 346.20,
    vatAmount: 69.24,
    total: 415.44,
    notes: 'Direct debit cleared'
  },
  {
    id: 'PUR-2026-031',
    purchaseNumber: 'PUR-2026-031',
    supplierName: 'Kent Valley Farms',
    supplierInvoiceNo: 'KVF-1029',
    date: '2026-09-22',
    status: 'Paid',
    items: [
      { id: '1', product: 'King Edward Potatoes', quantity: 250, unit: 'kg', unitCost: 0.85, vatRate: 0, total: 212.50 },
      { id: '2', product: 'Fresh Washed Carrots', quantity: 150, unit: 'kg', unitCost: 0.70, vatRate: 0, total: 105.00 },
    ],
    subtotal: 317.50,
    vatAmount: 0.00,
    total: 317.50,
    notes: 'Farm direct dispatch'
  },
  {
    id: 'PUR-2026-030',
    purchaseNumber: 'PUR-2026-030',
    supplierName: 'Spitalfields Fresh Market Ltd',
    supplierInvoiceNo: 'SFM-43901',
    date: '2026-09-15',
    status: 'Paid',
    items: [
      { id: '1', product: 'Vine Tomatoes', quantity: 60, unit: 'kg', unitCost: 2.05, vatRate: 0, total: 123.00 },
      { id: '2', product: 'Crisp Iceberg Lettuce', quantity: 50, unit: 'units', unitCost: 0.68, vatRate: 0, total: 34.00 },
      { id: '3', product: 'English Cucumbers', quantity: 40, unit: 'units', rate: 0.52, vatRate: 0, total: 20.80 },
    ],
    subtotal: 177.80,
    vatAmount: 0.00,
    total: 177.80,
    notes: 'Paid on collection'
  }
];
