"use client";

import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useCurrency, SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/context/CurrencyContext";
import type { RootState } from "@/redux/store";

const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const searchResults = useSelector((s: RootState) => s.flight.searchResults);

  // Dışarı tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Arama yapılmadan gösterme
  if (!searchResults) return null;

  const current = SUPPORTED_CURRENCIES.find((c) => c.code === currency);

  return (
    <>
      <div ref={ref} className="bb-currency-selector d-none d-sm-inline-flex">
        <button
          type="button"
          className="bb-currency-selector__trigger"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="bb-currency-selector__symbol">{current?.symbol}</span>
          <span className="bb-currency-selector__code">{currency}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`bb-currency-selector__chevron ${open ? "bb-currency-selector__chevron--open" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <ul className="bb-currency-selector__dropdown" role="listbox">
            {SUPPORTED_CURRENCIES.map((c) => (
              <li key={c.code} role="option" aria-selected={c.code === currency}>
                <button
                  type="button"
                  className={`bb-currency-selector__option ${c.code === currency ? "bb-currency-selector__option--active" : ""}`}
                  onClick={() => {
                    setCurrency(c.code as SupportedCurrency);
                    setOpen(false);
                  }}
                >
                  <span className="bb-currency-selector__option-symbol">{c.symbol}</span>
                  <span className="bb-currency-selector__option-info">
                    <span className="bb-currency-selector__option-code">{c.code}</span>
                    <span className="bb-currency-selector__option-label">{c.label}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <span className="bb-divider d-none d-sm-block"></span>
    </>
  );
};

export default CurrencySelector;
