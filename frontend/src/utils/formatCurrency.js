import { convertCurrency, getExchangeRate } from '../services/exchangeRateService';

let activeCurrency = 'GBP';
let baseCurrency = 'GBP'; // System baseline ledger currency in MySQL

// Attempt initial read from localStorage if present
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedSettings = window.localStorage.getItem('lf_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.currency) activeCurrency = parsed.currency;
    }
  }
} catch {
  // ignore
}

export const getCurrencySymbol = (currency = activeCurrency) => {
  switch (currency) {
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'INR':
      return '₹';
    case 'CAD':
    case 'AUD':
      return '$';
    case 'GBP':
    default:
      return '£';
  }
};

export const setActiveCurrency = (curr) => {
  if (curr && typeof curr === 'string') {
    activeCurrency = curr.toUpperCase();
  }
};

export const getActiveCurrency = () => activeCurrency;

export const setBaseCurrency = (base) => {
  if (base && typeof base === 'string') {
    baseCurrency = base.toUpperCase();
  }
};

export const getBaseCurrency = () => baseCurrency;

/**
 * Format currency amount with automatic real-time FX conversion support via open.er-api.com
 * @param {number|string} amount - The amount to format
 * @param {string} [currency] - Target display currency (defaults to activeCurrency)
 * @param {object} [options] - Options: { convert: boolean, sourceCurrency: string }
 */
export const formatCurrency = (amount, currency, options = {}) => {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const targetCurrency = (currency || activeCurrency || 'GBP').toUpperCase();
  const sourceCurrency = (options.sourceCurrency || baseCurrency || 'GBP').toUpperCase();

  // If convert is not explicitly set to false and target currency differs from source, convert using live rates
  const shouldConvert = options.convert !== false && targetCurrency !== sourceCurrency;
  const displayAmount = shouldConvert
    ? convertCurrency(numericAmount, sourceCurrency, targetCurrency)
    : numericAmount;

  const localeMap = {
    GBP: 'en-GB',
    EUR: 'en-GB',
    USD: 'en-US',
    INR: 'en-IN',
    CAD: 'en-CA',
    AUD: 'en-AU',
  };

  const locale = localeMap[targetCurrency] || 'en-GB';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(displayAmount);
  } catch {
    const sym = getCurrencySymbol(targetCurrency);
    return `${sym}${displayAmount.toFixed(2)}`;
  }
};

export const parseCurrencyInput = (value) => {
  if (!value) return 0;
  const clean = value.toString().replace(/[^0-9.-]+/g, '');
  return parseFloat(clean) || 0;
};
