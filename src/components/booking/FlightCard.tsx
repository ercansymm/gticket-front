import { useState } from 'react';
import Image from 'next/image';
import type { FlightResult, FarePackage } from '@/types';
import FarePackageSelector from './FarePackageSelector';

interface FlightCardProps {
  flight: FlightResult;
  onSelect: (brandedFareItemId?: string | null) => void;
  isSelected?: boolean;
  allocateLoading?: boolean;
}

function getBaggageDisplay(flight: FlightResult): string | null {
  if (flight.baggageInfo?.displayText) return flight.baggageInfo.displayText;
  if (flight.freeBaggageAllowances && flight.freeBaggageAllowances.length > 0) {
    const bag = flight.freeBaggageAllowances[0];
    if (bag.allowance && bag.unit) {
      return `${bag.allowance} ${bag.unit}`;
    }
  }
  return null;
}

function getAirlineInitials(name: string | null): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

/** Brand colors for known airlines */
const AIRLINE_COLORS: Record<string, { bg: string; color: string }> = {
  TK: { bg: '#E30A17', color: '#fff' },   // Turkish Airlines
  PC: { bg: '#FFB800', color: '#1a1a1a' }, // Pegasus
  VF: { bg: '#1A56DB', color: '#fff' },    // AnadoluJet
  XQ: { bg: '#E30A17', color: '#fff' },    // SunExpress
  KK: { bg: '#00529B', color: '#fff' },    // AtlasGlobal
};

const FALLBACK_STYLE = { bg: '#6b7280', color: '#fff' };

function getAirlineLogoPath(code: string | null): string | null {
  if (!code) return null;
  return `/images/airlines/${code}.svg`;
}

function getAirlineBrandStyle(code: string | null): { bg: string; color: string } {
  return (code && AIRLINE_COLORS[code]) || FALLBACK_STYLE;
}

