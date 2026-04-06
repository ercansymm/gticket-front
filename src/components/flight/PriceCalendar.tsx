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

const MAX_BAR_H = 52;
const MIN_BAR_H = 6;

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

  const showBanner = cheapestBannerOpen && cheapest && cheapest.date !== selectedDate;

  return (
    <div className="relative mb-3 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] overflow-visible">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 text-emerald-600">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="12" width="4" height="9" rx="1" />
              <rect x="10" y="7" width="4" height="14" rx="1" />
              <rect x="17" y="3" width="4" height="18" rx="1" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-slate-700 tracking-tight">
            Günlük Tahmini Fiyatlar
          </span>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="flex items-center justify-center w-6 h-6 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all duration-200"
          aria-label="Kapat"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Chart Area ── */}
      <div className="relative px-3 pb-2">
        {/* Month labels */}
        <div className="flex items-center justify-between px-8 mb-1.5">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            {months.l}
          </span>
          {months.r && (
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              {months.r}
            </span>
          )}
        </div>

        {/* Nav arrows */}
        <button
          onClick={goL}
          disabled={!canL}
          className={`absolute left-1.5 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm ring-1 ring-black/[0.06] shadow-sm transition-all duration-200 ${
            canL ? "text-slate-500 hover:bg-white hover:shadow-md hover:ring-black/10 cursor-pointer" : "text-slate-200 cursor-not-allowed"
          }`}
          style={{ top: "calc(50% + 4px)" }}
          aria-label="Önceki"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={goR}
          disabled={!canR}
          className={`absolute right-1.5 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm ring-1 ring-black/[0.06] shadow-sm transition-all duration-200 ${
            canR ? "text-slate-500 hover:bg-white hover:shadow-md hover:ring-black/10 cursor-pointer" : "text-slate-200 cursor-not-allowed"
          }`}
          style={{ top: "calc(50% + 4px)" }}
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
                    day.available ? "cursor-pointer" : "cursor-not-allowed opacity-25"
                  }`}
                  aria-label={`${shortDate(day.date)} – ${day.available ? `${fmt(day.price)} ${currency}` : "Uçuş yok"}`}
                >
                  {/* Hover tooltip */}
                  {isHov && day.available && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-white shadow-lg z-20 pointer-events-none animate-[fadeIn_120ms_ease-out]">
                      {fmt(day.price)} {currency}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-slate-800" />
                    </div>
                  )}

                  {/* Selected tooltip */}
                  {isSel && day.available && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-emerald-700 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg shadow-emerald-700/20 z-20 pointer-events-none">
                      {fmt(day.price)} {currency}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-emerald-700" />
                    </div>
                  )}

                  {/* Star for cheapest */}
                  {isCheap && (
                    <div className="mb-0.5 text-emerald-400 drop-shadow-sm">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-[3px] transition-all duration-200 ${
                      isSel
                        ? "bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-sm shadow-emerald-600/20"
                        : isCheap
                        ? "bg-gradient-to-t from-emerald-400 to-emerald-300"
                        : isHov
                        ? "bg-gradient-to-t from-blue-300 to-blue-200"
                        : "bg-gradient-to-t from-blue-200/80 to-blue-100/60"
                    }`}
                    style={{ height: `${h}px` }}
                  />

                  {/* Selected check */}
                  {isSel && (
                    <div className="flex items-center justify-center w-[14px] h-[14px] rounded-full bg-emerald-600 text-white mt-[3px] shadow-sm shadow-emerald-600/30">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}

                  {/* Day label */}
                  <span className={`text-[10px] font-semibold leading-none ${isSel ? "mt-[3px]" : "mt-[6px]"} ${isSel ? "text-emerald-700" : "text-slate-600"}`}>
                    {d.getDate()}
                  </span>
                  <span className={`text-[8px] leading-none mt-[1px] font-medium ${isSel ? "text-emerald-500" : "text-slate-400"}`}>
                    {GUN_ADLARI[d.getDay()]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
        <p className="text-[10px] text-slate-400 leading-snug hidden lg:block min-w-0 shrink">
          Fiyatlar son 1 hafta içindeki aramalara dayalı tahminlerdir.
        </p>
        {selected && selected.available && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 whitespace-nowrap shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-slate-400 shrink-0">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
            <span>
              {longDate(selectedDate)} &middot;{" "}
              <span className="font-bold text-emerald-700">
                {fmt(selected.price)} {currency}
              </span>
            </span>
          </div>
        )}
        <button
          onClick={() => selected && pick(selectedDate)}
          className="shrink-0 px-3.5 py-[6px] rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all duration-150 shadow-sm shadow-emerald-600/20"
        >
          Seçili Tarihlerde Ara
        </button>
      </div>

      {/* ── Cheapest banner ── */}
      {showBanner && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-emerald-100 bg-emerald-50/60">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-500">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span>
              En ucuz:{" "}
              <span className="font-semibold text-slate-700">{shortDate(cheapest!.date)}</span>
              {" · "}
              <span className="font-bold text-emerald-700">{fmt(cheapest!.price)} {currency}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={pickCheapest}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Bu tarihi seç →
            </button>
            <button
              onClick={() => setCheapestBannerOpen(false)}
              className="text-slate-300 hover:text-slate-500 transition-colors"
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
