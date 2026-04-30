"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import AirlineLogo from "@/components/common/AirlineLogo";

interface CheckInModalProps {
  pnr: string;
  passengerLastName: string;
  airlineCode: string;
  airlineName: string;
  checkInUrl: string;
  onClose: () => void;
}

export default function CheckInModal({
  pnr,
  passengerLastName,
  airlineCode,
  airlineName,
  checkInUrl,
  onClose,
}: CheckInModalProps) {
  const [copiedPnr, setCopiedPnr] = useState(false);
  const [copiedLastName, setCopiedLastName] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenUrl = () => {
    window.open(checkInUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      className="checkin-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-modal-title"
    >
      <div className="checkin-modal">
        {/* Header */}
        <div className="checkin-modal__header">
          <div className="checkin-modal__header-left">
            <AirlineLogo code={airlineCode} size={36} alt={airlineName} />
            <div>
              <h2 id="checkin-modal-title" className="checkin-modal__title">
                Online Check-in
              </h2>
              <span className="checkin-modal__airline-name">{airlineName}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="checkin-modal__close"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="checkin-modal__body">
          {/* Info box */}
          <div className="checkin-modal__info">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="checkin-modal__info-text">
              Check-in formunu otomatik dolduramıyoruz. Aşağıdaki bilgileri kopyalayıp check-in sayfasına manuel girin.
            </p>
          </div>

          {/* PNR field */}
          <div className="checkin-modal__field">
            <div className="checkin-modal__field-main">
              <span className="checkin-modal__field-label">PNR / Rezervasyon Kodu</span>
              <span className="checkin-modal__field-value">{pnr || "—"}</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(pnr, setCopiedPnr)}
              className={`checkin-modal__copy-btn${copiedPnr ? " checkin-modal__copy-btn--copied" : ""}`}
              aria-label="PNR'ı kopyala"
              disabled={!pnr}
            >
              {copiedPnr ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>

          {/* Last name field */}
          <div className="checkin-modal__field">
            <div className="checkin-modal__field-main">
              <span className="checkin-modal__field-label">Soyadı</span>
              <span className="checkin-modal__field-value">{passengerLastName || "—"}</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(passengerLastName, setCopiedLastName)}
              className={`checkin-modal__copy-btn${copiedLastName ? " checkin-modal__copy-btn--copied" : ""}`}
              aria-label="Soyadını kopyala"
              disabled={!passengerLastName}
            >
              {copiedLastName ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="checkin-modal__footer">
          <button
            type="button"
            onClick={onClose}
            className="checkin-modal__btn checkin-modal__btn--secondary"
          >
            Kapat
          </button>
          <button
            type="button"
            onClick={handleOpenUrl}
            className="checkin-modal__btn checkin-modal__btn--primary"
          >
            <ExternalLink size={14} />
            Check-in Sayfasını Aç
          </button>
        </div>
      </div>
    </div>
  );
}