const FlightCard = ({ flight, onSelect, isSelected = false, allocateLoading = false }: FlightCardProps) => {
  const [logoError, setLogoError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const baggageDisplay = getBaggageDisplay(flight);
  const logoPath = getAirlineLogoPath(flight.airlineCode);
  const brandStyle = getAirlineBrandStyle(flight.airlineCode);

  const hasPackages = flight.farePackages && flight.farePackages.length > 1;

  // Default selected package: isDefault=true or first package
  const defaultPkg = hasPackages
    ? (flight.farePackages.find(p => p.isDefault) ?? flight.farePackages[0])
    : null;
  const [selectedPkg, setSelectedPkg] = useState<FarePackage | null>(defaultPkg);

  // Displayed price: selected package price or flight's totalFare
  const displayPrice = (hasPackages && selectedPkg) ? selectedPkg.totalFare : flight.totalFare;
  const displayPriceFormatted = (hasPackages && selectedPkg?.totalFareFormatted)
    ? selectedPkg.totalFareFormatted
    : displayPrice?.toLocaleString('tr-TR', { minimumFractionDigits: 0 });

  const handlePackageSelect = (pkg: FarePackage) => {
    setSelectedPkg(pkg);
  };

  const handleContinue = () => {
    const fareItemId = (hasPackages && selectedPkg) ? selectedPkg.brandedFareItemId : null;
    onSelect(fareItemId);
  };

  return (
    <div className={`bb-flight-card ${isSelected ? 'bb-flight-card--selected' : ''}`}>
      {/* Üst kısım: havayolu + zaman çizgisi + fiyat + genişlet butonu */}
      <div className="bb-flight-card__top">
        {/* Airline */}
        <div className="bb-flight-card__airline">
          <div
            className="bb-flight-card__airline-logo"
            style={logoError || !logoPath ? { background: brandStyle.bg, color: brandStyle.color, border: 'none' } : undefined}
          >
            {logoPath && !logoError ? (
              <Image
                src={logoPath}
                alt={flight.airlineName ?? 'airline'}
                width={40}
                height={40}
                onError={() => setLogoError(true)}
              />
            ) : (
              <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>
                {flight.airlineCode ?? getAirlineInitials(flight.airlineName)}
              </span>
            )}
          </div>
          <div className="bb-flight-card__airline-info">
            <span className="bb-flight-card__airline-name">{flight.airlineName}</span>
            <span className="bb-flight-card__flight-number">{flight.flightNumber}</span>
          </div>
        </div>

        {/* Time track: Departure ——✈—— Arrival */}
        <div className="bb-flight-card__track">
          <div className="bb-flight-card__track-endpoint">
            <div className="bb-flight-card__track-time">{flight.departureTime}</div>
            <div className="bb-flight-card__track-code">{flight.originCode}</div>
          </div>
          <div className="bb-flight-card__track-line">
            <div className="bb-flight-card__track-duration">{flight.durationFormatted}</div>
            <div className="bb-flight-card__track-bar-wrap">
              <span className="bb-flight-card__track-dot bb-flight-card__track-dot--start" />
              <span className={`bb-flight-card__track-bar ${!flight.isDirect ? 'bb-flight-card__track-bar--stops' : ''}`} />
              {!flight.isDirect && <span className="bb-flight-card__track-stop-dot" />}
              <span className="bb-flight-card__track-dot bb-flight-card__track-dot--end" />
            </div>
            {flight.isDirect ? (
              <div className="bb-flight-card__track-direct">Aktarmasız</div>
            ) : (
              <div className="bb-flight-card__track-stops">{flight.stopText}</div>
            )}
          </div>
          <div className="bb-flight-card__track-endpoint">
            <div className="bb-flight-card__track-time">{flight.arrivalTime}</div>
            <div className="bb-flight-card__track-code">{flight.destinationCode}</div>
          </div>
        </div>

        {/* Fiyat + seç butonu */}
        <div className="bb-flight-card__price-section">
          <div className="bb-flight-card__price-amount">
            {displayPriceFormatted}
            <span className="bb-flight-card__price-currency">{flight.currency ?? 'TRY'}</span>
          </div>
          <button
            className="bb-flight-card__select-btn"
            onClick={() => {
              if (hasPackages) {
                setExpanded(!expanded);
              } else {
                onSelect(null);
              }
            }}
          >
            {hasPackages
              ? (expanded ? 'Gizle' : 'Seç')
              : 'Seç ve İlerle'}
            {' '}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
              {hasPackages && expanded
                ? <polyline points="18 15 12 9 6 15" />
                : <polyline points="9 18 15 12 9 6" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="bb-flight-card__badges-row">
        {flight.isDirect ? (
          <span className="bb-flight-card__badge bb-flight-card__badge--direct">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg> Direkt
          </span>
        ) : (
          <span className="bb-flight-card__badge bb-flight-card__badge--stop">{flight.stopText}</span>
        )}
        <span className={`bb-flight-card__badge ${flight.isRefundable ? 'bb-flight-card__badge--refundable' : 'bb-flight-card__badge--nonrefundable'}`}>
          {flight.refundableText}
        </span>
        {baggageDisplay && (
          <span className="bb-flight-card__badge bb-flight-card__badge--baggage">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="16" rx="1" /><path d="M9 4V2" /><path d="M15 4V2" /><path d="M6 14h12" /></svg> {baggageDisplay}
          </span>
        )}
        {flight.cabinClassName && (
          <span className="bb-flight-card__badge bb-flight-card__badge--cabin">{flight.cabinClassName}</span>
        )}
        {flight.availableSeats > 0 && flight.availableSeats <= 9 && (
          <span className="bb-flight-card__badge bb-flight-card__badge--seats">
            {flight.availableSeatsText}
          </span>
        )}
      </div>

      {/* Fare Packages */}
      {hasPackages && expanded && (
        <FarePackageSelector
          packages={flight.farePackages}
          selectedId={selectedPkg?.brandedFareItemId ?? null}
          onSelect={handlePackageSelect}
          onContinue={handleContinue}
          loading={allocateLoading}
        />
      )}

    </div>
  );
};

export default FlightCard;
