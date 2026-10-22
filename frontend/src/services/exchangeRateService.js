const API_URL = 'https://open.er-api.com/v6/latest/USD';
const STORAGE_KEY = 'lf_exchange_rates';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

// Sane fallback rates in case of network issues
const FALLBACK_RATES = {
  USD: 1,
  GBP: 0.7466,
  EUR: 0.8903,
  INR: 94.59,
  CAD: 1.405,
  AUD: 1.423,
};

let inMemoryRates = {
  base: 'USD',
  rates: { ...FALLBACK_RATES },
  lastUpdated: null,
};

// Initialize from localStorage cache if available
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const cached = window.localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.rates && parsed.timestamp) {
        inMemoryRates = {
          base: parsed.base || 'USD',
          rates: { ...FALLBACK_RATES, ...parsed.rates },
          lastUpdated: new Date(parsed.timestamp),
        };
      }
    }
  }
} catch {
  // ignore
}

/**
 * Fetch latest exchange rates from open.er-api.com
 */
export async function fetchExchangeRates(force = false) {
  try {
    // Check cache freshness
    if (!force && inMemoryRates.lastUpdated) {
      const age = Date.now() - new Date(inMemoryRates.lastUpdated).getTime();
      if (age < CACHE_TTL_MS) {
        return inMemoryRates;
      }
    }

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Exchange rate API responded with status ${response.status}`);
    }

    const data = await response.json();
    if (data.result === 'success' && data.rates) {
      inMemoryRates = {
        base: data.base_code || 'USD',
        rates: { ...FALLBACK_RATES, ...data.rates },
        lastUpdated: new Date(),
      };

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            base: inMemoryRates.base,
            rates: inMemoryRates.rates,
            timestamp: inMemoryRates.lastUpdated.toISOString(),
          })
        );
      }
    }
  } catch (error) {
    console.warn('Failed to fetch live exchange rates from open.er-api.com; using cached/fallback rates:', error.message);
  }

  return inMemoryRates;
}

/**
 * Get current rate between two currencies (default from USD)
 */
export function getExchangeRate(fromCurrency = 'GBP', toCurrency = 'USD') {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (from === to) return 1;

  const rates = inMemoryRates.rates || FALLBACK_RATES;
  const rateFrom = rates[from] || 1;
  const rateTo = rates[to] || 1;

  // Since all rates are relative to USD base:
  // 1 unit of 'from' = (1 / rateFrom) USD
  // In 'to' currency = (1 / rateFrom) * rateTo
  return rateTo / rateFrom;
}

/**
 * Convert an amount from one currency to another using live rates
 */
export function convertCurrency(amount, fromCurrency = 'GBP', toCurrency = 'USD') {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const from = (fromCurrency || 'GBP').toUpperCase();
  const to = (toCurrency || 'USD').toUpperCase();

  if (from === to || numericAmount === 0) {
    return numericAmount;
  }

  const rate = getExchangeRate(from, to);
  return Math.round((numericAmount * rate + Number.EPSILON) * 100) / 100;
}

/**
 * Return current exchange rate snapshot
 */
export function getExchangeRatesSnapshot() {
  return {
    ...inMemoryRates,
    getRate: (from, to) => getExchangeRate(from, to),
  };
}
