import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { initialDailyOrders, initialPurchasedFulfillment } from '../data/mockOrders';
import { initialPurchases } from '../data/mockPurchases';
import { initialTransactions, initialBusinessSettings } from '../data/mockTransactions';

import {
  authApi,
  customerApi,
  productApi,
  vanApi,
  invoiceApi,
  paymentApi,
  orderApi,
  mileageApi,
  purchaseApi,
  settingApi,
  transactionApi,
} from '../services/api';
import { setActiveCurrency, getCurrencySymbol, formatCurrency, setBaseCurrency } from '../utils/formatCurrency';
import { fetchExchangeRates, convertCurrency, getExchangeRate } from '../services/exchangeRateService';

const AppContext = createContext();

export const initialMileages = [
  {
    id: 'MIL-2026-001',
    date: '2026-10-05',
    vehicle: 'Van 1 (Ford Transit - LN72 XRT)',
    startMileage: 42150,
    endMileage: 42218,
    distance: 68,
    distanceUnit: 'miles',
    purpose: 'Morning Spitalfields market wholesale collection and city restaurant deliveries',
    rate: 0.45,
    estimatedExpense: 30.60,
    recordedInExpenses: true,
    expenseId: 'TXN-2026-001',
    createdAt: '2026-10-05',
  },
  {
    id: 'MIL-2026-002',
    date: '2026-10-06',
    vehicle: 'Van 2 (Mercedes Sprinter - RO23 FHK)',
    startMileage: 28410,
    endMileage: 28464,
    distance: 54,
    distanceUnit: 'miles',
    purpose: 'West London deli & bistro route replenishment run',
    rate: 0.45,
    estimatedExpense: 24.30,
    recordedInExpenses: false,
    createdAt: '2026-10-06',
  },
];

