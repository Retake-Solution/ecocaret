import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getCurrency, listCurrencies } from "@/services/api";
import {
  clearStoredCurrencyCode,
  getStoredCurrencyCode,
  normalizeCurrencyCode,
  persistCurrencyCode,
  setActiveCurrencyCode,
} from "@/lib/currencyStorage";
import type { CurrencyCode, PublicCurrency } from "@/types";

interface CurrencyState {
  currencies: PublicCurrency[];
  selectedCode: CurrencyCode | null;
  selectedCurrency: PublicCurrency | null;
  defaultCurrency: CurrencyCode | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  rateVersion: string | null;
}

const initialState: CurrencyState = {
  currencies: [],
  selectedCode: null,
  selectedCurrency: null,
  defaultCurrency: null,
  initialized: false,
  loading: false,
  error: null,
  rateVersion: null,
};

const orderCurrencies = (currencies: PublicCurrency[]) =>
  [...currencies].sort((a, b) => a.displayOrder - b.displayOrder || a.code.localeCompare(b.code));

const pickDefaultCurrency = (
  currencies: PublicCurrency[],
  defaultCode?: string | null
): PublicCurrency | null => {
  const normalizedDefault = normalizeCurrencyCode(defaultCode);
  return (
    currencies.find((currency) => currency.code === normalizedDefault) ||
    currencies.find((currency) => currency.isDefault) ||
    currencies[0] ||
    null
  );
};

const resolveSelectedCurrency = (
  currencies: PublicCurrency[],
  defaultCode?: string | null
) => {
  const storedCode = getStoredCurrencyCode();
  const storedCurrency = currencies.find((currency) => currency.code === storedCode);
  const fallbackCurrency = pickDefaultCurrency(currencies, defaultCode);
  return storedCurrency || fallbackCurrency;
};

export const refreshCurrencies = createAsyncThunk<
  {
    currencies: PublicCurrency[];
    defaultCurrency: CurrencyCode;
    selectedCurrency: PublicCurrency;
  },
  void,
  { rejectValue: string }
>("currency/refreshCurrencies", async (_, { rejectWithValue }) => {
  try {
    const result = await listCurrencies();
    const currencies = orderCurrencies(result.data || []);
    if (currencies.length === 0) {
      clearStoredCurrencyCode();
      return rejectWithValue("No active currencies are available.");
    }

    const selectedCurrency = resolveSelectedCurrency(currencies, result.defaultCurrency);
    if (!selectedCurrency) {
      clearStoredCurrencyCode();
      return rejectWithValue("No valid default currency is available.");
    }

    persistCurrencyCode(selectedCurrency.code);

    return {
      currencies,
      defaultCurrency: result.defaultCurrency || selectedCurrency.code,
      selectedCurrency,
    };
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Unable to load currencies.");
  }
});

export const selectCurrency = createAsyncThunk<
  PublicCurrency,
  CurrencyCode,
  { state: { currency: CurrencyState }; rejectValue: string }
>("currency/selectCurrency", async (code, { getState, rejectWithValue }) => {
  const normalized = normalizeCurrencyCode(code);
  if (!normalized) {
    clearStoredCurrencyCode();
    return rejectWithValue("Invalid currency code.");
  }

  const existing = getState().currency.currencies.find((currency) => currency.code === normalized);
  if (!existing) {
    clearStoredCurrencyCode();
    return rejectWithValue("Currency is not active.");
  }

  try {
    const latest = await getCurrency(normalized);
    persistCurrencyCode(latest.code);
    return latest;
  } catch (error) {
    if (error instanceof Error) return rejectWithValue(error.message);
    return rejectWithValue("Unable to select currency.");
  }
});

export const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    resetCurrency: (state) => {
      const fallback = pickDefaultCurrency(state.currencies, state.defaultCurrency);
      state.selectedCode = fallback?.code || null;
      state.selectedCurrency = fallback;
      state.error = null;
      if (fallback) persistCurrencyCode(fallback.code);
      else clearStoredCurrencyCode();
    },
    reconcileResolvedCurrency: (state, action: PayloadAction<{ code: string; rateVersion?: string | null }>) => {
      const normalized = normalizeCurrencyCode(action.payload.code);
      if (!normalized) return;
      state.rateVersion = action.payload.rateVersion || state.rateVersion;
      if (state.selectedCode === normalized) return;
      const resolved = state.currencies.find((currency) => currency.code === normalized);
      if (!resolved) return;
      state.selectedCode = resolved.code;
      state.selectedCurrency = resolved;
      persistCurrencyCode(resolved.code);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshCurrencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshCurrencies.fulfilled, (state, action) => {
        state.currencies = action.payload.currencies;
        state.defaultCurrency = action.payload.defaultCurrency;
        state.selectedCode = action.payload.selectedCurrency.code;
        state.selectedCurrency = action.payload.selectedCurrency;
        state.initialized = true;
        state.loading = false;
        state.error = null;
        setActiveCurrencyCode(action.payload.selectedCurrency.code);
      })
      .addCase(refreshCurrencies.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload || action.error.message || "Unable to load currencies.";
        state.selectedCode = null;
        state.selectedCurrency = null;
        setActiveCurrencyCode(null);
      })
      .addCase(selectCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(selectCurrency.fulfilled, (state, action) => {
        const known = state.currencies.find((currency) => currency.code === action.payload.code) || action.payload;
        state.selectedCode = known.code;
        state.selectedCurrency = known;
        state.loading = false;
        state.error = null;
        setActiveCurrencyCode(known.code);
      })
      .addCase(selectCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || "Unable to select currency.";
      });
  },
});

export const { reconcileResolvedCurrency, resetCurrency } = currencySlice.actions;

export default currencySlice.reducer;
