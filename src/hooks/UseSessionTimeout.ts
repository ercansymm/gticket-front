"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { clearSearch } from '@/redux/features/flightSlice';
import { resetBooking } from '@/redux/features/bookingSlice';
import { resetPayment } from '@/redux/features/paymentSlice';
import type { RootState, AppDispatch } from '@/redux/store';

// Backend session süresi: 20 dakika
const SESSION_DURATION_MS = 20 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000; // Son 2 dakikada uyar

export function useSessionTimeout() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const sessionStartedAt = useSelector((state: RootState) => state.flight.sessionStartedAt);
  const [showWarning, setShowWarning] = useState(false);
  const [expired, setExpired] = useState(false);

  const handleExpired = useCallback(() => {
    setExpired(true);
    dispatch(clearSearch());
    dispatch(resetBooking());
    dispatch(resetPayment());
    router.push('/');
  }, [dispatch, router]);

  useEffect(() => {
    if (!sessionStartedAt) return;

    const checkTimeout = () => {
      const elapsed = Date.now() - sessionStartedAt;
      const remaining = SESSION_DURATION_MS - elapsed;

      if (remaining <= 0) {
        handleExpired();
      } else if (remaining <= WARNING_BEFORE_MS) {
        setShowWarning(true);
      }
    };

    checkTimeout();
    const interval = setInterval(checkTimeout, 10_000);
    return () => clearInterval(interval);
  }, [sessionStartedAt, handleExpired]);

  return { showWarning, expired, dismissWarning: () => setShowWarning(false) };
}
