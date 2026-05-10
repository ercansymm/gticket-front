"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import SearchResultsMain from "@/page-components/SearchResultsMain";
import { searchFlightsThunk, setSearchParams } from "@/redux/features/flightSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import type { CabinClass, FlightSearchRequest } from "@/types";

const SESSION_DURATION = 900; // 15 minutes in seconds

const CABIN_MAP: Record<string, CabinClass> = {
  economy: 'Economy',
  premiumeconomy: 'PremiumEconomy',
  business: 'Business',
  first: 'First',
};

export default function SearchResultsClient() {
  const dispatch = useDispatch<AppDispatch>();
  const searchResults = useSelector((state: RootState) => state.flight.searchResults);
  const searchLoading = useSelector((state: RootState) => state.flight.searchLoading);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const originalTitleRef = useRef<string>("");

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Auto-trigger search from URL params on mount (handles F5 / URL copy / browser back)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (searchResults || searchLoading) return;
    const p = new URLSearchParams(window.location.search);
    const from = p.get('from');
    const to = p.get('to');
    const date = p.get('date');
    if (!from || !to || !date) return;
    const params: FlightSearchRequest = {
      origin: from.toUpperCase(),
      destination: to.toUpperCase(),
      departureDate: date,
      returnDate: p.get('retdate') ?? null,
      adultCount: Math.max(1, parseInt(p.get('adt') ?? '1', 10)),
      childCount: Math.max(0, parseInt(p.get('chd') ?? '0', 10)),
      infantCount: Math.max(0, parseInt(p.get('inf') ?? '0', 10)),
      flightClass: CABIN_MAP[(p.get('class') ?? 'economy').toLowerCase()] ?? 'Economy',
      flightType: p.get('type') === 'roundtrip' ? 'RT' : 'OW',
      originCountryCode: 'TR',
      destinationCountryCode: 'TR',
      originIsCity: false,
      destinationIsCity: false,
      directFlightsOnly: false,
      refundablesOnly: false,
      searchTimeoutMilliseconds: 0,
      preferredAirlines: null,
      searchReason: 'SearchAndBook',
    };
    dispatch(setSearchParams(params));
    dispatch(searchFlightsThunk(params));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start/reset timer when searchResults change
  useEffect(() => {
    if (searchResults) {
      if (!originalTitleRef.current) {
        originalTitleRef.current = document.title;
      }
      clearTimer();
      setTimeLeft(SESSION_DURATION);
      setShowExpiredModal(false);

      // Set initial title immediately
      const initMinutes = Math.floor(SESSION_DURATION / 60);
      const initSeconds = SESSION_DURATION % 60;
    document.title = `${initMinutes}:${initSeconds.toString().padStart(2, "0")} | ATABILET`;

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            setShowExpiredModal(true);
            document.title = "0:00 | ATABILET";
            return 0;
          }
          const next = prev - 1; 
          const minutes = Math.floor(next / 60);
          const seconds = next % 60;
          document.title = `${minutes}:${seconds.toString().padStart(2, "0")} | ATABILET`;
          return next;
        });
      }, 1000);
    } else {
      clearTimer();
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    }

    return () => {
      clearTimer();
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, [searchResults, clearTimer]);

  const handleExpiredConfirm = () => {
    window.location.href = "/";
  };

  return (
    <>
      <SearchResultsMain />

      {showExpiredModal && (
        <div className="bb-session-modal-overlay">
          <div className="bb-session-modal">
            <div className="bb-session-modal__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2 className="bb-session-modal__title">Oturum Süresi Doldu</h2>
            <p className="bb-session-modal__message">
              Arama oturumunuzun süresi dolmuştur. Güncel fiyatları görmek için lütfen yeni bir arama yapınız.
            </p>
            <button
              type="button"
              className="bb-session-modal__btn"
              onClick={handleExpiredConfirm}
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </>
  );
}
