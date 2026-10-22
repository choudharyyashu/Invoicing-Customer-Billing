# Invoicing-Customer-Billing

LedgerFlow Wholesale Produce Invoicing, Customer Billing, Fleet Routes & Accounting ERP System.

## Overview
A comprehensive wholesale management platform tailored for B2B food, produce, and goods distribution:
- **Invoicing & Billing**: Wholesale VAT invoicing, payment terms, PDF export & print.
- **Customer Ledger & Portals**: Live outstanding balances, statements, payment tracking, customer portal.
- **Daily Orders & Market Procurement**: Daily restaurant order intake and morning market procurement fulfillment.
- **Fleet & Mileage Management**: Van route scheduling, HMRC mileage tracking (£0.45/mile), fuel/vehicle expenses.
- **Purchases & Cashflow**: Supplier bills, general accounting transactions, and real-time P&L reporting.
- **Live FX Multi-Currency**: Dynamic currency conversion engine powered by open.er-api.com.

## Architecture
- **Frontend**: React, Vite, Lucide Icons, Modern responsive UI
- **Backend**: Node.js, Express, Prisma ORM, JWT authentication
- **Database**: MySQL (`ledgerflow_db.sql` schema and initial records included)

## Getting Started

### 1. Database Setup
Import `ledgerflow_db.sql` into MySQL:
```bash
mysql -u root -p ledgerflow_db < ledgerflow_db.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
