"use client";

// PNR talep oluşturma formu (iptal / değişiklik / tekerlekli sandalye vb.)
import { useState } from "react";

export type TicketRequestType =
  | "iptal"
  | "degisiklik"
  | "tekerlekli_sandalye"
  | "ozel_yemek"
  | "bagaj"
  | "diger";

export interface TicketRequestPayload {
  type: TicketRequestType;
  description: string;
}

interface TicketRequestFormProps {
  onSubmit: (data: TicketRequestPayload) => void | Promise<void>;
  onClose: () => void;
  submitting?: boolean;
}

const REQUEST_TYPES: { value: TicketRequestType; label: string }[] = [
  { value: "iptal", label: "İptal Talebi" },
  { value: "degisiklik", label: "Tarih / Uçuş Değişikliği" },
  { value: "tekerlekli_sandalye", label: "Tekerlekli Sandalye Talebi" },
  { value: "ozel_yemek", label: "Özel Yemek Talebi" },
  { value: "bagaj", label: "Ek Bagaj Talebi" },
  { value: "diger", label: "Diğer" },
];

export default function TicketRequestForm({
  onSubmit,
  onClose,
  submitting = false,
}: TicketRequestFormProps) {
  const [type, setType] = useState<TicketRequestType>("iptal");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Lütfen talebiniz hakkında kısa bir açıklama giriniz.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Açıklama en az 10 karakter olmalıdır.");
      return;
    }
    setError("");
    await onSubmit({ type, description: description.trim() });
  };

  return (
    <div className="bb-error-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="bb-error-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-request-title"
      >
        <div className="bb-error-modal__header">
          <h3 id="ticket-request-title" style={{ color: "var(--bb-gray-800)" }}>
            Talep Oluştur
          </h3>
          <button
            type="button"
            className="bb-error-modal__close"
            onClick={onClose}
            aria-label="Kapat"
            disabled={submitting}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bb-error-modal__body">
            <div className="pnr-search__field">
              <label className="pnr-search__label" htmlFor="request-type">
                Talep Tipi
              </label>
              <select
                id="request-type"
                className="pnr-search__input"
                value={type}
                onChange={(e) => setType(e.target.value as TicketRequestType)}
                disabled={submitting}
              >
                {REQUEST_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pnr-search__field" style={{ marginTop: 12 }}>
              <label className="pnr-search__label" htmlFor="request-description">
                Açıklama
              </label>
              <textarea
                id="request-description"
                className={`pnr-search__input ${error ? "pnr-search__input--error" : ""}`}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Talebinizle ilgili detayları yazınız..."
                maxLength={1000}
                disabled={submitting}
                style={{ resize: "vertical", minHeight: 96 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {error ? <span className="pnr-search__error">{error}</span> : <span />}
                <span style={{ fontSize: 12, color: "var(--bb-gray-400)" }}>
                  {description.length}/1000
                </span>
              </div>
            </div>
          </div>

          <div className="bb-error-modal__footer">
            <button
              type="button"
              className="bb-error-modal__btn bb-error-modal__btn--close"
              onClick={onClose}
              disabled={submitting}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="bb-error-modal__btn bb-error-modal__btn--retry"
              disabled={submitting}
            >
              {submitting ? "Gönderiliyor..." : "Talebi Gönder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
