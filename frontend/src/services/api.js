/**
 * Centralized API client for LedgerFlow Frontend.
 * Interacts with the backend via fetch with credentials (HTTP-only cookies).
 */

// Resolve the base API URL:
// In development, default to http://localhost:5000 if not specified.
// In production builds, default to empty string '' (relative /api/v1 path) unless a non-localhost VITE_API_BASE_URL is explicitly configured.
const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isProd = import.meta.env.PROD;

let resolvedUrl = '';
if (envBaseUrl && typeof envBaseUrl === 'string' && envBaseUrl.trim() !== '') {
  const trimmed = envBaseUrl.trim();
  if (isProd && (trimmed.includes('localhost') || trimmed.includes('127.0.0.1'))) {
    resolvedUrl = '';
  } else {
    resolvedUrl = trimmed;
  }
} else if (!isProd) {
  resolvedUrl = 'http://localhost:5000';
}

export const API_BASE_URL = resolvedUrl.replace(/\/+$/, '');

/**
 * Universal request wrapper with error handling and credentials support.
 */
export async function apiRequest(endpoint, options = {}) {
  // Support absolute URLs or prepend API_BASE_URL
  let url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (options.params && typeof options.params === 'object') {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Dual-layer authentication fallback:
  // Along with HTTP-only cookies, attach Bearer token if stored in session (prevents Safari ITP cross-origin cookie blockage)
  if (typeof window !== 'undefined' && !headers['Authorization']) {
    try {
      const storedToken = sessionStorage.getItem('lf_auth_token');
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch {
      // Ignore storage access errors
    }
  }

  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include', // Guarantees HTTP-only session cookie is sent and received
  };

  if (options.body !== undefined) {
    config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    const error = new Error('Network error: Unable to communicate with the server. Please check your backend connection.');
    error.isNetworkError = true;
    error.status = 0;
    throw error;
  }

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    const textData = await response.text();
    // Detect if an SPA router (like Netlify /* redirect) served index.html instead of hitting the API backend
    const trimmed = textData.trim();
    if (trimmed.startsWith('<!DOCTYPE html') || trimmed.startsWith('<html')) {
      const error = new Error(
        'API routing error: Received an HTML document instead of a JSON API response. This indicates the backend URL is unconfigured or Netlify SPA fallback intercepted the request.'
      );
      error.status = 502;
      error.code = 'INVALID_API_RESPONSE_TYPE';
      error.isHtmlFallback = true;
      throw error;
    }
    data = textData;
  }

  if (!response.ok) {
    const message = (data && data.message) || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.code = data?.code || 'API_ERROR';
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Authentication API Service Endpoints
 */
export const authApi = {
  login: async ({ email, password }) => {
    const res = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (res?.token && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('lf_auth_token', res.token);
      } catch {
        // Ignore session storage errors
      }
    }
    return res;
  },

  getMe: async () => {
    return apiRequest('/api/v1/auth/me');
  },

  logout: async () => {
    try {
      return await apiRequest('/api/v1/auth/logout', {
        method: 'POST',
      });
    } finally {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('lf_auth_token');
        } catch {
          // Ignore session storage errors
        }
      }
    }
  },

  health: async () => {
    return apiRequest('/api/health');
  },
};

/**
 * Customer Management API Service Endpoints
 */
export const customerApi = {
  list: async (params = {}) => {
    return apiRequest('/api/v1/customers', { params });
  },

  getById: async (id) => {
    return apiRequest(`/api/v1/customers/${encodeURIComponent(id)}`);
  },

  getStatement: async (id, params = {}) => {
    return apiRequest(`/api/v1/customers/${encodeURIComponent(id)}/statement`, { params });
  },

  create: async (customerData) => {
    return apiRequest('/api/v1/customers', {
      method: 'POST',
      body: customerData,
    });
  },

  update: async (id, customerData) => {
    return apiRequest(`/api/v1/customers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: customerData,
    });
  },

  delete: async (id, { hard = false } = {}) => {
    return apiRequest(`/api/v1/customers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      params: hard ? { hard: 'true' } : {},
    });
  },
};

