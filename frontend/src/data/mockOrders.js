export const initialDailyOrders = [
  {
    id: 'ORD-2026-10-05-01',
    customerId: 'CUST-001',
    customerName: 'Green Valley Restaurant',
    date: '2026-10-05',
    status: 'Confirmed',
    items: [
      { productId: 'PROD-001', name: 'Vine Tomatoes', quantity: 5, unit: 'kg' },
      { productId: 'PROD-002', name: 'King Edward Potatoes', quantity: 20, unit: 'kg' },
      { productId: 'PROD-003', name: 'Spanish Brown Onions', quantity: 12, unit: 'kg' },
      { productId: 'PROD-004', name: 'Crisp Iceberg Lettuce', quantity: 8, unit: 'units' },
      { productId: 'PROD-005', name: 'English Cucumbers', quantity: 10, unit: 'units' },
    ]
  },
  {
    id: 'ORD-2026-10-05-02',
    customerId: 'CUST-002',
    customerName: 'The Fresh Kitchen',
    date: '2026-10-05',
    status: 'Confirmed',
    items: [
      { productId: 'PROD-001', name: 'Vine Tomatoes', quantity: 10, unit: 'kg' },
      { productId: 'PROD-002', name: 'King Edward Potatoes', quantity: 22, unit: 'kg' },
      { productId: 'PROD-003', name: 'Spanish Brown Onions', quantity: 16, unit: 'kg' },
      { productId: 'PROD-004', name: 'Crisp Iceberg Lettuce', quantity: 10, unit: 'units' },
      { productId: 'PROD-006', name: 'Mixed Bell Peppers (Red/Yellow)', quantity: 8, unit: 'kg' },
      { productId: 'PROD-008', name: 'Portobello Mushrooms', quantity: 6, unit: 'kg' },
    ]
  },
  {
    id: 'ORD-2026-10-05-03',
    customerId: 'CUST-003',
    customerName: 'Riverside Cafe',
    date: '2026-10-05',
    status: 'Confirmed',
    items: [
      { productId: 'PROD-004', name: 'Crisp Iceberg Lettuce', quantity: 6, unit: 'units' },
      { productId: 'PROD-005', name: 'English Cucumbers', quantity: 8, unit: 'units' },
      { productId: 'PROD-007', name: 'Fresh Washed Carrots', quantity: 15, unit: 'kg' },
      { productId: 'PROD-010', name: 'Avocados (Ready to Eat)', quantity: 3, unit: 'boxes (18ct)' },
    ]
  },
  {
    id: 'ORD-2026-10-05-04',
    customerId: 'CUST-005',
    customerName: 'Bella Bistro',
    date: '2026-10-05',
    status: 'Confirmed',
    items: [
      { productId: 'PROD-001', name: 'Vine Tomatoes', quantity: 8, unit: 'kg' },
      { productId: 'PROD-009', name: 'Fresh Basil Bunches', quantity: 12, unit: 'bunches' },
      { productId: 'PROD-008', name: 'Portobello Mushrooms', quantity: 8, unit: 'kg' },
      { productId: 'PROD-011', name: 'Extra Virgin Olive Oil 5L', quantity: 2, unit: 'tins' },
    ]
  }
];

// Initial purchase fulfillment status for today's aggregated products
export const initialPurchasedFulfillment = {
  'Vine Tomatoes': 15, // 5+10+8=23 needed, 15 purchased, 8 remaining
  'King Edward Potatoes': 30, // 20+22=42 needed, 30 purchased, 12 remaining
  'Spanish Brown Onions': 28, // 12+16=28 needed, 28 purchased, 0 remaining (Purchased)
  'Crisp Iceberg Lettuce': 24, // 8+10+6=24 needed, 24 purchased, 0 remaining (Purchased)
  'English Cucumbers': 18, // 10+8=18 needed, 18 purchased, 0 remaining (Purchased)
  'Mixed Bell Peppers (Red/Yellow)': 8, // 8 needed, 8 purchased (Purchased)
  'Fresh Washed Carrots': 15, // 15 needed, 15 purchased (Purchased)
  'Portobello Mushrooms': 10, // 6+8=14 needed, 10 purchased, 4 remaining
  'Fresh Basil Bunches': 12, // 12 needed, 12 purchased (Purchased)
  'Avocados (Ready to Eat)': 0, // 3 needed, 0 purchased, 3 remaining
  'Extra Virgin Olive Oil 5L': 2, // 2 needed, 2 purchased (Purchased)
};
