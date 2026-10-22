# Invoicing-Customer-Billing (LedgerFlow ERP)

> **Enterprise-grade Wholesale Produce Invoicing, Customer Billing, Fleet Fleet & Accounting Management ERP Suite.**

[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express_5-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma_6-darkblue.svg)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/Database-MySQL_/_MariaDB-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Proprietary-lightgrey.svg)]()

---

## 📋 Overview

**LedgerFlow (Invoicing-Customer-Billing)** is an integrated B2B wholesale management platform built specifically for fresh produce suppliers, food service distributors, and wholesale merchants. It automates the complete operational workflow from morning restaurant order intake and Spitalfields/New Covent Garden market procurement to delivery van fleet routing, tax-compliant invoicing, and live financial accounting.

---

## 🚀 Key Modules & Capabilities

### 1. 🧾 Wholesale Invoicing & Billing
- **Sequential Invoicing**: Concurrency-safe sequential numbering (`INV-2026-xxx`).
- **Flexible VAT Handling**: UK tax compliant supporting 20% standard rate and 0% produce zero-rated rules.
- **Invoice Lifecycle**: Full Draft $\rightarrow$ Finalize $\rightarrow$ Paid $\rightarrow$ Void audit workflow.
- **Export & Print**: Clean, printable PDF statements and invoice slips.
- **AI Smart Extraction**: Instant free-text order parsing (e.g. from WhatsApp order notes) into line items without requiring paid third-party AI keys.

### 2. 👥 Customer Management & Client Portal
- **Customer Ledger**: Live tracking of total purchases, payments received, and outstanding balances.
- **Role-Based Client Portal**: Restaurant clients can log in independently to review invoice archives, check payment allocations, and download live debit/credit statements.
- **Custom Payment Terms**: Configurable terms per client (Cash, 7 Days, 14 Days Net, 30 Days Net).

### 3. 📦 Daily Morning Orders & Procurement Aggregation
- **Order Collection**: Daily customer intake filtered by delivery van and route.
- **Market Procurement Aggregation**: Automatically combines produce items across all morning customer orders into a single wholesale market buying sheet.
- **Fulfillment Tracking**: Real-time morning market procurement quantity tracking against daily demand.

### 4. 🚐 Van Fleet & Route Distribution
- **Fleet Management**: Delivery vans (Van 1, Van 2, Van 3) assigned to dedicated routes.
- **Mileage Logging**: Daily start and end odometer mileage capture.
- **HMRC Expense Automation**: Automatically computes travel expenses using official mileage rates (£0.45/mile) and syncs directly into the accounting ledger.

### 5. 💳 Payments & Cashflow Accounting
- **Payment Allocation**: Record payments with partial or multi-invoice allocation and unallocated credit balance support.
- **Income & Expense Ledger**: Double-entry financial cashflow tracking with categorical classification.
- **VAT Liability Reports**: Input vs. output tax calculation with real-time VAT liability reporting.

### 6. 💱 Real-Time Multi-Currency FX Engine
- **Live Exchange Rates**: Integrated with `open.er-api.com` for real-time currency conversion (GBP £, USD $, EUR €).
- **Smart Caching**: In-memory and local cache with automatic offline fallback so the application runs without disruption.

### 7. 🔔 Reactive Live Notification Bell
- **Dynamic Database Alerts**: Live counter and popover alerting on overdue invoices, pending draft approvals, daily orders awaiting fulfillment, unallocated payments, and low warehouse stock.
- **Mark as Read**: Reactive state management with instant one-click navigation to relevant records.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, TailwindCSS & Vanilla CSS Design Tokens, Lucide React, Recharts |
| **Backend** | Node.js, Express 5, Prisma ORM 6, JWT, Cookie-Parser, CORS, Zod Validation |
| **Database** | MySQL 8.0+ / MariaDB 10.4+ |
| **Auth** | Secure HTTP-only Cookie + Bearer fallback token with Role-Based Access Control (RBAC) |
| **FX API** | Open Exchange Rates API (`open.er-api.com`) |

