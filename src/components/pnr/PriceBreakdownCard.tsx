"use client";

import type { BookingDetailResponse } from "@/types/flight";

interface PriceBreakdownCardProps {
  booking: BookingDetailResponse;
}

function formatCurrency(value: number, currency: string | null): string {
  const cur = currency ?? "TRY";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 2,
  }).format(value);
}

export default function PriceBreakdownCard({
  booking,
}: PriceBreakdownCardProps) {
  const currency = booking.currency;
  const hasBreakdown =
    booking.baseFare > 0 || booking.taxes > 0 || booking.serviceFee > 0;
  const total = booking.grandTotal || booking.totalFare || 0;

  return (
    <div className="pnr-card">
      <h3 className="pnr-price__title">Fiyat Bilgileri</h3>

      {hasBreakdown && (
        <div className="pnr-price__rows">
          {booking.baseFare > 0 && (
            <div className="pnr-price__row">
              <span className="pnr-price__row-label">Bilet Tutarı</span>
              <span className="pnr-price__row-value">
                {formatCurrency(booking.baseFare, currency)}
              </span>
            </div>
          )}
          {booking.taxes > 0 && (
            <div className="pnr-price__row">
              <span className="pnr-price__row-label">Vergi ve Harçlar</span>
              <span className="pnr-price__row-value">
                {formatCurrency(booking.taxes, currency)}
              </span>
            </div>
          )}
          {booking.serviceFee > 0 && (
            <div className="pnr-price__row">
              <span className="pnr-price__row-label">Hizmet Bedeli</span>
              <span className="pnr-price__row-value">
                {formatCurrency(booking.serviceFee, currency)}
              </span>
            </div>
          )}
          <div className="pnr-price__divider" />
        </div>
      )}

      <div className="pnr-price__total">
        <span className="pnr-price__total-label">Toplam</span>
        <span className="pnr-price__total-value">
          {formatCurrency(total, currency)}
        </span>
      </div>

      {booking.createdAt && (
        <p className="pnr-price__date">
          Oluşturulma:{" "}
          {new Date(booking.createdAt).toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
