"use client";

import { useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  searchFlightsThunk,
  setSearchParams,
  clearSearch,
} from "../../redux/features/flightSlice";
import { resetBooking } from "../../redux/features/bookingSlice";
import { resetPayment } from "../../redux/features/paymentSlice";
import type { RootState, AppDispatch } from "../../redux/store";
import type { FlightSearchRequest } from "@/types";

const TURKISH_MONTHS_FULL = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const TURKISH_DAYS_FULL = [
  "Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi",
];

function formatDateForDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const month = TURKISH_MONTHS_FULL[d.getMonth()];
  const dayOfWeek = TURKISH_DAYS_FULL[d.getDay()];
  return `${day} ${month} ${dayOfWeek}`;
}

function formatDateForApi(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(dateStr: string, days: number): Date {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isPastOrToday(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return d <= now;
}

type ArrowDirection = "dep-prev" | "dep-next" | "ret-prev" | "ret-next";

const DateNavigationBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSelector((s: RootState) => s.flight.searchParams);
  const searchLoading = useSelector((s: RootState) => s.flight.searchLoading);
  const [loadingArrow, setLoadingArrow] = useState<ArrowDirection | null>(null);

  const isRoundTrip = searchParams?.flightType === "RT" && !!searchParams?.returnDate;

  const depDateDisplay = useMemo(
    () => (searchParams ? formatDateForDisplay(searchParams.departureDate) : ""),
    [searchParams]
  );

  const retDateDisplay = useMemo(
    () =>
      searchParams?.returnDate
        ? formatDateForDisplay(searchParams.returnDate)
        : "",
    [searchParams]
  );

  const depPrevDisabled = useMemo(
    () => (searchParams ? isPastOrToday(searchParams.departureDate) : true),
    [searchParams]
  );

  const retPrevDisabled = useMemo(() => {
    if (!searchParams?.returnDate || !searchParams?.departureDate) return true;
    const retDate = new Date(searchParams.returnDate + "T00:00:00");
    const depDate = new Date(searchParams.departureDate + "T00:00:00");
    // Return date can't go before or equal to departure date
    const dayDiff = (retDate.getTime() - depDate.getTime()) / (1000 * 60 * 60 * 24);
    return dayDiff <= 1;
  }, [searchParams]);

  const triggerSearch = useCallback(
    (newParams: FlightSearchRequest, arrow: ArrowDirection) => {
      setLoadingArrow(arrow);
      dispatch(resetPayment());
      dispatch(resetBooking());
      dispatch(clearSearch());
      dispatch(setSearchParams(newParams));
      dispatch(searchFlightsThunk(newParams)).finally(() => {
        setLoadingArrow(null);
      });
    },
    [dispatch]
  );

  const handleArrowClick = useCallback(
    (arrow: ArrowDirection) => {
      if (!searchParams || searchLoading) return;

      let newDepartureDate = searchParams.departureDate;
      let newReturnDate = searchParams.returnDate ?? null;

      switch (arrow) {
        case "dep-prev": {
          if (depPrevDisabled) return;
          const newDate = addDays(searchParams.departureDate, -1);
          newDepartureDate = formatDateForApi(newDate);
          break;
        }
        case "dep-next": {
          const newDate = addDays(searchParams.departureDate, 1);
          newDepartureDate = formatDateForApi(newDate);
          // If departure goes past return, push return forward too
          if (newReturnDate && newDepartureDate >= newReturnDate) {
            const pushReturn = addDays(newDepartureDate, 1);
            newReturnDate = formatDateForApi(pushReturn);
          }
          break;
        }
        case "ret-prev": {
          if (retPrevDisabled || !newReturnDate) return;
          const newDate = addDays(newReturnDate, -1);
          newReturnDate = formatDateForApi(newDate);
          break;
        }
        case "ret-next": {
          if (!newReturnDate) return;
          const newDate = addDays(newReturnDate, 1);
          newReturnDate = formatDateForApi(newDate);
          break;
        }
      }

      const newParams: FlightSearchRequest = {
        ...searchParams,
        departureDate: newDepartureDate,
        returnDate: newReturnDate,
      };

      triggerSearch(newParams, arrow);
    },
    [searchParams, searchLoading, depPrevDisabled, retPrevDisabled, triggerSearch]
  );

  if (!searchParams) return null;

  return (
    <div className="bb-date-nav">
      <div className="bb-date-nav__inner">
        {/* Departure date section */}
        <div
          className={`bb-date-nav__section ${
            !isRoundTrip ? "bb-date-nav__section--full" : ""
          }`}
        >
          <button
            type="button"
            className="bb-date-nav__arrow"
            disabled={depPrevDisabled || searchLoading}
            onClick={() => handleArrowClick("dep-prev")}
            aria-label="Önceki gün, gidiş"
          >
            {loadingArrow === "dep-prev" ? (
              <i className="fa-solid fa-spinner fa-spin" />
            ) : (
              <i className="fa-solid fa-chevron-left" />
            )}
          </button>

          <span className="bb-date-nav__label">
            <span className="bb-date-nav__label-prefix">Gidiş</span>
            <span className="bb-date-nav__label-sep">-</span>
            <span className="bb-date-nav__label-date">{depDateDisplay}</span>
          </span>

          <button
            type="button"
            className="bb-date-nav__arrow"
            disabled={searchLoading}
            onClick={() => handleArrowClick("dep-next")}
            aria-label="Sonraki gün, gidiş"
          >
            {loadingArrow === "dep-next" ? (
              <i className="fa-solid fa-spinner fa-spin" />
            ) : (
              <i className="fa-solid fa-chevron-right" />
            )}
          </button>
        </div>

        {/* Return date section — only for round-trip */}
        {isRoundTrip && (
          <div className="bb-date-nav__section">
            <button
              type="button"
              className="bb-date-nav__arrow"
              disabled={retPrevDisabled || searchLoading}
              onClick={() => handleArrowClick("ret-prev")}
              aria-label="Önceki gün, dönüş"
            >
              {loadingArrow === "ret-prev" ? (
                <i className="fa-solid fa-spinner fa-spin" />
              ) : (
                <i className="fa-solid fa-chevron-left" />
              )}
            </button>

            <span className="bb-date-nav__label">
              <span className="bb-date-nav__label-prefix">Dönüş</span>
              <span className="bb-date-nav__label-sep">-</span>
              <span className="bb-date-nav__label-date">{retDateDisplay}</span>
            </span>

            <button
              type="button"
              className="bb-date-nav__arrow"
              disabled={searchLoading}
              onClick={() => handleArrowClick("ret-next")}
              aria-label="Sonraki gün, dönüş"
            >
              {loadingArrow === "ret-next" ? (
                <i className="fa-solid fa-spinner fa-spin" />
              ) : (
                <i className="fa-solid fa-chevron-right" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateNavigationBar;
