"use client";

import { useEffect, useState, useCallback } from 'react';

interface CountdownTimerProps {
  expiresAt: string | null;
  onExpired: () => void;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const calcRemaining = useCallback(() => {
    if (!expiresAt) return null;
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt) return;
    setRemainingSeconds(calcRemaining());

    const interval = setInterval(() => {
      const remaining = calcRemaining();
      setRemainingSeconds(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, calcRemaining, onExpired]);

  if (remainingSeconds == null || !expiresAt) return null;

  const isUrgent = remainingSeconds <= 300; // Son 5 dakika
  const isExpired = remainingSeconds === 0;

  if (isExpired) {
    return (
      <div className="bb-countdown bb-countdown--expired">
        <span className="bb-countdown__icon">⏱</span>
        <span className="bb-countdown__text">Süreniz doldu. Lütfen yeniden arama yapın.</span>
      </div>
    );
  }

  return (
    <div className={`bb-countdown ${isUrgent ? 'bb-countdown--urgent' : ''}`}>
      <span className="bb-countdown__icon">⏱</span>
      <span className="bb-countdown__text">
        Rezervasyonunuzu tamamlamak için <strong>{formatTime(remainingSeconds)}</strong> kaldı
      </span>
    </div>
  );
}
