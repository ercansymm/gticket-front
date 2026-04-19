"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { emailService } from "@/services/emailService";
import type { FlightSearchEmailFlight, EmailSendStatus } from "@/types/email";

interface SearchCriteria {
  origin: string;
  destination: string;
  departureDate: string;
  passengerCount: number;
}

interface EmailSearchResultsButtonProps {
  flights: FlightSearchEmailFlight[];
  searchCriteria: SearchCriteria;
  variant?: "default" | "sidebar";
  className?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// â”€â”€ Inline SVG icons (avoids external icon dep) â”€â”€
const IconMail = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const IconClose = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const IconSpinner = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const IconCheck = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IconAlert = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export function EmailSearchResultsButton({
  flights,
  searchCriteria,
  variant = "default",
  className = "",
}: EmailSearchResultsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<EmailSendStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Portal mount flag (SSR-safe)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const closeModal = useCallback(() => {
    setStatus((current) => {
      if (current === "loading") return current;
      setIsOpen(false);
      window.setTimeout(() => {
        setEmail("");
        setName("");
        setStatus("idle");
        setErrorMessage(null);
      }, 200);
      return current;
    });
  }, []);

  // Body scroll lock + ESC handler
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, closeModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus("error");
      setErrorMessage("E-posta adresi gereklidir.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setStatus("error");
      setErrorMessage("GeÃ§erli bir e-posta adresi giriniz.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      await emailService.sendSearchResults({
        toEmail: trimmedEmail,
        passengerName: name.trim() || undefined,
        ...searchCriteria,
        flights,
      });
      setStatus("success");
      window.setTimeout(() => closeModal(), 2500);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "E-posta gÃ¶nderilemedi"
      );
    }
  };

  if (flights.length === 0) return null;

  const buttonClasses =
    variant === "sidebar"
      ? `w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold bg-white border-2 border-[#047857] text-[#047857] hover:bg-[#047857] hover:text-white transition-colors duration-200 shadow-sm ${className}`
      : `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-[#0a1628] hover:bg-[#f8fafc] hover:border-[#047857] hover:text-[#047857] transition-colors duration-200 shadow-sm ${className}`;

  const iconSize = variant === "sidebar" ? "w-5 h-5" : "w-4 h-4";

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0a1628] text-white">
          <div className="flex items-center gap-2">
            <IconMail className="w-5 h-5" />
            <h2 id="email-modal-title" className="font-semibold">
              SonuÃ§larÄ± E-posta ile Al
            </h2>
          </div>
          <button
            type="button"
            onClick={closeModal}
            disabled={status === "loading"}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Kapat"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {status === "success" ? (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4 text-[#047857]">
              <IconCheck className="w-16 h-16" />
            </div>
            <h3 className="text-lg font-semibold text-[#1e293b] mb-2">
              E-posta GÃ¶nderildi!
            </h3>
            <p className="text-sm text-slate-600">
              Arama sonuÃ§larÄ± birkaÃ§ dakika iÃ§inde adresinize ulaÅŸacaktÄ±r.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-slate-600">
              UÃ§uÅŸ arama sonuÃ§larÄ±nÄ±zÄ± e-posta adresinize gÃ¶ndermek iÃ§in aÅŸaÄŸÄ±daki bilgileri doldurun.
            </p>

            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-[#1e293b] mb-1">
                E-posta Adresi <span className="text-red-500">*</span>
              </label>
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") {
                    setStatus("idle");
                    setErrorMessage(null);
                  }
                }}
                disabled={status === "loading"}
                placeholder="ornek@email.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-transparent transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="name-input" className="block text-sm font-medium text-[#1e293b] mb-1">
                AdÄ±nÄ±z <span className="text-slate-400 text-xs">(opsiyonel)</span>
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={status === "loading"}
                placeholder="Ad Soyad"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-transparent transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <span className="text-red-600 mt-0.5 flex-shrink-0">
                  <IconAlert className="w-4 h-4" />
                </span>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={status === "loading"}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-[#1e293b] hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                VazgeÃ§
              </button>
              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#047857] hover:bg-[#065f46] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#047857]"
              >
                {status === "loading" ? (
                  <>
                    <IconSpinner className="w-4 h-4 animate-spin" />
                    GÃ¶nderiliyor...
                  </>
                ) : (
                  <>
                    <IconMail className="w-4 h-4" />
                    GÃ¶nder
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonClasses}
        aria-label="Arama sonuÃ§larÄ±nÄ± e-posta olarak gÃ¶nder"
      >
        <IconMail className={iconSize} />
        <span>E-posta ile GÃ¶nder</span>
      </button>

      {isMounted && isOpen && createPortal(modal, document.body)}
    </>
  );
}

export default EmailSearchResultsButton;