export const AppProvider = ({ children }) => {
  // Real Backend Data States (Customers, Products, Vans)
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [vans, setVans] = useState([]);

  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isVansLoading, setIsVansLoading] = useState(false);

  const [customersError, setCustomersError] = useState(null);
  const [productsError, setProductsError] = useState(null);
  const [vansError, setVansError] = useState(null);

  // Real Backend Data States (Invoices & Payments)
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const [isInvoicesLoading, setIsInvoicesLoading] = useState(false);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);

  const [invoicesError, setInvoicesError] = useState(null);
  const [paymentsError, setPaymentsError] = useState(null);

  // Real Backend Data States (Daily Orders & Mileage)
  const [isDailyOrdersLoading, setIsDailyOrdersLoading] = useState(false);
  const [dailyOrdersError, setDailyOrdersError] = useState(null);
  const [isMileagesLoading, setIsMileagesLoading] = useState(false);
  const [mileagesError, setMileagesError] = useState(null);

  // Real Backend Data States (Purchases & Suppliers)
  const [isPurchasesLoading, setIsPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [isSuppliersLoading, setIsSuppliersLoading] = useState(false);

  const [dailyOrders, setDailyOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('lf_daily_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((o) => !o.id?.startsWith('ORD-2026-10-05-'));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('lf_daily_orders', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [mileages, setMileages] = useState(() => {
    try {
      const saved = localStorage.getItem('lf_mileages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((m) => !m.id?.startsWith('MIL-2026-00'));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('lf_mileages', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [purchasedFulfillment, setPurchasedFulfillment] = useState(() => {
    try {
      const saved = localStorage.getItem('lf_fulfillment');
      if (saved) {
        const daily = localStorage.getItem('lf_daily_orders');
        if (!daily || daily === '[]') {
          localStorage.removeItem('lf_fulfillment');
          return {};
        }
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [purchases, setPurchases] = useState(() => {
    try {
      const saved = localStorage.getItem('lf_purchases');
      if (saved !== null && saved !== '') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((p) => !p.purchaseNumber?.startsWith('PUR-MOCK-'));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('lf_purchases', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('lf_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((t) => !t.id?.startsWith('TXN-2026-'));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('lf_transactions', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [businessSettings, setBusinessSettings] = useState(() => {
    const saved = localStorage.getItem('lf_settings');
    const settings = saved ? JSON.parse(saved) : initialBusinessSettings;
    if (settings?.currency) {
      setActiveCurrency(settings.currency);
    }
    return settings;
  });

  // Exchange Rates State (open.er-api.com)
  const [exchangeRatesData, setExchangeRatesData] = useState(null);
  const [isRatesLoading, setIsRatesLoading] = useState(false);

  const refreshExchangeRates = useCallback(async (force = false) => {
    try {
      setIsRatesLoading(true);
      const data = await fetchExchangeRates(force);
      setExchangeRatesData(data);
      return data;
    } catch (err) {
      console.warn('Failed to fetch exchange rates:', err);
    } finally {
      setIsRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (businessSettings?.currency) {
      setActiveCurrency(businessSettings.currency);
    }
  }, [businessSettings?.currency]);

  useEffect(() => {
    refreshExchangeRates(false);
  }, [refreshExchangeRates]);

  // User & Authentication Role State (Server-driven session)
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Synchronized user ref for stable callbacks without effect dependency loops
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const currentRole = currentUser?.role || null;

  // Backend Data Loaders (memoized with stable references)
  const loadCustomers = useCallback(async (userOverride) => {
    const user = userOverride || currentUserRef.current;
    if (!user) return;
    try {
      setIsCustomersLoading(true);
      setCustomersError(null);
      if (user.role === 'customer') {
        if (user.customerId) {
          const res = await customerApi.getById(user.customerId);
          if (res?.data) {
            const c = res.data;
            setCustomers([{
              ...c,
              totalPurchases: parseFloat(c.totalPurchases) || 0,
              totalPaid: parseFloat(c.totalPaid) || 0,
              outstandingBalance: c.outstandingBalance !== undefined
                ? parseFloat(c.outstandingBalance)
                : (parseFloat(c.openingBalance) || 0),
            }]);
          }
        }
      } else {
        const res = await customerApi.list({ limit: 100 });
        if (res?.data) {
          setCustomers(res.data.map((c) => ({
            ...c,
            totalPurchases: parseFloat(c.totalPurchases) || 0,
            totalPaid: parseFloat(c.totalPaid) || 0,
            outstandingBalance: c.outstandingBalance !== undefined
              ? parseFloat(c.outstandingBalance)
              : (parseFloat(c.openingBalance) || 0),
          })));
        }
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      setCustomersError(err.message || 'Failed to load customers');
    } finally {
      setIsCustomersLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setIsProductsLoading(true);
      setProductsError(null);
      const res = await productApi.list({ limit: 100, includeInactive: false });
      if (res?.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setProductsError(err.message || 'Failed to load products');
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  const loadVans = useCallback(async () => {
    try {
      setIsVansLoading(true);
      setVansError(null);
      const res = await vanApi.list();
      if (res?.data) {
        setVans(res.data);
      }
    } catch (err) {
      console.error('Failed to load delivery vans:', err);
      setVansError(err.message || 'Failed to load vans');
    } finally {
      setIsVansLoading(false);
    }
  }, []);

  const loadInvoices = useCallback(async () => {
    try {
      setIsInvoicesLoading(true);
      setInvoicesError(null);
      const res = await invoiceApi.list({ limit: 100 });
      if (res?.data) {
        const normalized = res.data.map((inv) => ({
          ...inv,
          customerName: inv.customer?.name || inv.customerName || 'Customer',
          customerEmail: inv.customer?.email || inv.customerEmail || '',
          customerAddress: inv.customer?.address || inv.customerAddress || '',
          subtotal: parseFloat(inv.subtotal) || 0,
          vatAmount: parseFloat(inv.vatAmount) || 0,
          discountAmount: parseFloat(inv.discountAmount) || 0,
          total: parseFloat(inv.total) || 0,
          amountPaid: parseFloat(inv.amountPaid) || 0,
          balanceDue: parseFloat(inv.balanceDue) || 0,
          items: inv.items
            ? inv.items.map((it) => ({
                ...it,
                rate: parseFloat(it.unitPrice ?? it.rate) || 0,
                unitPrice: parseFloat(it.unitPrice ?? it.rate) || 0,
                amount: parseFloat(it.total ?? it.subtotal ?? it.amount ?? ((parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice ?? it.rate) || 0))) || 0,
              }))
            : [],
        }));
        setInvoices(normalized);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
      setInvoicesError(err.data?.message || err.message || 'Failed to load invoices');
    } finally {
      setIsInvoicesLoading(false);
    }
  }, []);

  const loadPayments = useCallback(async () => {
    try {
      setIsPaymentsLoading(true);
      setPaymentsError(null);
      const res = await paymentApi.list({ limit: 100 });
      if (res?.data) {
        const normalized = res.data.map((p) => {
          const invNumber = p.allocations?.map((a) => a.invoice?.invoiceNumber).filter(Boolean).join(', ') || p.invoiceNumber || '';
          const invId = p.allocations?.[0]?.invoice?.id || p.invoiceId || null;
          return {
            ...p,
            id: p.paymentNumber || p.id,
            realId: p.id,
            customerName: p.customer?.name || p.customerName || 'Customer',
            invoiceNumber: invNumber,
            invoiceId: invId,
            date: p.paymentDate ? p.paymentDate.split('T')[0] : p.date,
            method: p.paymentMethod || p.method || 'Bank Transfer',
            amount: parseFloat(p.amount) || 0,
            status: p.status || 'Completed',
          };
        });
        setPayments(normalized);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
      setPaymentsError(err.data?.message || err.message || 'Failed to load payments');
    } finally {
      setIsPaymentsLoading(false);
    }
  }, []);

  const loadDailyOrders = useCallback(async () => {
    try {
      setIsDailyOrdersLoading(true);
      setDailyOrdersError(null);
      const res = await orderApi.list({ limit: 100 });
      if (res?.data?.orders) {
        const normalized = res.data.orders.map((o) => ({
          id: o.orderNumber || o.id,
          realId: o.id,
          orderNumber: o.orderNumber,
          customerId: o.customerId,
          customerName: o.customerName || o.customer?.name || 'Customer',
          vanId: o.vanId || 'van1',
          date: o.orderDate ? (o.orderDate.includes('T') ? o.orderDate.split('T')[0] : o.orderDate) : o.date,
          status: o.status || 'Confirmed',
          notes: o.notes,
          items: (o.items || []).map((it) => ({
            id: it.id,
            productId: it.productId,
            name: it.name,
            quantity: parseFloat(it.quantity) || 0,
            unit: it.unit || 'kg',
            unitPrice: it.unitPrice !== null && it.unitPrice !== undefined ? parseFloat(it.unitPrice) : null,
          })),
        }));
        setDailyOrders(normalized);
      }
    } catch (err) {
      console.warn('Backend orders load fallback to local storage:', err);
      setDailyOrdersError(err.data?.message || err.message || 'Failed to load orders from server');
    } finally {
      setIsDailyOrdersLoading(false);
    }
  }, []);

  const loadMileages = useCallback(async () => {
    try {
      setIsMileagesLoading(true);
      setMileagesError(null);
      const res = await mileageApi.list({ limit: 100 });
      if (res?.data?.mileages) {
        const normalized = res.data.mileages.map((m) => ({
          id: m.mileageNumber || m.id,
          realId: m.id,
          date: m.date ? (m.date.includes('T') ? m.date.split('T')[0] : m.date) : m.date,
          vehicle: m.vehicle || (m.van ? `${m.van.name} (${m.van.vehicle})` : 'Vehicle'),
          vanId: m.vanId,
          startMileage: parseFloat(m.startMileage) || 0,
          endMileage: parseFloat(m.endMileage) || 0,
          distance: parseFloat(m.distance) || 0,
          distanceUnit: m.distanceUnit || 'miles',
          purpose: m.purpose || 'Business Journey',
          rate: m.rate !== null && m.rate !== undefined ? parseFloat(m.rate) : null,
          estimatedExpense: m.estimatedExpense !== null && m.estimatedExpense !== undefined ? parseFloat(m.estimatedExpense) : null,
          recordedInExpenses: !!m.recordedInExpenses,
          expenseId: m.expenseId,
          expenseNumber: m.expenseNumber,
          notes: m.notes,
          createdAt: m.createdAt,
        }));
        setMileages(normalized);
      }
    } catch (err) {
      console.warn('Backend mileage load fallback to local storage:', err);
      setMileagesError(err.data?.message || err.message || 'Failed to load mileages from server');
    } finally {
      setIsMileagesLoading(false);
    }
  }, []);

  const loadPurchases = useCallback(async () => {
    try {
      setIsPurchasesLoading(true);
      setPurchasesError(null);
      const res = await purchaseApi.list({ limit: 100 });
      if (res?.data) {
        const normalized = res.data.map((p) => ({
          ...p,
          id: p.purchaseNumber || p.id,
          realId: p.id,
          subtotal: parseFloat(p.subtotal) || 0,
          vatAmount: parseFloat(p.vatAmount) || 0,
          total: parseFloat(p.total) || 0,
          items: (p.items || []).map((it) => ({
            ...it,
            quantity: parseFloat(it.quantity) || 0,
            unitCost: parseFloat(it.unitCost) || 0,
            vatRate: parseFloat(it.vatRate) || 0,
            vatAmount: parseFloat(it.vatAmount) || 0,
            total: parseFloat(it.total) || 0,
          })),
        }));
        setPurchases(normalized);
      }
    } catch (err) {
      console.error('Failed to load purchases from API:', err);
      setPurchasesError(err.message || 'Failed to load purchases');
      // Local storage fallback: retain existing local purchases if server call fails
      try {
        const saved = localStorage.getItem('lf_purchases');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPurchases(parsed);
          }
        }
      } catch (e) {
        // ignore
      }
    } finally {
      setIsPurchasesLoading(false);
    }
  }, []);

  const loadSuppliers = useCallback(async () => {
    try {
      setIsSuppliersLoading(true);
      const res = await purchaseApi.listSuppliers();
      if (res?.data) {
        setSuppliers(res.data);
      }
    } catch (err) {
      console.warn('Failed to load suppliers:', err);
    } finally {
      setIsSuppliersLoading(false);
    }
  }, []);

  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState(null);

  const loadBusinessSettings = useCallback(async () => {
    try {
      setIsSettingsLoading(true);
      setSettingsError(null);
      const res = await settingApi.get();
      if (res?.data) {
        setBusinessSettings(res.data);
        if (res.data.currency) {
          setActiveCurrency(res.data.currency);
        }
      }
    } catch (err) {
      console.warn('Failed to load business settings from MySQL:', err);
      setSettingsError(err.data?.message || err.message || 'Failed to load settings');
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  const updateBusinessSettings = async (newSettings) => {
    try {
      const payload = {
        ...newSettings,
        currencySymbol: newSettings.currencySymbol || getCurrencySymbol(newSettings.currency),
      };
      const res = await settingApi.update(payload);
      if (res?.data) {
        setBusinessSettings(res.data);
        if (res.data.currency) {
          setActiveCurrency(res.data.currency);
        }
        showToast('Settings saved to MySQL database!');
        return res.data;
      }
    } catch (err) {
      console.error('Failed to update business settings on server:', err);
      const fallback = {
        ...newSettings,
        currencySymbol: newSettings.currencySymbol || getCurrencySymbol(newSettings.currency),
      };
      setBusinessSettings(fallback);
      if (fallback.currency) {
        setActiveCurrency(fallback.currency);
      }
      showToast(err.data?.message || 'Server error updating settings; saved locally', 'warning');
      throw err;
    }
  };

  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);

  const loadTransactions = useCallback(async (params = {}) => {
    try {
      setIsTransactionsLoading(true);
      setTransactionsError(null);
      const res = await transactionApi.list(params);
      if (res?.data) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.warn('Failed to load transactions from MySQL:', err);
      setTransactionsError(err.data?.message || err.message || 'Failed to load transactions');
    } finally {
      setIsTransactionsLoading(false);
    }
  }, []);

  const loadPurchasedFulfillment = useCallback(async (targetDate) => {
    try {
      const dateStr = targetDate || new Date().toISOString().split('T')[0];
      const res = await orderApi.getFulfillment({ date: dateStr });
      if (res?.data?.fulfillment) {
        const mapped = {};
        Object.entries(res.data.fulfillment).forEach(([prod, val]) => {
          mapped[prod] = val.purchasedQty;
        });
        setPurchasedFulfillment(mapped);
      }
    } catch (err) {
      console.warn('Failed to load procurement fulfillment from server:', err);
    }
  }, []);

  // Verify server session on application startup (executes once on mount)
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      try {
        setIsAuthLoading(true);
        const res = await authApi.getMe();
        if (isMounted && res && res.user) {
          currentUserRef.current = res.user;
          setCurrentUser(res.user);
          loadCustomers(res.user);
          loadProducts();
          loadVans();
          loadInvoices();
          loadPayments();
          loadDailyOrders();
          loadMileages();
          loadPurchases();
          loadSuppliers();
          loadBusinessSettings();
          loadTransactions();
          loadPurchasedFulfillment();
        } else if (isMounted) {
          currentUserRef.current = null;
          setCurrentUser(null);
        }
      } catch (err) {
        if (isMounted) {
          console.debug('No active session on mount:', err?.message || err);
          currentUserRef.current = null;
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, [
    loadCustomers,
    loadProducts,
    loadVans,
    loadInvoices,
    loadPayments,
    loadDailyOrders,
    loadMileages,
    loadPurchases,
    loadSuppliers,
    loadBusinessSettings,
    loadTransactions,
    loadPurchasedFulfillment,
  ]);

  // UI helpers: Toasts and Global Search Modal
  const [toasts, setToasts] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync business data to local storage (Excludes authentication tokens and real API-backed entities: customers, products, vans, invoices, payments, purchases)
  useEffect(() => { localStorage.setItem('lf_daily_orders', JSON.stringify(dailyOrders)); }, [dailyOrders]);
  useEffect(() => { localStorage.setItem('lf_fulfillment', JSON.stringify(purchasedFulfillment)); }, [purchasedFulfillment]);
  // Note: lf_purchases is preserved in localStorage and not overwritten by server state
  useEffect(() => { localStorage.setItem('lf_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('lf_settings', JSON.stringify(businessSettings)); }, [businessSettings]);
  useEffect(() => {
    if (businessSettings?.currency) {
      setActiveCurrency(businessSettings.currency);
    }
  }, [businessSettings?.currency]);
  useEffect(() => { localStorage.setItem('lf_mileages', JSON.stringify(mileages)); }, [mileages]);

  // Real Server Authentication Methods
  const loginUser = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res && res.user) {
      currentUserRef.current = res.user;
      setCurrentUser(res.user);
      loadCustomers(res.user);
      loadProducts();
      loadVans();
      loadInvoices();
      loadPayments();
      loadDailyOrders();
      loadMileages();
      loadPurchases();
      loadSuppliers();
      loadBusinessSettings();
      loadTransactions();
      loadPurchasedFulfillment();
      return res.user;
    }
    throw new Error('Authentication response did not contain user data.');
  };

  const logoutUser = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Backend logout request encountered an error, clearing client session:', err);
    } finally {
      currentUserRef.current = null;
      setCurrentUser(null);
      setCustomers([]);
      setProducts([]);
      setVans([]);
      setInvoices([]);
      setPayments([]);
      setDailyOrders([]);
      setMileages([]);
      setPurchases([]);
      setSuppliers([]);
    }
  };


  // Toast notifier
  const showToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real Backend Customer Actions
  const addCustomer = async (customerData) => {
    try {
      const payload = {
        name: customerData.name?.trim(),
        contactPerson: customerData.contactPerson?.trim() || null,
        email: customerData.email?.trim() || null,
        phone: customerData.phone?.trim() || null,
        address: customerData.address?.trim() || null,
        vatNumber: customerData.vatNumber?.trim() || null,
        paymentTerms: parseInt(customerData.paymentTerms, 10) || 14,
        status: customerData.status || 'Active',
        openingBalance: customerData.openingBalance !== '' ? Math.max(0, parseFloat(customerData.openingBalance) || 0) : 0,
        vanId: customerData.vanId || null,
        notes: customerData.notes?.trim() || null,
      };

      const res = await customerApi.create(payload);
      const newCust = {
        ...res.data,
        totalPurchases: 0,
        totalPaid: 0,
        outstandingBalance: parseFloat(res.data.openingBalance) || 0,
      };
      setCustomers((prev) => [newCust, ...prev.filter((c) => c.id !== newCust.id)]);
      showToast(`Customer "${newCust.name}" added successfully!`);
      return newCust;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to create customer';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const updateCustomer = async (id, updatedFields) => {
    try {
      const payload = {
        ...(updatedFields.name ? { name: updatedFields.name.trim() } : {}),
        ...(updatedFields.contactPerson !== undefined ? { contactPerson: updatedFields.contactPerson?.trim() || null } : {}),
        ...(updatedFields.email !== undefined ? { email: updatedFields.email?.trim() || null } : {}),
        ...(updatedFields.phone !== undefined ? { phone: updatedFields.phone?.trim() || null } : {}),
        ...(updatedFields.address !== undefined ? { address: updatedFields.address?.trim() || null } : {}),
        ...(updatedFields.vatNumber !== undefined ? { vatNumber: updatedFields.vatNumber?.trim() || null } : {}),
        ...(updatedFields.paymentTerms !== undefined ? { paymentTerms: parseInt(updatedFields.paymentTerms, 10) || 0 } : {}),
        ...(updatedFields.status ? { status: updatedFields.status } : {}),
        ...(updatedFields.openingBalance !== undefined ? { openingBalance: Math.max(0, parseFloat(updatedFields.openingBalance) || 0) } : {}),
        ...(updatedFields.vanId !== undefined ? { vanId: updatedFields.vanId || null } : {}),
        ...(updatedFields.notes !== undefined ? { notes: updatedFields.notes?.trim() || null } : {}),
      };

      const res = await customerApi.update(id, payload);
      const updatedCust = res.data;
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updatedCust,
                outstandingBalance: updatedCust.openingBalance !== undefined
                  ? parseFloat(updatedCust.openingBalance) || 0
                  : c.outstandingBalance,
              }
            : c
        )
      );
      showToast('Customer details updated');
      return updatedCust;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to update customer';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const deleteCustomer = async (id, { hard = false } = {}) => {
    try {
      const cust = customers.find((c) => c.id === id);
      const res = await customerApi.delete(id, { hard });
      if (hard) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        showToast(res.message || `Customer "${cust?.name || id}" permanently deleted`, 'info');
      } else {
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: 'Inactive' } : c))
        );
        showToast(res.message || `Customer "${cust?.name || id}" deactivated`, 'info');
      }
      return res;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Cannot delete customer';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Real Backend Product Actions
  const addProduct = async (productData) => {
    try {
      const res = await productApi.create(productData);
      setProducts((prev) => [...prev, res.data]);
      showToast(`Product "${res.data.name}" added to catalog!`);
      return res.data;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to add product';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const res = await productApi.update(id, productData);
      setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      showToast(`Product "${res.data.name}" updated!`);
      return res.data;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to update product';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const deleteProduct = async (id, { hard = false } = {}) => {
    try {
      const res = await productApi.delete(id, { hard });
      if (hard) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: false } : p)));
      }
      showToast(res.message || 'Product removed from catalog', 'info');
      return res;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Cannot delete product';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Real Backend Delivery Van Actions
  const addVan = async (vanData) => {
    try {
      const res = await vanApi.create(vanData);
      setVans((prev) => [...prev, res.data]);
      showToast(`Delivery Van "${res.data.name}" created!`);
      return res.data;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to create van';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const updateVan = async (id, vanData) => {
    try {
      const res = await vanApi.update(id, vanData);
      setVans((prev) => prev.map((v) => (v.id === id ? res.data : v)));
      showToast(`Delivery Van "${res.data.name}" updated!`);
      return res.data;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to update van';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const deleteVan = async (id) => {
    try {
      const res = await vanApi.delete(id);
      setVans((prev) => prev.filter((v) => v.id !== id));
      showToast(res.message || 'Delivery Van deleted', 'info');
      return res;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Cannot delete van';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Real Backend Invoice Actions
  const createInvoice = async (invoiceData) => {
    try {
      const payload = {
        customerId: invoiceData.customerId,
        issueDate: invoiceData.issueDate ? invoiceData.issueDate.split('T')[0] : undefined,
        dueDate: invoiceData.dueDate ? invoiceData.dueDate.split('T')[0] : undefined,
        reference: invoiceData.reference?.trim() || undefined,
        status: invoiceData.status === 'Draft' ? 'Draft' : 'Sent',
        discountAmount: Math.max(0, parseFloat(invoiceData.discountAmount) || 0),
        notes: invoiceData.notes?.trim() || null,
        items: (invoiceData.items || []).map((item) => ({
          productId: item.productId || (products.find((p) => p.name === item.description)?.id) || null,
          description: item.description?.trim() || 'Item',
          quantity: Math.max(0.01, parseFloat(item.quantity) || 1),
          unit: item.unit?.trim() || 'kg',
          unitPrice: Math.max(0, parseFloat(item.rate ?? item.unitPrice) || 0),
          vatRate: Math.max(0, parseFloat(item.vatRate) || 0),
        })),
      };

      const res = await invoiceApi.create(payload);
      const createdInvoice = res.data;

      // If an initial payment was specified, record it transactionally
      const initialPaid = parseFloat(invoiceData.amountPaid) || 0;
      if (initialPaid > 0 && createdInvoice?.id) {
        try {
          await paymentApi.create({
            customerId: invoiceData.customerId,
            amount: initialPaid,
            paymentDate: invoiceData.issueDate ? invoiceData.issueDate.split('T')[0] : undefined,
            paymentMethod: invoiceData.paymentMethod || 'Bank Transfer',
            reference: `INIT-${createdInvoice.invoiceNumber}`,
            notes: 'Initial payment recorded during invoice generation',
            allocations: [
              {
                invoiceId: createdInvoice.id,
                amount: initialPaid,
              },
            ],
          });
        } catch (payErr) {
          console.warn('Initial payment creation warning:', payErr);
          showToast('Invoice created, but initial payment could not be allocated automatically.', 'warning');
        }
      }

      // Refresh invoices, payments, and customers from real database
      await Promise.all([loadInvoices(), loadPayments(), loadCustomers()]);

      // If invoice was created from a daily order, mark order as Invoiced in unmigrated orders state
      if (invoiceData.orderId) {
        setDailyOrders((prev) =>
          prev.map((ord) =>
            ord.id === invoiceData.orderId
              ? { ...ord, status: 'Invoiced', invoiceNumber: createdInvoice.invoiceNumber }
              : ord
          )
        );
      }

      showToast(`Invoice ${createdInvoice.invoiceNumber} created successfully!`);
      return createdInvoice;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to create invoice';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const updateInvoice = async (id, updatedData) => {
    try {
      const payload = {};
      if (updatedData.customerId) payload.customerId = updatedData.customerId;
      if (updatedData.issueDate) payload.issueDate = updatedData.issueDate.split('T')[0];
      if (updatedData.dueDate) payload.dueDate = updatedData.dueDate.split('T')[0];
      if (updatedData.reference !== undefined) payload.reference = updatedData.reference;
      if (updatedData.discountAmount !== undefined) payload.discountAmount = Math.max(0, parseFloat(updatedData.discountAmount) || 0);
      if (updatedData.notes !== undefined) payload.notes = updatedData.notes;
      if (updatedData.items) {
        payload.items = updatedData.items.map((item) => ({
          productId: item.productId || (products.find((p) => p.name === item.description)?.id) || null,
          description: item.description?.trim() || 'Item',
          quantity: Math.max(0.01, parseFloat(item.quantity) || 1),
          unit: item.unit?.trim() || 'kg',
          unitPrice: Math.max(0, parseFloat(item.rate ?? item.unitPrice) || 0),
          vatRate: Math.max(0, parseFloat(item.vatRate) || 0),
        }));
      }

      const res = await invoiceApi.update(id, payload);
      await Promise.all([loadInvoices(), loadCustomers()]);
      showToast('Draft invoice updated successfully');
      return res.data;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to update invoice';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const finalizeInvoice = async (id) => {
    try {
      const res = await invoiceApi.finalize(id);
      await Promise.all([loadInvoices(), loadCustomers()]);
      showToast(`Invoice ${res.data?.invoiceNumber || id} finalized and issued successfully!`);
      return res.data;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to finalize invoice';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const voidInvoice = async (id, reason) => {
    try {
      const res = await invoiceApi.void(id, reason || 'Invoice voided per management request');
      await Promise.all([loadInvoices(), loadPayments(), loadCustomers()]);
      showToast(res.message || 'Invoice voided successfully', 'info');
      return res.data;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to void invoice';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const deleteInvoice = async (id) => {
    try {
      const res = await invoiceApi.delete(id);
      await Promise.all([loadInvoices(), loadCustomers()]);
      showToast(res.message || 'Draft invoice deleted', 'info');
      return res;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Cannot delete invoice (only draft invoices can be deleted)';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const duplicateInvoice = async (id) => {
    const source = invoices.find((i) => i.id === id || i.invoiceNumber === id);
    if (!source) {
      showToast('Source invoice not found to duplicate', 'warning');
      return null;
    }

    try {
      const cloneData = {
        customerId: source.customerId,
        reference: `${source.reference || 'PO'}-COPY`,
        status: 'Draft',
        notes: source.notes,
        discountAmount: source.discountAmount || 0,
        items: (source.items || []).map((it) => ({
          productId: it.productId,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          rate: it.unitPrice ?? it.rate,
          vatRate: it.vatRate,
        })),
      };

      const created = await createInvoice(cloneData);
      showToast(`Invoice duplicated as draft ${created.invoiceNumber}!`);
      return created;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to duplicate invoice';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Real Backend Payment Recording
  const recordPayment = async (paymentData) => {
    try {
      const amount = Math.max(0.01, parseFloat(paymentData.amount) || 0);
      const payload = {
        customerId: paymentData.customerId,
        amount,
        paymentDate: paymentData.date ? paymentData.date.split('T')[0] : undefined,
        paymentMethod: paymentData.method || 'Bank Transfer',
        reference: paymentData.reference?.trim() || null,
        notes: paymentData.notes?.trim() || null,
        allocations: paymentData.invoiceId
          ? [
              {
                invoiceId: paymentData.invoiceId,
                amount,
              },
            ]
          : [],
      };

      const res = await paymentApi.create(payload);
      await Promise.all([loadInvoices(), loadPayments(), loadCustomers()]);
      showToast(`Payment of ${formatCurrency(amount)} recorded successfully!`);
      return res.data;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to record payment';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const voidPayment = async (id, reason) => {
    try {
      const res = await paymentApi.void(id, reason || 'Payment voided per accounting reconciliation');
      await Promise.all([loadInvoices(), loadPayments(), loadCustomers()]);
      showToast(res.message || 'Payment voided and allocations reversed', 'info');
      return res.data;
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to void payment';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Daily Orders & Purchasing Aggregation Actions
  const addDailyOrder = async (orderData) => {
    try {
      // Find valid customer ID from customers list if customerId wasn't passed directly
      let custId = orderData.customerId;
      if (!custId && orderData.customerName) {
        const matched = customers.find((c) => c.name.toLowerCase() === orderData.customerName.toLowerCase());
        if (matched) custId = matched.id;
      }

      if (custId) {
        const payload = {
          customerId: custId,
          orderDate: orderData.date || new Date().toISOString().split('T')[0],
          vanId: orderData.vanId || null,
          status: 'Confirmed',
          notes: orderData.notes || null,
          items: (orderData.items || []).map((it) => ({
            productId: it.productId || null,
            name: it.name || 'Item',
            quantity: Math.max(0.01, parseFloat(it.quantity) || 1),
            unit: it.unit || 'kg',
            unitPrice: it.unitPrice !== undefined && it.unitPrice !== null ? parseFloat(it.unitPrice) : null,
          })),
        };
        const res = await orderApi.create(payload);
        await loadDailyOrders();
        showToast(`Daily order for "${orderData.customerName || 'customer'}" saved to database!`);
        return res.data;
      }
    } catch (err) {
      console.warn('Order API creation failed:', err);
      showToast(err.data?.message || 'Server error creating order; saved locally as unsynced draft', 'danger');
    }

    // Local fallback with explicit sync status
    const newOrder = {
      id: `ORD-${orderData.date || new Date().toISOString().split('T')[0]}-${String(dailyOrders.length + 1).padStart(2, '0')}`,
      date: orderData.date || new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      syncStatus: 'unsynced',
      isLocalOnly: true,
      ...orderData,
    };
    setDailyOrders((prev) => [newOrder, ...prev]);
    showToast(`Order failed server persistence; stored as Unsynced Local Draft.`, 'danger');
    return newOrder;
  };

  const updatePurchasedQty = async (productName, qty, targetDate) => {
    const dateStr = targetDate || new Date().toISOString().split('T')[0];
    const newQty = Math.max(0, parseFloat(qty) || 0);

    setPurchasedFulfillment((prev) => ({
      ...prev,
      [productName]: newQty,
    }));

    try {
      await orderApi.updateFulfillment({
        date: dateStr,
        fulfillments: [{ productName, purchasedQty: newQty }],
      });
      showToast(`Purchased quantity for "${productName}" saved to database`);
    } catch (err) {
      console.warn('Failed to persist fulfillment to server:', err);
      showToast(`Purchased quantity for "${productName}" saved locally (offline)`, 'warning');
    }
  };

  const markProductAllPurchased = async (productName, totalRequired, targetDate) => {
    const dateStr = targetDate || new Date().toISOString().split('T')[0];

    setPurchasedFulfillment((prev) => ({
      ...prev,
      [productName]: totalRequired,
    }));

    try {
      await orderApi.updateFulfillment({
        date: dateStr,
        fulfillments: [{ productName, purchasedQty: totalRequired, isCompleted: true }],
      });
      showToast(`Marked all ${totalRequired} units of "${productName}" as purchased in database!`);
    } catch (err) {
      console.warn('Failed to persist fulfillment to server:', err);
      showToast(`Marked "${productName}" as purchased locally (offline)`, 'warning');
    }
  };

  const updateDailyOrderStatus = async (orderId, status, invoiceNumber = null) => {
    const target = dailyOrders.find((ord) => ord.id === orderId || ord.realId === orderId);
    if (target?.realId) {
      try {
        await orderApi.update(target.realId, { status });
        await loadDailyOrders();
        return;
      } catch (err) {
        console.warn('Backend order update error, falling back to local state:', err);
      }
    }

    setDailyOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId || ord.realId === orderId
          ? { ...ord, status, ...(invoiceNumber ? { invoiceNumber } : {}) }
          : ord
      )
    );
  };

  // Purchases Actions
  const createPurchase = async (purchaseData) => {
    try {
      const res = await purchaseApi.create(purchaseData);
      const created = res.data;
      const normalized = {
        ...created,
        id: created.purchaseNumber || created.id,
        realId: created.id,
        subtotal: parseFloat(created.subtotal) || 0,
        vatAmount: parseFloat(created.vatAmount) || 0,
        total: parseFloat(created.total) || 0,
        items: (created.items || []).map((it) => ({
          ...it,
          quantity: parseFloat(it.quantity) || 0,
          unitCost: parseFloat(it.unitCost) || 0,
          vatRate: parseFloat(it.vatRate) || 0,
          vatAmount: parseFloat(it.vatAmount) || 0,
          total: parseFloat(it.total) || 0,
        })),
      };

      setPurchases((prev) => [normalized, ...prev.filter((p) => p.realId !== normalized.realId)]);

      // Record in accounting transactions (type: 'Purchase')
      const newTxn = {
        id: `TXN-PUR-${normalized.purchaseNumber || Date.now()}`,
        date: normalized.date,
        type: 'Purchase',
        category: 'Wholesale Produce',
        description: `Purchase from ${normalized.supplierName}`,
        reference: normalized.supplierInvoiceNo || normalized.purchaseNumber,
        customerOrSupplier: normalized.supplierName,
        netAmount: normalized.subtotal,
        vatAmount: normalized.vatAmount,
        grossAmount: normalized.total,
        status: normalized.status === 'Cancelled' ? 'Cancelled' : 'Completed'
      };
      setTransactions((prev) => [newTxn, ...prev]);

      // Refresh suppliers in case a new supplier was created
      loadSuppliers();

      showToast(`Purchase order ${normalized.purchaseNumber} saved successfully!`);
      return normalized;
    } catch (err) {
      console.error('Failed to create purchase:', err);
      const message = err.data?.message || err.message || 'Failed to create purchase';
      showToast(message, 'error');
      throw err;
    }
  };

  const updatePurchase = async (id, updateData) => {
    try {
      const res = await purchaseApi.update(id, updateData);
      const updated = res.data;
      const normalized = {
        ...updated,
        id: updated.purchaseNumber || updated.id,
        realId: updated.id,
        subtotal: parseFloat(updated.subtotal) || 0,
        vatAmount: parseFloat(updated.vatAmount) || 0,
        total: parseFloat(updated.total) || 0,
        items: (updated.items || []).map((it) => ({
          ...it,
          quantity: parseFloat(it.quantity) || 0,
          unitCost: parseFloat(it.unitCost) || 0,
          vatRate: parseFloat(it.vatRate) || 0,
          vatAmount: parseFloat(it.vatAmount) || 0,
          total: parseFloat(it.total) || 0,
        })),
      };

      setPurchases((prev) =>
        prev.map((p) => (p.realId === id || p.id === id || p.purchaseNumber === id ? normalized : p))
      );
      showToast(`Purchase ${normalized.purchaseNumber} updated.`);
      return normalized;
    } catch (err) {
      console.error('Failed to update purchase:', err);
      const message = err.data?.message || err.message || 'Failed to update purchase';
      showToast(message, 'error');
      throw err;
    }
  };

  const deletePurchase = async (id, hard = false) => {
    try {
      await purchaseApi.delete(id, hard);
      if (hard) {
        setPurchases((prev) => prev.filter((p) => p.realId !== id && p.id !== id && p.purchaseNumber !== id));
        setTransactions((prev) => prev.filter((t) => t.reference !== id && !t.id.includes(id)));
        showToast('Purchase permanently deleted.');
      } else {
        const found = purchases.find((p) => p.realId === id || p.id === id || p.purchaseNumber === id);
        const refNum = found?.purchaseNumber || id;
        setPurchases((prev) =>
          prev.map((p) =>
            p.realId === id || p.id === id || p.purchaseNumber === id ? { ...p, status: 'Cancelled' } : p
          )
        );
        setTransactions((prev) =>
          prev.map((t) =>
            t.reference === refNum || t.id === `TXN-PUR-${refNum}` || (found?.supplierInvoiceNo && t.reference === found.supplierInvoiceNo)
              ? { ...t, status: 'Cancelled' }
              : t
          )
        );
        showToast('Purchase marked as Cancelled.');
      }
    } catch (err) {
      console.error('Failed to delete purchase:', err);
      const message = err.data?.message || err.message || 'Failed to delete purchase';
      showToast(message, 'error');
      throw err;
    }
  };

  const previewLocalStoragePurchasesMigration = async () => {
    try {
      const saved = localStorage.getItem('lf_purchases');
      if (!saved) {
        return { success: false, message: 'No localStorage purchase records found in browser.' };
      }
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return { success: false, message: 'No localStorage purchase records found in browser.' };
      }
      const res = await purchaseApi.previewImport({ purchases: parsed });
      return { success: true, ...res.data, rawItems: parsed };
    } catch (err) {
      console.error('Failed to preview purchase migration:', err);
      return { success: false, message: err.data?.message || err.message || 'Failed to preview migration' };
    }
  };

  const executeLocalStoragePurchasesMigration = async () => {
    try {
      const saved = localStorage.getItem('lf_purchases');
      if (!saved) {
        throw new Error('No local purchase records found to import.');
      }
      const parsed = JSON.parse(saved);
      const res = await purchaseApi.executeImport({ purchases: parsed });
      await loadPurchases();
      await loadSuppliers();
      showToast(res.message || `Successfully imported ${res.data?.createdCount || 0} purchases!`);
      return res;
    } catch (err) {
      console.error('Failed to execute purchase migration:', err);
      const message = err.data?.message || err.message || 'Failed to execute import';
      showToast(message, 'error');
      throw err;
    }
  };

  // Accounting Actions (MySQL-backed)
  const addTransaction = async (txnData) => {
    try {
      const net = parseFloat(txnData.netAmount) || 0;
      const vat = parseFloat(txnData.vatAmount) || 0;
      const gross = parseFloat(txnData.grossAmount) || net + vat;

      const payload = {
        date: txnData.date || new Date().toISOString().split('T')[0],
        type: txnData.type || 'Expense',
        category: txnData.category || 'General',
        description: txnData.description || 'Transaction',
        reference: txnData.reference || null,
        customerOrSupplier: txnData.customerOrSupplier || null,
        netAmount: net,
        vatAmount: vat,
        grossAmount: gross,
        status: txnData.status || 'Completed',
        notes: txnData.notes || null,
      };

      const res = await transactionApi.create(payload);
      if (res?.data) {
        setTransactions((prev) => [res.data, ...prev]);
        showToast(`Transaction ${res.data.transactionNumber} recorded to database!`);
        return res.data;
      }
    } catch (err) {
      console.error('Failed to create transaction:', err);
      const msg = err.data?.message || err.message || 'Failed to record transaction';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const updateTransaction = async (id, txnData) => {
    try {
      const res = await transactionApi.update(id, txnData);
      if (res?.data) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === id || t.transactionNumber === id ? res.data : t))
        );
        showToast(`Transaction ${res.data.transactionNumber} updated in database.`);
        return res.data;
      }
    } catch (err) {
      console.error('Failed to update transaction:', err);
      const msg = err.data?.message || err.message || 'Failed to update transaction';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionApi.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id && t.transactionNumber !== id));
      showToast('Transaction removed from database', 'info');
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      const msg = err.data?.message || err.message || 'Failed to delete transaction';
      showToast(msg, 'danger');
      throw err;
    }
  };

  const importTransactionsFromLocalStorage = async () => {
    try {
      const saved = localStorage.getItem('lf_transactions');
      if (!saved) {
        return { success: false, message: 'No localStorage transaction records found in browser.' };
      }
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return { success: false, message: 'No localStorage transaction records found in browser.' };
      }

      const res = await transactionApi.importBatch(parsed);
      await loadTransactions();
      showToast(res.message || 'Transactions imported to database successfully!');
      return { success: true, ...res };
    } catch (err) {
      console.error('Transaction batch import error:', err);
      const msg = err.data?.message || err.message || 'Failed to import transactions';
      showToast(msg, 'danger');
      throw err;
    }
  };

  // Mileage Actions
  const addMileage = async (mileageData) => {
    const start = parseFloat(mileageData.startMileage);
    const end = parseFloat(mileageData.endMileage);
    
    // Strict validation
    if (isNaN(start) || isNaN(end) || start < 0 || end < 0 || end <= start) {
      showToast('Cannot save mileage: ending mileage must be greater than starting mileage.', 'danger');
      return null;
    }

    const dist = +(end - start).toFixed(1);
    const rate = mileageData.rate !== undefined && mileageData.rate !== '' ? parseFloat(mileageData.rate) : null;
    const expense = rate !== null && !isNaN(rate) ? parseFloat((dist * rate).toFixed(2)) : null;

    // Attempt backend persistence
    try {
      let vanId = mileageData.vanId || null;
      if (!vanId && mileageData.vehicle) {
        if (mileageData.vehicle.includes('Van 1')) vanId = 'van1';
        else if (mileageData.vehicle.includes('Van 2')) vanId = 'van2';
        else if (mileageData.vehicle.includes('Van 3')) vanId = 'van3';
      }

      const payload = {
        vanId,
        vehicle: mileageData.vehicle || 'Van 1',
        date: mileageData.date || new Date().toISOString().split('T')[0],
        startMileage: start,
        endMileage: end,
        distanceUnit: mileageData.distanceUnit || 'miles',
        purpose: mileageData.purpose || 'Business Journey',
        rate,
        notes: mileageData.notes || null,
        allowCorrection: true,
      };

      const res = await mileageApi.create(payload);
      await loadMileages();
      showToast(`Mileage record for ${payload.vehicle} saved to database (${dist} ${payload.distanceUnit})`);
      return res.data;
    } catch (err) {
      console.warn('Mileage API creation failed, saving locally:', err);
      showToast(err.data?.message || 'Server error recording mileage; saved locally', 'warning');
    }

    // Local fallback
    const newMileage = {
      id: `MIL-2026-${String(mileages.length + 1).padStart(3, '0')}`,
      date: mileageData.date || new Date().toISOString().split('T')[0],
      vehicle: mileageData.vehicle || 'Van 1',
      distanceUnit: mileageData.distanceUnit || 'miles',
      purpose: mileageData.purpose || 'Business Journey',
      rate: rate,
      recordedInExpenses: false,
      expenseId: null,
      isLocalOnly: true,
      createdAt: new Date().toISOString().split('T')[0],
      ...mileageData,
      startMileage: start,
      endMileage: end,
      distance: dist,
      estimatedExpense: expense,
    };

    setMileages((prev) => [newMileage, ...prev]);
    showToast(`Mileage record for ${newMileage.vehicle} saved locally in browser (offline mode)`, 'warning');
    return newMileage;
  };

  const updateMileage = async (id, updatedFields) => {
    const target = mileages.find((m) => m.id === id || m.realId === id);
    if (target?.realId) {
      try {
        const payload = { ...updatedFields, allowCorrection: true };
        await mileageApi.update(target.realId, payload);
        await loadMileages();
        showToast('Mileage entry updated in database');
        return;
      } catch (err) {
        console.warn('Backend updateMileage error, falling back to local state:', err);
      }
    }

    setMileages((prev) =>
      prev.map((m) => {
        if (m.id === id || m.realId === id) {
          const start = updatedFields.startMileage !== undefined ? parseFloat(updatedFields.startMileage) || 0 : m.startMileage;
          const end = updatedFields.endMileage !== undefined ? parseFloat(updatedFields.endMileage) || 0 : m.endMileage;
          const dist = Math.max(0, end - start);
          const rate = updatedFields.rate !== undefined ? (updatedFields.rate !== '' && updatedFields.rate !== null ? parseFloat(updatedFields.rate) : null) : m.rate;
          const expense = rate !== null && !isNaN(rate) ? parseFloat((dist * rate).toFixed(2)) : null;

          return {
            ...m,
            ...updatedFields,
            startMileage: start,
            endMileage: end,
            distance: dist,
            rate,
            estimatedExpense: expense,
          };
        }
        return m;
      })
    );
    showToast('Mileage entry updated');
  };

  const deleteMileage = async (id) => {
    const toDelete = mileages.find((m) => m.id === id || m.realId === id);
    if (!toDelete) return;

    try {
      const targetId = toDelete.realId || toDelete.id;
      await mileageApi.delete(targetId);
      await loadMileages();
      showToast('Mileage record deleted from database', 'info');
      return;
    } catch (err) {
      console.warn('Mileage API deletion failed, removing locally:', err);
    }

    // If this mileage record was posted to expenses, reconcile and remove only its linked transaction
    if (toDelete.recordedInExpenses && toDelete.expenseId) {
      setTransactions((prev) => prev.filter((t) => t.id !== toDelete.expenseId));
    }

    setMileages((prev) => prev.filter((m) => m.id !== id && m.realId !== id));
    showToast(
      toDelete.recordedInExpenses
        ? 'Mileage record and linked ledger expense removed'
        : 'Mileage record deleted',
      'info'
    );
  };

  const postMileageToExpenses = async (mileageId) => {
    const entry = mileages.find((m) => m.id === mileageId || m.realId === mileageId);
    if (!entry) return;
    if (entry.recordedInExpenses) {
      showToast('This journey has already been recorded in the expenses ledger.', 'warning');
      return;
    }
    if (!entry.estimatedExpense || entry.estimatedExpense <= 0) {
      showToast('Please set an expense rate for this trip before logging to expenses.', 'warning');
      return;
    }

    try {
      const targetId = entry.realId || entry.id;
      await mileageApi.postToExpense(targetId);
      await loadMileages();
      showToast(`Added ${formatCurrency(entry.estimatedExpense)} mileage expense to vehicle expenses ledger!`);
      return;
    } catch (err) {
      console.warn('Backend postToExpense failed, logging locally:', err);
    }

    const newTxn = {
      id: `TXN-2026-${String(transactions.length + 105).padStart(3, '0')}`,
      date: entry.date,
      type: 'Expense',
      category: 'Vehicle & Travel',
      description: `Mileage claim: ${entry.vehicle} (${entry.distance} ${entry.distanceUnit} @ ${formatCurrency(entry.rate || 0.45)}/${entry.distanceUnit}) - ${entry.purpose}`,
      reference: entry.id,
      customerOrSupplier: entry.vehicle,
      netAmount: entry.estimatedExpense,
      vatAmount: 0,
      grossAmount: entry.estimatedExpense,
      status: 'Completed',
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setMileages((prev) =>
      prev.map((m) =>
        (m.id === mileageId || m.realId === mileageId) ? { ...m, recordedInExpenses: true, expenseId: newTxn.id } : m
      )
    );
    showToast(`Added ${formatCurrency(entry.estimatedExpense)} mileage expense to Accounting ledger!`);
  };

  // WhatsApp Simulation Trigger
  const triggerWhatsAppAction = (actionType, details = {}) => {
    if (businessSettings.whatsAppStatus !== 'connected') {
      showToast('WhatsApp integration is currently disconnected in Settings.', 'warning');
    } else {
      showToast(`Mock: Sent ${actionType} to ${details.recipient || 'customer'} via WhatsApp!`, 'success');
    }
  };

  // Reset Mock Data to Factory Defaults
  const resetFactoryData = async () => {
    try {
      // 1. Reset all local mock state
      setDailyOrders(initialDailyOrders);
      setPurchasedFulfillment(initialPurchasedFulfillment);
      setPurchases(initialPurchases);
      setTransactions(initialTransactions);
      setBusinessSettings(initialBusinessSettings);
      setMileages(initialMileages);

      // 2. Explicitly persist factory state into localStorage
      try {
        localStorage.setItem('lf_daily_orders', JSON.stringify(initialDailyOrders));
        localStorage.setItem('lf_fulfillment', JSON.stringify(initialPurchasedFulfillment));
        localStorage.setItem('lf_purchases', JSON.stringify(initialPurchases));
        localStorage.setItem('lf_transactions', JSON.stringify(initialTransactions));
        localStorage.setItem('lf_settings', JSON.stringify(initialBusinessSettings));
        localStorage.setItem('lf_mileages', JSON.stringify(initialMileages));
      } catch (storageErr) {
        console.warn('LocalStorage reset error:', storageErr);
      }

      // 3. Reload all database entities from backend API
      await Promise.allSettled([
        loadCustomers(),
        loadProducts(),
        loadVans(),
        loadInvoices(),
        loadPayments(),
        loadDailyOrders(),
        loadMileages(),
        loadPurchases(),
        loadSuppliers(),
      ]);

      showToast('Factory demo data restored successfully!', 'success');
      return true;
    } catch (err) {
      console.error('Failed to reset factory data:', err);
      showToast('Failed to reset some factory demo data.', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        // Authentication & Role
        currentUser,
        currentRole,
        isAuthLoading,
        isAuthenticated: !!currentUser,
        loginUser,
        logoutUser,

        // Entities & Real Backend Data
        customers,
        isCustomersLoading,
        customersError,
        refreshCustomers: loadCustomers,

        products,
        isProductsLoading,
        productsError,
        refreshProducts: loadProducts,

        vans,
        isVansLoading,
        vansError,
        refreshVans: loadVans,

        invoices,
        isInvoicesLoading,
        invoicesError,
        refreshInvoices: loadInvoices,

        payments,
        isPaymentsLoading,
        paymentsError,
        refreshPayments: loadPayments,

        // Purchases & Bills (Real API & MySQL)
        purchases,
        isPurchasesLoading,
        purchasesError,
        refreshPurchases: loadPurchases,
        suppliers,
        isSuppliersLoading,
        refreshSuppliers: loadSuppliers,
        createPurchase,
        updatePurchase,
        deletePurchase,
        previewLocalStoragePurchasesMigration,
        executeLocalStoragePurchasesMigration,

        // Unmigrated module entities
        dailyOrders,
        purchasedFulfillment,
        loadPurchasedFulfillment,

        // Accounting & Cashflow Transactions (MySQL-backed)
        transactions,
        isTransactionsLoading,
        transactionsError,
        loadTransactions,
        refreshTransactions: loadTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        importTransactionsFromLocalStorage,

        // Business Settings (MySQL-backed)
        businessSettings,
        setBusinessSettings: updateBusinessSettings,
        updateBusinessSettings,
        loadBusinessSettings,
        refreshBusinessSettings: loadBusinessSettings,
        isSettingsLoading,
        settingsError,
        currency: businessSettings?.currency || 'GBP',
        currencySymbol: businessSettings?.currencySymbol || getCurrencySymbol(businessSettings?.currency),
        formatCurrency,
        exchangeRates: exchangeRatesData,
        isRatesLoading,
        refreshExchangeRates,
        convertCurrency,
        getExchangeRate,

        mileages,
        
        // Customer methods
        addCustomer,
        updateCustomer,
        deleteCustomer,

        // Product methods
        addProduct,
        updateProduct,
        deleteProduct,

        // Van methods
        addVan,
        updateVan,
        deleteVan,

        // Invoice methods
        createInvoice,
        updateInvoice,
        finalizeInvoice,
        voidInvoice,
        deleteInvoice,
        duplicateInvoice,

        // Payment methods
        recordPayment,
        voidPayment,

        // Daily Orders & Purchasing
        isDailyOrdersLoading,
        dailyOrdersError,
        loadDailyOrders,
        addDailyOrder,
        updatePurchasedQty,
        markProductAllPurchased,
        updateDailyOrderStatus,

        // Mileage methods
        isMileagesLoading,
        mileagesError,
        loadMileages,
        addMileage,
        updateMileage,
        deleteMileage,
        postMileageToExpenses,

        // Products setter for compatibility
        setProducts,

        // Toast & Modals
        toasts,
        showToast,
        dismissToast,
        isSearchOpen,
        setIsSearchOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        triggerWhatsAppAction,
        resetFactoryData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
