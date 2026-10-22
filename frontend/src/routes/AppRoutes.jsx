import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { RoleGuard } from '../components/auth/RoleGuard';

import { Login } from '../pages/auth/Login';
import { Dashboard } from '../pages/Dashboard';
import { Invoices } from '../pages/invoices/Invoices';
import { CreateInvoice } from '../pages/invoices/CreateInvoice';
import { InvoiceDetails } from '../pages/invoices/InvoiceDetails';
import { Customers } from '../pages/customers/Customers';
import { CustomerDetails } from '../pages/customers/CustomerDetails';
import { Payments } from '../pages/payments/Payments';
import { Statements } from '../pages/statements/Statements';
import { DailyOrders } from '../pages/orders/DailyOrders';
import { Purchases } from '../pages/purchases/Purchases';
import { IncomeExpenses } from '../pages/accounting/IncomeExpenses';
import { VAT } from '../pages/accounting/VAT';
import { Reports } from '../pages/reports/Reports';
import { Settings } from '../pages/settings/Settings';
import { CustomerPortal } from '../pages/portal/CustomerPortal';
import { MileagePage } from '../pages/mileage/MileagePage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Default Landing: Fullscreen Authentication */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Main SaaS Application Shell */}
      <Route element={<AppLayout />}>
        {/* Customer Self-Service Portal (Customer Role Only) */}
        <Route
          path="/portal"
          element={
            <RoleGuard allowedRoles={['customer']}>
              <CustomerPortal />
            </RoleGuard>
          }
        />

        {/* Executive & Operational Dashboard (Admin & Accountant) */}
        <Route
          path="/dashboard"
          element={
            <RoleGuard allowedRoles={['admin', 'accountant']}>
              <Dashboard />
            </RoleGuard>
          }
        />

        {/* Invoicing (Admin & Accountant view; Admin create) */}
        <Route
          path="/invoices"
          element={
            <RoleGuard allowedRoles={['admin', 'accountant']}>
              <Invoices />
            </RoleGuard>
          }
        />
        <Route
          path="/invoices/create"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <CreateInvoice />
            </RoleGuard>
          }
        />
        <Route
          path="/invoices/:id"
          element={
            <RoleGuard allowedRoles={['admin', 'accountant']}>
              <InvoiceDetails />
            </RoleGuard>
          }
        />

        {/* Customer Directory & Profiles (Admin & Accountant) */}
        <Route
          path="/customers"
          element={
            <RoleGuard allowedRoles={['admin', 'accountant']}>
              <Customers />
            </RoleGuard>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <RoleGuard allowedRoles={['admin', 'accountant']}>
              <CustomerDetails />
            </RoleGuard>
          }
        />

        {/* Payments & Statements (Admin & Accountant) */}
        <Route
          path="/payments"
          element={
            <RoleGuard allowedRoles={['admin', 'accountant']}>
              <Payments />
            </RoleGuard>
          }
        />
        <Route
          path="/statements"
          element={
            <RoleGuard allowedRoles={['admin', 'accountant']}>
              <Statements />
            </RoleGuard>
          }
        />

        {/* Daily Operations & Purchasing (Admin Role Only) */}
        <Route
          path="/orders"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <DailyOrders />
            </RoleGuard>
          }
        />
        <Route
          path="/purchases"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <Purchases />
            </RoleGuard>
          }
        />
        <Route
          path="/mileage"
          element={
            <RoleGuard allowedRoles={['admin', 'accountant']}>
              <MileagePage />
            </RoleGuard>
          }
        />

        {/* Accounting & Tax (Admin & Accountant) */}
        <Route
          path="/accounting/income-expenses"
          element={
            <RoleGuard allowedRoles={['admin', 'accountant']}>
              <IncomeExpenses />
            </RoleGuard>
          }
        />
        <Route
          path="/accounting/vat"
          element={
            <RoleGuard allowedRoles={['admin', 'accountant']}>
              <VAT />
            </RoleGuard>
          }
        />
        <Route
          path="/reports"
          element={
            <RoleGuard allowedRoles={['admin', 'accountant']}>
              <Reports />
            </RoleGuard>
          }
        />

        {/* Settings (Admin Role Only) */}
        <Route
          path="/settings"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <Settings />
            </RoleGuard>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
};
