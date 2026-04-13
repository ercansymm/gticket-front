"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import SearchResultsMain from "@/page-components/SearchResultsMain";

const SESSION_DURATION = 900; // 15 minutes in seconds

export default function SearchResultsClient() {
  const searchResults = useSelector((state: { flight: { searchResults: unknown } }) => state.flight.searchResults);
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