/**
 * Product Catalog API Service Endpoints
 */
export const productApi = {
  list: async (params = {}) => {
    return apiRequest('/api/v1/products', { params });
  },

  getById: async (id) => {
    return apiRequest(`/api/v1/products/${encodeURIComponent(id)}`);
  },

  create: async (productData) => {
    return apiRequest('/api/v1/products', {
      method: 'POST',
      body: productData,
    });
  },

  update: async (id, productData) => {
    return apiRequest(`/api/v1/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: productData,
    });
  },

  delete: async (id, { hard = false } = {}) => {
    return apiRequest(`/api/v1/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      params: hard ? { hard: 'true' } : {},
    });
  },
};

/**
 * Delivery Van Management API Service Endpoints
 */
export const vanApi = {
  list: async (params = {}) => {
    return apiRequest('/api/v1/vans', { params });
  },

  getById: async (id) => {
    return apiRequest(`/api/v1/vans/${encodeURIComponent(id)}`);
  },

  create: async (vanData) => {
    return apiRequest('/api/v1/vans', {
      method: 'POST',
      body: vanData,
    });
  },

  update: async (id, vanData) => {
    return apiRequest(`/api/v1/vans/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: vanData,
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/v1/vans/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Invoice Management API Service Endpoints
 */
export const invoiceApi = {
  list: async (params = {}) => {
    return apiRequest('/api/v1/invoices', { params });
  },

  getById: async (id) => {
    return apiRequest(`/api/v1/invoices/${encodeURIComponent(id)}`);
  },

  create: async (invoiceData) => {
    return apiRequest('/api/v1/invoices', {
      method: 'POST',
      body: invoiceData,
    });
  },

  update: async (id, invoiceData) => {
    return apiRequest(`/api/v1/invoices/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: invoiceData,
    });
  },

  finalize: async (id) => {
    return apiRequest(`/api/v1/invoices/${encodeURIComponent(id)}/finalize`, {
      method: 'POST',
    });
  },

  void: async (id, reason) => {
    return apiRequest(`/api/v1/invoices/${encodeURIComponent(id)}/void`, {
      method: 'POST',
      body: { reason },
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/v1/invoices/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Payment & Allocation API Service Endpoints
 */
export const paymentApi = {
  list: async (params = {}) => {
    return apiRequest('/api/v1/payments', { params });
  },

  getById: async (id) => {
    return apiRequest(`/api/v1/payments/${encodeURIComponent(id)}`);
  },

  create: async (paymentData) => {
    return apiRequest('/api/v1/payments', {
      method: 'POST',
      body: paymentData,
    });
  },

  void: async (id, reason) => {
    return apiRequest(`/api/v1/payments/${encodeURIComponent(id)}/void`, {
      method: 'POST',
      body: { reason },
    });
  },
};

/**
 * Daily Orders & Procurement Aggregation API Endpoints
 */
export const orderApi = {
  list: async (params = {}) => {
    return apiRequest('/api/v1/orders', { params });
  },

  getById: async (id) => {
    return apiRequest(`/api/v1/orders/${encodeURIComponent(id)}`);
  },

  getAggregation: async (params = {}) => {
    return apiRequest('/api/v1/orders/procurement/aggregation', { params });
  },

  create: async (orderData) => {
    return apiRequest('/api/v1/orders', {
      method: 'POST',
      body: orderData,
    });
  },

  update: async (id, orderData) => {
    return apiRequest(`/api/v1/orders/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: orderData,
    });
  },

  cancel: async (id, reason) => {
    return apiRequest(`/api/v1/orders/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      body: { reason },
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/v1/orders/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  getFulfillment: async (params = {}) => {
    return apiRequest('/api/v1/orders/procurement/fulfillment', { params });
  },

  updateFulfillment: async (fulfillmentData) => {
    return apiRequest('/api/v1/orders/procurement/fulfillment', {
      method: 'PUT',
      body: fulfillmentData,
    });
  },
};

/**
 * Vehicle Mileage & Fleet Expenses API Endpoints
 */
export const mileageApi = {
  list: async (params = {}) => {
    return apiRequest('/api/v1/mileage', { params });
  },

  getById: async (id) => {
    return apiRequest(`/api/v1/mileage/${encodeURIComponent(id)}`);
  },

  create: async (mileageData) => {
    return apiRequest('/api/v1/mileage', {
      method: 'POST',
      body: mileageData,
    });
  },

  update: async (id, mileageData) => {
    return apiRequest(`/api/v1/mileage/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: mileageData,
    });
  },

  postToExpense: async (id) => {
    return apiRequest(`/api/v1/mileage/${encodeURIComponent(id)}/post-expense`, {
      method: 'POST',
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/v1/mileage/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  listExpenses: async (params = {}) => {
    return apiRequest('/api/v1/mileage/expenses', { params });
  },

  createExpense: async (expenseData) => {
    return apiRequest('/api/v1/mileage/expenses', {
      method: 'POST',
      body: expenseData,
    });
  },

  voidExpense: async (id, reason) => {
    return apiRequest(`/api/v1/mileage/expenses/${encodeURIComponent(id)}/void`, {
      method: 'POST',
      body: { reason },
    });
  },
};

/**
 * Wholesale Produce Purchases & Supplier Bills Endpoints
 */
export const purchaseApi = {
  list: async (params = {}) => {
    return apiRequest('/api/v1/purchases', { params });
  },

  getById: async (id) => {
    return apiRequest(`/api/v1/purchases/${encodeURIComponent(id)}`);
  },

  create: async (purchaseData) => {
    return apiRequest('/api/v1/purchases', {
      method: 'POST',
      body: purchaseData,
    });
  },

  update: async (id, purchaseData) => {
    return apiRequest(`/api/v1/purchases/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: purchaseData,
    });
  },

  delete: async (id, { hard = false } = {}) => {
    return apiRequest(`/api/v1/purchases/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      params: hard ? { hard: 'true' } : {},
    });
  },

  listSuppliers: async () => {
    return apiRequest('/api/v1/purchases/suppliers');
  },

  previewImport: async (purchases) => {
    return apiRequest('/api/v1/purchases/import-preview', {
      method: 'POST',
      body: { purchases },
    });
  },

  executeImport: async (purchases) => {
    return apiRequest('/api/v1/purchases/import', {
      method: 'POST',
      body: { purchases },
    });
  },
};

/**
 * System Business Settings API Endpoints
 */
export const settingApi = {
  get: async () => {
    return apiRequest('/api/v1/settings');
  },

  update: async (settingsData) => {
    return apiRequest('/api/v1/settings', {
      method: 'PUT',
      body: settingsData,
    });
  },
};

/**
 * Accounting & Cashflow Transactions API Endpoints
 */
export const transactionApi = {
  list: async (params = {}) => {
    return apiRequest('/api/v1/transactions', { params });
  },

  create: async (txnData) => {
    return apiRequest('/api/v1/transactions', {
      method: 'POST',
      body: txnData,
    });
  },

  update: async (id, txnData) => {
    return apiRequest(`/api/v1/transactions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: txnData,
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/v1/transactions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  importBatch: async (transactions) => {
    return apiRequest('/api/v1/transactions/import-batch', {
      method: 'POST',
      body: { transactions },
    });
  },
};

export default {
  auth: authApi,
  customers: customerApi,
  products: productApi,
  vans: vanApi,
  invoices: invoiceApi,
  payments: paymentApi,
  orders: orderApi,
  mileage: mileageApi,
  purchases: purchaseApi,
  settings: settingApi,
  transactions: transactionApi,
};
