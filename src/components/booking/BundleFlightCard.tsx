"use client";

import { useState } from "react";
import Image from "next/image";
import type { FlightResult, FarePackage } from "@/types";

interface BundleFlightCardProps {
  outbound: FlightResult;
  /** Gidiş ile aynı bundleProductId paylaşan dönüş bacağı */
  returnFlight: FlightResult;
  onSelect: (brandedFareItemId?: string | null) => void;
  onOpenPackages?: () => void;
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

// ── Fare paketi satır bileşeni ────────────────────────────────────
interface FarePkgRowProps {
  pkg: FarePackage;
  isSelected: boolean;
  isDefault: boolean;
  onPick: (pkg: FarePackage) => void;
  onContinue: (pkg: FarePackage) => void;
  loading: boolean;
}

function FarePkgRow({ pkg, isSelected, isDefault, onPick, onContinue, loading }: FarePkgRowProps) {
  const diffText = pkg.priceDifferenceFormatted
    ? `+${pkg.priceDifferenceFormatted}`
    : null;

  return (
    <div
      className={`bb-bundle-card__fare-row ${
        isSelected ? "bb-bundle-card__fare-row--selected" : ""
      }`}
      onClick={() => onPick(pkg)}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onPick(pkg)}
    >
      {/* Radyo göstergesi */}
      <div className="bb-bundle-card__fare-radio">
        {isSelected && <div className="bb-bundle-card__fare-radio-dot" />}
      </div>

      {/* Paket adı + Önerilen rozeti */}
      <div className="bb-bundle-card__fare-info">
        <span className="bb-bundle-card__fare-name">
          {pkg.brandName ?? (isDefault ? "En Ucuz" : "Paket")}
        </span>
        {isDefault && (
          <span className="bb-bundle-card__fare-badge bb-bundle-card__fare-badge--cheapest">
            En Ucuz
          </span>
        )}
        {!isDefault && (
          <span className="bb-bundle-card__fare-badge bb-bundle-card__fare-badge--recommended">
            Önerilen
          </span>
        )}
      </div>

      {/* Fiyat */}
      <div className="bb-bundle-card__fare-price">
        <span className="bb-bundle-card__fare-price-amount">
          {pkg.totalFareFormatted ?? pkg.totalFare.toLocaleString("tr-TR")}
        </span>
        <span className="bb-bundle-card__fare-price-currency">{pkg.currency ?? "TRY"}</span>
        {diffText && (
          <span className="bb-bundle-card__fare-price-diff">{diffText}</span>
        )}
      </div>

      {/* Seç butonu (seçiliyse) */}
      {isSelected && (
        <button
          className="bb-bundle-card__fare-select-btn"
          onClick={(e) => { e.stopPropagation(); onContinue(pkg); }}
          disabled={loading}
        >
          {loading ? (
            <span className="bb-spinner bb-spinner--sm" />
          ) : (
            "Devam →"
          )}
        </button>
      )}
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
  const currency = outbound.currency ?? "TRY";
  const farePackages = outbound.farePackages ?? [];
  const hasFares = farePackages.length > 1;

  // Varsayılan seçili paket: isDefault=true veya ilk paket
  const defaultPkg = hasFares
    ? (farePackages.find((p) => p.isDefault) ?? farePackages[0])
    : null;
  const [selectedPkg, setSelectedPkg] = useState<FarePackage | null>(defaultPkg);

  // Görüntülenecek fiyat: seçili paket varsa onun fiyatı, yoksa outbound.totalFare
  const displayFare = (hasFares && selectedPkg)
    ? selectedPkg.totalFare
    : (outbound.totalFare ?? 0);
  const displayFormatted = (hasFares && selectedPkg?.totalFareFormatted)
    ? selectedPkg.totalFareFormatted
    : displayFare.toLocaleString("tr-TR", { minimumFractionDigits: 0 });

  const handleContinue = (pkg: FarePackage) => {
    onSelect(pkg.brandedFareItemId);
  };

  const handleSelectNoFares = () => {
    onSelect(null);
  };

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

      {/* Fare seçenekleri (varsa) */}
      {hasFares ? (
        <div className="bb-bundle-card__fares">
          <div className="bb-bundle-card__fares-header">Tarife Seçin</div>
          {farePackages.map((pkg) => (
            <FarePkgRow
              key={pkg.brandedFareItemId}
              pkg={pkg}
              isSelected={selectedPkg?.brandedFareItemId === pkg.brandedFareItemId}
              isDefault={!!pkg.isDefault}
              onPick={setSelectedPkg}
              onContinue={handleContinue}
              loading={loading}
            />
          ))}
        </div>
      ) : (
        /* Fare yok — sadece fiyat ve tek buton */
        <div className="bb-bundle-card__footer">
          <div className="bb-bundle-card__price-wrap">
            <span className="bb-bundle-card__price-label">Toplam</span>
            <div className="bb-bundle-card__price">
              <span className="bb-bundle-card__price-amount">{displayFormatted}</span>
              <span className="bb-bundle-card__price-currency">{currency}</span>
            </div>
            <span className="bb-bundle-card__price-note">Gidiş + dönüş dahil</span>
          </div>
          <button
            className="bb-bundle-card__select-btn"
            onClick={handleSelectNoFares}
            disabled={loading}
          >
            {loading ? (
              <span className="bb-spinner bb-spinner--sm" />
            ) : (
              <>
                Paketi Seç
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