---

## 📂 Project Directory Structure

```text
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models & relationships
│   │   ├── migrations/         # Prisma migration history
│   │   └── seed.js             # Initial database seed script
│   ├── src/
│   │   ├── config/             # DB & JWT configurations
│   │   ├── controllers/        # REST API controllers
│   │   ├── middlewares/        # Auth & validation middlewares
│   │   ├── routes/             # Express API route declarations
│   │   ├── utils/              # Token, currency & sequence helpers
│   │   ├── app.js              # Express application setup
│   │   └── server.js           # Server bootstrap & health check
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/                 # Static assets & redirects
│   ├── src/
│   │   ├── components/         # Reusable UI & modal components
│   │   ├── context/            # Global AppContext state management
│   │   ├── pages/              # Invoices, Customers, Orders, Accounting, etc.
│   │   ├── services/           # Backend API clients & FX rate service
│   │   ├── utils/              # Currency & date formatters
│   │   ├── App.jsx             # Main routing & guards
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── ledgerflow_db.sql           # Complete MySQL database export
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [MySQL](https://www.mysql.com/) or [XAMPP](https://www.apachefriends.org/) (Apache & MySQL running)
- Git

---

### Step 1: Database Setup
1. Open phpMyAdmin or your MySQL CLI and create a database:
   ```sql
   CREATE DATABASE ledgerflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Import the included [`ledgerflow_db.sql`](./ledgerflow_db.sql) file:
   ```bash
   mysql -u root -p ledgerflow_db < ledgerflow_db.sql
   ```

---

### Step 2: Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create and configure your `.env` file:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to match your local MySQL credentials:*
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="mysql://root:@localhost:3306/ledgerflow_db"
   FRONTEND_URL="http://localhost:5173"
   JWT_SECRET="your-256-bit-secret-key-here-minimum-32-characters"
   JWT_EXPIRES_IN="7d"
   ```
3. Run the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will be running at `http://localhost:5000`.*

---

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🔑 Demo Access Credentials

The database comes pre-seeded with three distinct role accounts for testing:

| Role | Email Address | Password | Accessible Portals |
|---|---|---|---|
| **Business Owner / Admin** | `admin@freshharvest.co.uk` | `AdminSecurePass2026!` | Complete ERP, Invoicing, Settings, Purchasing & Fleets |
| **Accountant / Auditor** | `accounts@freshharvest.co.uk` | `Accountant2026!` | Invoices, Payments, VAT Returns, Cashflow & Reports |
| **Customer Portal** | `accounts@greenvalley.co.uk` | `Password123!` | Customer Self-Service Portal (Invoices, Receipts, Statements) |

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate user & issue session cookie |
| `GET` | `/api/v1/auth/me` | Fetch active authenticated session |
| `GET` | `/api/v1/customers` | List all wholesale customer accounts |
| `POST` | `/api/v1/invoices` | Create new customer invoice |
| `POST` | `/api/v1/invoices/:id/finalize` | Finalize draft invoice & update ledger |
| `POST` | `/api/v1/payments` | Record customer payment & allocate |
| `GET` | `/api/v1/orders` | List daily morning orders |
| `GET` | `/api/v1/orders/procurement/aggregation` | Aggregated produce procurement sheet |
| `GET` | `/api/v1/mileage` | List van mileage logs |
| `POST` | `/api/v1/purchases` | Create supplier purchase order |
| `GET` | `/api/v1/transactions` | Accounting cashflow transactions |
| `GET` | `/api/v1/settings` | Company & business profile settings |

---

## 🚢 Production Build

To produce an optimized production bundle of the frontend:
```bash
cd frontend
npm run build
```
The compiled static assets will be output to `frontend/dist/`.
In production, run the backend using a process manager such as [PM2](https://pm2.keymetrics.io/):
```bash
cd backend
pm2 start src/server.js --name "ledgerflow-backend"
```
