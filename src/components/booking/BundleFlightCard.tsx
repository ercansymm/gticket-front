"use client";

import { useState } from "react";
import Image from "next/image";
import type { FlightResult } from "@/types";

interface BundleFlightCardProps {
  outbound: FlightResult;
  /** Gidiş ile aynı bundleProductId paylaşan dönüş bacağı */
  returnFlight: FlightResult;
  onSelect: () => void;
  loading?: boolean;
}

const AIRLINE_COLORS: Record<string, { bg: string; color: string }> = {
  TK: { bg: "#E30A17", color: "#fff" },
  PC: { bg: "#FFB800", color: "#1a1a1a" },
  VF: { bg: "#1A56DB", color: "#fff" },
  XQ: { bg: "#E30A17", color: "#fff" },
  KK: { bg: "#00529B", color: "#fff" },
  BA: { bg: "#075AAA", color: "#fff" },
  EZY: { bg: "#FF6600", color: "#fff" },
};
const FALLBACK = { bg: "#6b7280", color: "#fff" };

function airlineStyle(code: string | null) {
  return (code && AIRLINE_COLORS[code]) || FALLBACK;
}

function airlineInitials(name: string | null): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

interface LegRowProps {
  flight: FlightResult;
  label: string;
  labelColor: string;
}

function LegRow({ flight, label, labelColor }: LegRowProps) {
  const [logoError, setLogoError] = useState(false);
  const logoPath = flight.airlineCode ? `/images/airlines/${flight.airlineCode}.svg` : null;
  const brand = airlineStyle(flight.airlineCode);

  return (
    <div className="bb-bundle-card__leg">
      {/* Direction badge */}
      <div className="bb-bundle-card__leg-badge" style={{ background: labelColor }}>
        {label}
      </div>

      {/* Airline logo */}
      <div
        className="bb-bundle-card__leg-logo"
        style={
          logoError || !logoPath
            ? { background: brand.bg, color: brand.color }
            : undefined
        }
      >
        {logoPath && !logoError ? (
          <Image
            src={logoPath}
            alt={flight.airlineName ?? "airline"}
            width={32}
            height={32}
            onError={() => setLogoError(true)}
          />
        ) : (
          <span style={{ fontWeight: 700, fontSize: 12 }}>
            {flight.airlineCode ?? airlineInitials(flight.airlineName)}
          </span>
        )}
      </div>

      {/* Airline name + flight no */}
      <div className="bb-bundle-card__leg-info">
        <span className="bb-bundle-card__leg-airline">{flight.airlineName}</span>
        <span className="bb-bundle-card__leg-flno">{flight.flightNumber}</span>
      </div>

      {/* Route + time track */}
      <div className="bb-bundle-card__leg-track">
        <div className="bb-bundle-card__leg-endpoint">
          <span className="bb-bundle-card__leg-time">{flight.departureTime}</span>
          <span className="bb-bundle-card__leg-code">{flight.originCode}</span>
        </div>

        <div className="bb-bundle-card__leg-line">
          <span className="bb-bundle-card__leg-duration">{flight.durationFormatted}</span>
          <div className="bb-bundle-card__leg-bar-wrap">
            <span className="bb-bundle-card__leg-dot bb-bundle-card__leg-dot--start" />
            <span
              className={`bb-bundle-card__leg-bar ${!flight.isDirect ? "bb-bundle-card__leg-bar--stops" : ""}`}
            />
            {!flight.isDirect && (
              <span className="bb-bundle-card__leg-stop-dot" />
            )}
            <span className="bb-bundle-card__leg-dot bb-bundle-card__leg-dot--end" />
          </div>
          {flight.isDirect ? (
            <span className="bb-bundle-card__leg-direct">Aktarmasız</span>
          ) : (
            <span className="bb-bundle-card__leg-stops">{flight.stopText}</span>
          )}
        </div>

        <div className="bb-bundle-card__leg-endpoint">
          <span className="bb-bundle-card__leg-time">{flight.arrivalTime}</span>
          <span className="bb-bundle-card__leg-code">{flight.destinationCode}</span>
        </div>
      </div>
    </div>
  );
}

/** Gidiş + dönüş bacağını tek kart içinde gösteren bundle bileşeni */
export default function BundleFlightCard({
  outbound,
  returnFlight,
  onSelect,
  loading = false,
}: BundleFlightCardProps) {
  // Toplam fiyat: outbound.totalFare zaten gidiş+dönüş toplamını içeriyor (RecommendationBox)
  const totalFare = outbound.totalFare ?? 0;
  const currency = outbound.currency ?? "TRY";
  const totalFormatted = totalFare.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
  });

  return (
    <div className="bb-bundle-card">
      {/* Bundle etiketi */}
      <div className="bb-bundle-card__banner">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        Gidiş + Dönüş Paketi
      </div>

      {/* Bacaklar */}
      <div className="bb-bundle-card__legs">
        <LegRow flight={outbound} label="Gidiş" labelColor="#047857" />
        <div className="bb-bundle-card__divider" />
        <LegRow flight={returnFlight} label="Dönüş" labelColor="#0369a1" />
      </div>

      {/* Alt kısım: fiyat + seç butonu */}
      <div className="bb-bundle-card__footer">
        <div className="bb-bundle-card__price-wrap">
          <span className="bb-bundle-card__price-label">Toplam (2 kişilik)</span>
          <div className="bb-bundle-card__price">
            <span className="bb-bundle-card__price-amount">{totalFormatted}</span>
            <span className="bb-bundle-card__price-currency">{currency}</span>
          </div>
          <span className="bb-bundle-card__price-note">Gidiş + dönüş dahil</span>
        </div>

        <button
          className="bb-bundle-card__select-btn"
          onClick={onSelect}
          disabled={loading}
        >
          {loading ? (
            <span className="bb-spinner bb-spinner--sm" />
          ) : (
            <>
              Paketi Seç
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginLeft: 6 }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
