"use client";

import { useState, useMemo, useCallback, useEffect } from "react";

// ── Interfaces ──────────────────────────────────────────────

interface DayPrice {
  date: string;
  price: number;
  available: boolean;
}

interface PriceCalendarProps {
  prices: DayPrice[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  currency?: string;
  /** When provided, the close (X) button calls this instead of toggling internal visibility. */
  onClose?: () => void;
  /** Hide the top header row (used when embedded inside a tab panel). */
  hideHeader?: boolean;
}

// ── Türkçe gün/ay isimleri ──────────────────────────────────

const GUN_ADLARI = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cts"];
const AY_ADLARI = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];
const AY_ADLARI_UZUN = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

// ── Sabitler ────────────────────────────────────────────────

const MAX_BAR_H = 100;
const MIN_BAR_H = 10;

// ── Helpers ─────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("tr-TR");
}

function shortDate(s: string): string {
  const d = new Date(s);
  return `${d.getDate()} ${AY_ADLARI[d.getMonth()]} ${GUN_ADLARI[d.getDay()]}`;
}

function longDate(s: string): string {
  const d = new Date(s);
  return `${d.getDate()} ${AY_ADLARI_UZUN[d.getMonth()]} ${GUN_ADLARI[d.getDay()]}`;
}

function visCount(): number {
  if (typeof window === "undefined") return 14;
  if (window.innerWidth < 640) return 7;
  if (window.innerWidth < 1024) return 10;
  return 14;
}

// ── Component ───────────────────────────────────────────────

