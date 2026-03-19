import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "../../../context/LanguageContext";

interface CalendarProps {
  isOpen: boolean;
  onClose: () => void;
  /** Single mode: fires when a date is picked */
  onSelectDate?: (date: Date) => void;
  /** Range mode: fires when both start and end are picked */
  onSelectRange?: (start: Date, end: Date) => void;
  selectedDate?: Date | null;
  minDate?: Date;
  mode: "single" | "range";
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
}

/* ── helpers ─────────────────────────────────────────── */
const startOfDay = (d: Date) => {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
};

const isSameDay = (a: Date, b: Date | null | undefined) =>
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatDate = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
};

/* ── component ───────────────────────────────────────── */
const Calendar = ({
  isOpen,
  onClose,
  onSelectDate,
  onSelectRange,
  selectedDate,
  minDate,
  mode,
  rangeStart,
  rangeEnd,
}: CalendarProps) => {
  const { t } = useTranslation();
  const calRef = useRef<HTMLDivElement>(null);

  const today = startOfDay(new Date());
  const effectiveMin = minDate ? startOfDay(minDate) : today;

  // Base month for the left panel
  const [baseMonth, setBaseMonth] = useState(() => {
    const ref = rangeStart || selectedDate || new Date();
    return new Date(ref.getFullYear(), ref.getMonth(), 1);
  });

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay binding so the opening click doesn't immediately close
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [isOpen, onClose]);

  // Internal range state for two-click selection
  const [internalStart, setInternalStart] = useState<Date | null>(rangeStart ?? null);
  const [internalEnd, setInternalEnd] = useState<Date | null>(rangeEnd ?? null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Sync external props when calendar opens
  useEffect(() => {
    if (isOpen) {
      setInternalStart(rangeStart ?? null);
      setInternalEnd(rangeEnd ?? null);
      const ref = rangeStart || selectedDate || new Date();
      setBaseMonth(new Date(ref.getFullYear(), ref.getMonth(), 1));
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDayClick = useCallback(
    (date: Date) => {
      if (mode === "single") {
        onSelectDate?.(date);
        onClose();
        return;
      }

      // Range mode — two-click
      if (!internalStart || internalEnd) {
        // First click (or re-starting after both selected)
        setInternalStart(date);
        setInternalEnd(null);
      } else {
        // Second click
        if (date < internalStart) {
          // Clicked before start → reset start
          setInternalStart(date);
          setInternalEnd(null);
        } else {
          setInternalEnd(date);
          onSelectRange?.(internalStart, date);
          onClose();
        }
      }
    },
    [mode, internalStart, internalEnd, onSelectDate, onSelectRange, onClose],
  );

  const prevMonth = () =>
    setBaseMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const nextMonth = () =>
    setBaseMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));

  // Don't go before current month
  const canGoPrev =
    baseMonth.getFullYear() > today.getFullYear() ||
    (baseMonth.getFullYear() === today.getFullYear() &&
      baseMonth.getMonth() > today.getMonth());

  if (!isOpen) return null;

  const monthsToShow = isMobile ? 1 : 2;

  return (
    <div className="bb-calendar" ref={calRef}>
      {Array.from({ length: monthsToShow }).map((_, mIdx) => {
        const month = new Date(
          baseMonth.getFullYear(),
          baseMonth.getMonth() + mIdx,
          1,
        );
        return (
          <div className="bb-calendar-month" key={mIdx}>
            {/* Header */}
            <div className="bb-calendar-header">
              {mIdx === 0 ? (
                <button
                  type="button"
                  className="bb-calendar-nav"
                  onClick={prevMonth}
                  disabled={!canGoPrev}
                  aria-label="Previous month"
                >
                  ◀
                </button>
              ) : (
                <span style={{ width: 32 }} />
              )}
              <span>
                {t.months[month.getMonth()]} {month.getFullYear()}
              </span>
              {mIdx === monthsToShow - 1 ? (
                <button
                  type="button"
                  className="bb-calendar-nav"
                  onClick={nextMonth}
                  aria-label="Next month"
                >
                  ▶
                </button>
              ) : (
                <span style={{ width: 32 }} />
              )}
            </div>

            {/* Weekday headers */}
            <div className="bb-calendar-weekdays">
              {t.weekdays.map((wd) => (
                <span key={wd}>{wd}</span>
              ))}
            </div>

            {/* Days grid */}
            <div className="bb-calendar-days">
              {renderMonth(
                month,
                today,
                effectiveMin,
                selectedDate,
                mode === "range" ? internalStart : null,
                mode === "range" ? internalEnd : null,
                hoverDate,
                handleDayClick,
                setHoverDate,
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── month renderer ──────────────────────────────────── */
function renderMonth(
  month: Date,
  today: Date,
  minDate: Date,
  selectedDate: Date | null | undefined,
  rangeStart: Date | null,
  rangeEnd: Date | null,
  hoverDate: Date | null,
  onDayClick: (d: Date) => void,
  onHover: (d: Date | null) => void,
) {
  const year = month.getFullYear();
  const mo = month.getMonth();
  const firstDay = new Date(year, mo, 1);
  // Monday = 0 … Sunday = 6
  let startWeekday = firstDay.getDay() - 1;
  if (startWeekday < 0) startWeekday = 6;
  const daysInMonth = new Date(year, mo + 1, 0).getDate();

  const cells: React.ReactNode[] = [];

  // Empty cells before first day
  for (let i = 0; i < startWeekday; i++) {
    cells.push(<span className="bb-calendar-day bb-calendar-day--empty" key={`e${i}`} />);
  }

  // Effective range end for hover preview
  const effectiveEnd = rangeEnd ?? (rangeStart && hoverDate && hoverDate > rangeStart ? hoverDate : null);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, mo, d);
    const dateStart = startOfDay(date);

    const isToday = isSameDay(dateStart, today);
    const isPast = dateStart < minDate;
    const isSelected = !!selectedDate && isSameDay(dateStart, selectedDate);
    const isRangeStart = !!rangeStart && isSameDay(dateStart, rangeStart);
    const isRangeEnd = !!effectiveEnd && isSameDay(dateStart, effectiveEnd);
    const isInRange =
      !!rangeStart && !!effectiveEnd && dateStart > rangeStart && dateStart < effectiveEnd;
    const isDisabled = isPast;

    let cls = "bb-calendar-day";
    if (isDisabled) cls += " bb-calendar-day--disabled";
    if (isToday) cls += " bb-calendar-day--today";
    if (isSelected && !rangeStart) cls += " bb-calendar-day--selected";
    if (isRangeStart) cls += " bb-calendar-day--selected bb-calendar-day--range-start";
    if (isRangeEnd) cls += " bb-calendar-day--selected bb-calendar-day--range-end";
    if (isInRange) cls += " bb-calendar-day--in-range";

    cells.push(
      <button
        type="button"
        className={cls}
        key={d}
        disabled={isDisabled}
        onClick={() => !isDisabled && onDayClick(dateStart)}
        onMouseEnter={() => onHover(dateStart)}
        onMouseLeave={() => onHover(null)}
      >
        {d}
      </button>,
    );
  }

  return cells;
}

export { formatDate };
export default Calendar;
