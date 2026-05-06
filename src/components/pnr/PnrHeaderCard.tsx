"use client";

import { Download, Loader2, Printer, Users } from "lucide-react";
import type { BookingDetailResponse } from "@/types/flight";

interface PnrHeaderCardProps {
  booking: BookingDetailResponse;
  onDownloadPdf: () => void;
  pdfLoading?: boolean;
  onPrint: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  PreBooked: { label: "Ön Rezervasyon", badgeClass: "pnr-badge--prebooked" },
  Reserved: { label: "Rezerve Edildi", badgeClass: "pnr-badge--reserved" },
  Confirmed: { label: "Onaylandı", badgeClass: "pnr-badge--confirmed" },
  Paid: { label: "Ödendi", badgeClass: "pnr-badge--paid" },
  Ticketed: { label: "Biletlendi", badgeClass: "pnr-badge--ticketed" },
  Cancelled: { label: "İptal Edildi", badgeClass: "pnr-badge--cancelled" },
  Failed: { label: "Hata Oluştu", badgeClass: "pnr-badge--failed" },
};

export default function PnrHeaderCard({
  booking,
  onDownloadPdf,
  pdfLoading = false,
  onPrint,
}: PnrHeaderCardProps) {
  const statusInfo = booking.status ? STATUS_CONFIG[booking.status] : null;
  const pnrCode = booking.pnr ?? booking.bookingCode ?? "—";
  const passengerCount = booking.passengers?.length ?? 0;
  const firstPassenger = booking.passengers?.[0];
  const passengerName = firstPassenger
    ? `${firstPassenger.firstName ?? ""} ${firstPassenger.lastName ?? ""}`.trim()
    : "—";

  return (
    <div className="pnr-card">
      <div className="pnr-header">
        <div className="pnr-header__left">
          <div className="pnr-header__meta">
            <span className="pnr-header__meta-label">ATA PNR Kodu</span>
            {statusInfo && (
              <span className={`pnr-badge ${statusInfo.badgeClass}`}>
                {statusInfo.label}
              </span>
            )}
          </div>
          <h2 className="pnr-header__pnr">{pnrCode}</h2>
          <div className="pnr-header__passenger">
            <Users size={16} />
            <span>{passengerName}</span>
            {passengerCount > 1 && (
              <span className="pnr-header__passenger-extra">
                +{passengerCount - 1} yolcu
              </span>
            )}
          </div>
        </div>

        <div className="pnr-header__actions">
          <button
            type="button"
            onClick={onDownloadPdf}
            aria-label="PDF İndir"
            className="pnr-action-btn"
            disabled={pdfLoading}
          >
            {pdfLoading ? <Loader2 size={16} className="pnr-spin" /> : <Download size={16} />}
            <span className="pnr-action-btn__label">{pdfLoading ? "..." : "PDF"}</span>
          </button>
          <button
            type="button"
            onClick={onPrint}
            aria-label="Yazdır"
            className="pnr-action-btn"
          >
            <Printer size={16} />
            <span className="pnr-action-btn__label">Yazdır</span>
          </button>
        </div>
      </div>
    </div>
  );
}