export default function PriceCalendar({
  prices,
  selectedDate,
  onDateSelect,
  currency = "TL",
  onClose,
  hideHeader = false,
}: PriceCalendarProps) {
  const [visible, setVisible] = useState(true);
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(14);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [cheapestBannerOpen, setCheapestBannerOpen] = useState(true);

  useEffect(() => {
    const fn = () => setCount(visCount());
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const maxPrice = useMemo(() => {
    const avail = prices.filter((p) => p.available).map((p) => p.price);
    return avail.length > 0 ? Math.max(...avail) : 1;
  }, [prices]);

  const cheapest = useMemo(() => {
    const avail = prices.filter((p) => p.available);
    return avail.length === 0
      ? null
      : avail.reduce((m, p) => (p.price < m.price ? p : m), avail[0]);
  }, [prices]);

  const selected = useMemo(
    () => prices.find((p) => p.date === selectedDate) ?? null,
    [prices, selectedDate],
  );

  const window_ = useMemo(
    () => prices.slice(offset, offset + count),
    [prices, offset, count],
  );

  // Month labels
  const months = useMemo(() => {
    if (window_.length === 0) return { l: "", r: "" };
    const a = AY_ADLARI_UZUN[new Date(window_[0].date).getMonth()];
    const b = AY_ADLARI_UZUN[new Date(window_[window_.length - 1].date).getMonth()];
    return { l: a, r: a !== b ? b : "" };
  }, [window_]);

  const canL = offset > 0;
  const canR = offset + count < prices.length;

  const goL = useCallback(() => {
    setOffset((o) => Math.max(0, o - count));
  }, [count]);

  const goR = useCallback(() => {
    setOffset((o) => Math.min(prices.length - count, o + count));
  }, [prices.length, count]);

  const pick = useCallback(
    (d: string) => onDateSelect(d),
    [onDateSelect],
  );

  const pickCheapest = useCallback(() => {
    if (cheapest) {
      onDateSelect(cheapest.date);
      setCheapestBannerOpen(false);
    }
  }, [cheapest, onDateSelect]);

  if (!visible) return null;

  const handleClose = () => {
    if (onClose) onClose();
    else setVisible(false);
  };

  const showBanner = cheapestBannerOpen && cheapest && cheapest.date !== selectedDate;

  return (
    <div className="relative mb-3 rounded-2xl bg-white border border-[#e8edf5] shadow-[0_4px_16px_rgba(10,22,40,0.08)] overflow-visible">
      {/* ── Header ── */}
      {!hideHeader && (
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8edf5]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#0a1628] text-white">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="12" width="4" height="9" rx="1" />
              <rect x="10" y="7" width="4" height="14" rx="1" />
              <rect x="17" y="3" width="4" height="18" rx="1" />
            </svg>
          </div>
          <span className="text-[13px] font-bold text-[#0a1628] tracking-tight">
            Günlük Tahmini Fiyatlar
          </span>
          <span className="text-[10px] font-medium text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full">
            Mock veri
          </span>
        </div>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-6 h-6 rounded-full text-[#94a3b8] hover:text-[#0a1628] hover:bg-[#f1f5f9] transition-all duration-200"
          aria-label="Kapat"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      )}

      {/* ── Chart Area ── */}
      <div className="relative px-4 py-4">
        {/* Month labels */}
        <div className="flex items-center justify-between px-8 mb-3">
          <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">
            {months.l}
          </span>
          {months.r && (
            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">
              {months.r}
            </span>
          )}
        </div>

        {/* Nav arrows */}
        <button
          onClick={goL}
          disabled={!canL}
          className={`absolute left-2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-white border border-[#e8edf5] shadow-sm transition-all duration-200 ${
            canL ? "text-[#0a1628] hover:border-[#0a1628] hover:shadow-md cursor-pointer" : "text-[#cbd5e1] cursor-not-allowed"
          }`}
          style={{ top: "calc(50% + 8px)" }}
          aria-label="Önceki"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={goR}
          disabled={!canR}
          className={`absolute right-2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-white border border-[#e8edf5] shadow-sm transition-all duration-200 ${
            canR ? "text-[#0a1628] hover:border-[#0a1628] hover:shadow-md cursor-pointer" : "text-[#cbd5e1] cursor-not-allowed"
          }`}
          style={{ top: "calc(50% + 8px)" }}
          aria-label="Sonraki"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Bars */}
        <div className="mx-8">
          <div className="flex items-end gap-[3px]">
            {window_.map((day) => {
              const isSel = day.date === selectedDate;
              const isCheap = cheapest !== null && day.date === cheapest.date && !isSel;
              const isHov = hoveredDate === day.date && !isSel;
              const h = day.available
                ? Math.max(MIN_BAR_H, Math.round((day.price / maxPrice) * MAX_BAR_H))
                : MIN_BAR_H;
              const d = new Date(day.date);

              return (
                <button
                  key={day.date}
                  onClick={() => day.available && pick(day.date)}
                  onMouseEnter={() => day.available && setHoveredDate(day.date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={!day.available}
                  className={`group relative flex flex-col items-center flex-1 min-w-0 transition-all duration-150 ${
                    day.available ? "cursor-pointer" : "cursor-not-allowed opacity-20"
                  }`}
                  aria-label={`${shortDate(day.date)} – ${day.available ? `${fmt(day.price)} ${currency}` : "Uçuş yok"}`}
                >
                  {/* Hover tooltip */}
                  {isHov && day.available && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#0a1628] px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg z-20 pointer-events-none">
                      {fmt(day.price)} {currency}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-[#0a1628]" />
                    </div>
                  )}

                  {/* Selected tooltip */}
                  {isSel && day.available && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#047857] px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg z-20 pointer-events-none">
                      {fmt(day.price)} {currency}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#047857]" />
                    </div>
                  )}

                  {/* Star for cheapest */}
                  {isCheap && (
                    <div className="mb-0.5 text-[#047857]">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    className="w-full rounded-t-[3px] transition-all duration-200"
                    style={{
                      height: `${h}px`,
                      background: isSel
                        ? "linear-gradient(to top, #047857, #10b981)"
                        : isCheap
                        ? "linear-gradient(to top, #059669, #6ee7b7)"
                        : isHov
                        ? "linear-gradient(to top, #1e3a5f, #2d5a9e)"
                        : "linear-gradient(to top, #cbd5e1, #e2e8f0)",
                      boxShadow: isSel ? "0 2px 8px rgba(4,120,87,0.3)" : undefined,
                    }}
                  />

                  {/* Selected check */}
                  {isSel && (
                    <div className="flex items-center justify-center w-[14px] h-[14px] rounded-full bg-[#047857] text-white mt-[3px]">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}

                  {/* Day label */}
                  <span className={`text-[10px] font-bold leading-none mt-[4px] ${isSel ? "text-[#047857]" : "text-[#475569]"}`}>
                    {d.getDate()}
                  </span>
                  <span className={`text-[9px] leading-none mt-[2px] font-medium ${isSel ? "text-[#059669]" : "text-[#94a3b8]"}`}>
                    {GUN_ADLARI[d.getDay()]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#e8edf5] bg-[#f8fafc] rounded-b-2xl">
        <p className="text-[10px] text-[#94a3b8] leading-snug hidden lg:block min-w-0 shrink">
          Fiyatlar son 1 hafta içindeki aramalara dayalı tahminlerdir.
        </p>
        {selected && selected.available && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] whitespace-nowrap shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-[#94a3b8] shrink-0">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
            <span>
              {longDate(selectedDate)} &middot;{" "}
              <span className="font-bold text-[#047857]">
                {fmt(selected.price)} {currency}
              </span>
            </span>
          </div>
        )}
        <button
          onClick={() => selected && pick(selectedDate)}
          className="shrink-0 px-4 py-1.5 rounded-lg bg-[#0a1628] text-white text-[11px] font-bold hover:bg-[#1e3a5f] active:scale-[0.98] transition-all duration-150 shadow-sm"
        >
          Seçili Tarihlerde Ara
        </button>
      </div>

      {/* ── Cheapest banner ── */}
      {showBanner && (
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-[#d1fae5] bg-[#f0fdf4] rounded-b-2xl">
          <div className="flex items-center gap-2 text-[11px] text-[#374151]">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#d1fae5] text-[#047857]">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span>
              En ucuz:{" "}
              <span className="font-semibold text-[#0a1628]">{shortDate(cheapest!.date)}</span>
              {" · "}
              <span className="font-bold text-[#047857]">{fmt(cheapest!.price)} {currency}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={pickCheapest}
              className="text-[11px] font-bold text-[#047857] hover:text-[#065f46] transition-colors"
            >
              Bu tarihi seç →
            </button>
            <button
              onClick={() => setCheapestBannerOpen(false)}
              className="text-[#94a3b8] hover:text-[#475569] transition-colors"
              aria-label="Kapat"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mock data generator ─────────────────────────────────────

export function generateMockPrices(selectedDate: string): DayPrice[] {
  const center = new Date(selectedDate);
  const result: DayPrice[] = [];

  for (let i = -7; i < 23; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const seed = d.getDate() * 31 + d.getMonth() * 7 + d.getFullYear();
    const price = 1200 + ((seed * 137 + i * 53) % 601);
    const available = (seed + i * 17) % 10 !== 0;
    result.push({ date: dateStr, price, available });
  }

  return result;
}
