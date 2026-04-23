"use client";

import { XCircle, RefreshCw, Ticket, AlertCircle } from "lucide-react";

interface ActionPanelProps {
  isCancelled: boolean;
  onCancel: () => void;
  onChange: () => void;
  onOpenTicket: () => void;


  


}

export default function ActionPanel({
  isCancelled,
  onCancel,
  onChange,
  onOpenTicket,
}: ActionPanelProps) {
  if (isCancelled) {
    return (
      <div className="pnr-card pnr-actions">
        <div className="pnr-cancelled-banner">
          <AlertCircle size={18} />
          <span>Bu bilet iptal edilmiştir.</span>
        </div>
        <div className="pnr-actions__list">
          <button type="button" disabled className="pnr-actions__btn pnr-actions__btn--cancel">
            <XCircle size={16} /> Bileti İptal Et
          </button>
          <button type="button" disabled className="pnr-actions__btn pnr-actions__btn--primary">
            <RefreshCw size={16} /> Değişiklik Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pnr-card pnr-actions">
      <h3 className="pnr-actions__title">İşlemler</h3>
      <div className="pnr-actions__list">
        <button
          type="button"
          onClick={onCancel}
          className="pnr-actions__btn pnr-actions__btn--cancel"
        >
          <XCircle size={16} /> Bileti İptal Et
        </button>
        <button
          type="button"
          onClick={onChange}
          className="pnr-actions__btn pnr-actions__btn--primary"
        >
          <RefreshCw size={16} /> Değişiklik Yap
        </button>
        {/* Talep Oluştur butonu kaldırıldı */}
      </div>
    </div>
  );
}
