"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getCurrencyRates, type CurrencyRate } from "@/api/currency";

export type SupportedCurrency = "TRY" | "EUR" | "USD" | "GBP" | "AZN" | "BGN" | "DZD" | "GEL" | "LYD" | "TND";

export const SUPPORTED_CURRENCIES: { code: SupportedCurrency; label: string; symbol: string }[] = [
  { code: "TRY", label: "Türk Lirası", symbol: "₺" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "ABD Doları", symbol: "$" },
  { code: "GBP", label: "İngiliz Sterlini", symbol: "£" },
  { code: "AZN", label: "Azerbaycan Manatı", symbol: "₼" },
  { code: "BGN", label: "Bulgar Levası", symbol: "лв" },
  { code: "DZD", label: "Cezayir Dinarı", symbol: "د.ج" },
  { code: "GEL", label: "Gürcü Larisi", symbol: "₾" },
  { code: "LYD", label: "Libya Dinarı", symbol: "ل.د" },
  { code: "TND", label: "Tunus Dinarı", symbol: "د.ت" },
];

interface CurrencyContextValue {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  rates: Record<string, number>; // currency code -> rateTry (1 unit = X TRY)
  ratesLoaded: boolean;
  convertFromTry: (amountTry: number, targetCurrency?: string) => number;
  formatPrice: (amountTry: number, targetCurrency?: string) => string;
  getCurrencySymbol: (code?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "TRY",
  setCurrency: () => {},
  rates: { TRY: 1 },
  ratesLoaded: false,
  convertFromTry: (a) => a,
  formatPrice: (a) => a.toLocaleString("tr-TR", { minimumFractionDigits: 2 }),
  getCurrencySymbol: () => "₺",
});

const STORAGE_KEY = "bb_currency";

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("TRY");
  const [rates, setRates] = useState<Record<string, number>>({ TRY: 1 });
  const [ratesLoaded, setRatesLoaded] = useState(false);

  // Kurları yükle
  useEffect(() => {
    let cancelled = false;

    const loadRates = async () => {
      try {
        const data = await getCurrencyRates();
        if (cancelled) return;

        const rateMap: Record<string, number> = { TRY: 1 };
        data.forEach((r: CurrencyRate) => {
          rateMap[r.currency] = r.rateTry;
        });
        setRates(rateMap);
        setRatesLoaded(true);
      } catch (err) {
        console.warn("[CurrencyProvider] Kur verisi yüklenemedi:", err);
        // Fallback: sadece TRY kullanilir
        setRatesLoaded(true);
      }
    };

    loadRates();

    // Her 1 saatte bir kurları yenile
    const interval = setInterval(loadRates, 60 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // localStorage'dan kayıtlı para birimini yükle
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_CURRENCIES.some((c) => c.code === stored)) {
        setCurrencyState(stored as SupportedCurrency);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setCurrency = useCallback((c: SupportedCurrency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const convertFromTry = useCallback(
    (amountTry: number, targetCurrency?: string) => {
      const target = targetCurrency ?? currency;
      if (target === "TRY") return amountTry;

      const rate = rates[target];
      if (!rate || rate <= 0) return amountTry; // fallback: TRY göster

      return Math.round((amountTry / rate) * 100) / 100;
    },
    [currency, rates]
  );

  const getCurrencySymbol = useCallback((code?: string) => {
    const c = code ?? currency;
    return SUPPORTED_CURRENCIES.find((s) => s.code === c)?.symbol ?? c;
  }, [currency]);

  const formatPrice = useCallback(
    (amountTry: number, targetCurrency?: string) => {
      const target = targetCurrency ?? currency;
      const converted = convertFromTry(amountTry, target);
      const formatted = converted.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const symbol = getCurrencySymbol(target);
      return `${formatted} ${symbol}`;
    },
    [currency, convertFromTry, getCurrencySymbol]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rates,
        ratesLoaded,
        convertFromTry,
        formatPrice,
        getCurrencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
