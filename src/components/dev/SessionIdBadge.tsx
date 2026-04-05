'use client';

import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

const SessionIdBadge = () => {
  const [copied, setCopied] = useState(false);

  const sessionId = useSelector((state: RootState) =>
    state.flight.searchResults?.__devSessionId ?? null
  );
  const searchId = useSelector((state: RootState) =>
    state.flight.searchId ?? state.flight.searchResults?.searchId ?? null
  );

  const displayId = sessionId ?? searchId;

  const handleCopy = useCallback(async () => {
    if (!displayId) return;
    try {
      await navigator.clipboard.writeText(displayId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API may be blocked
    }
  }, [displayId]);

  if (process.env.NODE_ENV !== 'development') return null;
  if (!displayId) return null;

  const shortId = displayId.length > 12
    ? `${displayId.slice(0, 6)}…${displayId.slice(-4)}`
    : displayId;
  const label = sessionId ? 'SES' : 'SID';

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`${sessionId ? 'Session' : 'Search'} ID: ${displayId}\nTıkla → Kopyala`}
      className="fixed top-2 right-2 z-[9999] flex items-center gap-1.5 rounded-md bg-slate-900/60 px-2.5 py-1 font-mono text-[11px] text-emerald-300 backdrop-blur-sm transition-opacity hover:opacity-100 opacity-50 cursor-pointer select-none"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
      {copied ? (
        <span className="text-green-400">Kopyalandı!</span>
      ) : (
        <span>{label}: {shortId}</span>
      )}
    </button>
  );
};

export default SessionIdBadge;
