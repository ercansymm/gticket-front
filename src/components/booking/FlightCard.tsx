import { useState } from 'react';
import Image from 'next/image';
import type { FlightResult, BrandedFareItem, BrandedItem, BrandedRule } from '@/types';

interface FlightCardProps {
  flight: FlightResult;
  onSelect: (brandedFareItemId?: string | null) => void;
}

function getRuleIcon(application: string | null): string {
  switch (application) {
    case 'F': return '✅';
    case 'C': return '💰';
    case 'N': return '❌';
    default: return '—';
  }
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

/** Local airline logo path */
function getAirlineLogoPath(code: string | null): string | null {
  if (!code) return null;
  return `/images/airlines/${code}.svg`;
}

function getAirlineBrandStyle(code: string | null): { bg: string; color: string } {
  return (code && AIRLINE_COLORS[code]) || FALLBACK_STYLE;
}

/** brandedFareItems → BrandedItem[] tümünü topla (görüntülenecek paketler) */
function collectBrandedItems(fareItems: BrandedFareItem[]): Array<{
  brandedFareItemId: string | null;
  brandItem: BrandedItem;
  totalFare: number;
  totalFareFormatted: string;
  currency: string;
}> {
  const result: Array<{
    brandedFareItemId: string | null;
    brandItem: BrandedItem;
    totalFare: number;
    totalFareFormatted: string;
    currency: string;
  }> = [];

  for (const fareItem of fareItems) {
    const totalInfo = fareItem.totalFareInfo;
    const totalFare = totalInfo?.totalFare ?? 0;
    const currency = fareItem.brandedFarePassengers?.[0]?.passengerFareInfo?.currency ?? 'TRY';

    for (const bi of fareItem.brandedItems ?? []) {
      result.push({
        brandedFareItemId: fareItem.brandedFareItemId,
        brandItem: bi,
        totalFare,
        totalFareFormatted: totalFare.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ' + currency,
        currency,
      });
    }
  }

  return result;
}

const FlightCard = ({ flight, onSelect }: FlightCardProps) => {
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const baggageDisplay = getBaggageDisplay(flight);
  const brandedItems = collectBrandedItems(flight.brandedFareItems ?? []);
  const hasPackages = brandedItems.length > 0;
  const logoPath = getAirlineLogoPath(flight.airlineCode);
  const brandStyle = getAirlineBrandStyle(flight.airlineCode);

  return (
    <div className="bb-flight-card">
      {/* Üst kısım: havayolu + zaman çizgisi + fiyat */}
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
              <span className="bb-flight-card__track-plane">✈</span>
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

        {/* Paket yoksa doğrudan fiyat + seç butonu */}
        {!hasPackages && (
          <div className="bb-flight-card__price-section">
            <div className="bb-flight-card__price-amount">
              {flight.totalFare?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              <span style={{ fontSize: 14, fontWeight: 500, marginLeft: 4 }}>{flight.currency ?? 'TRY'}</span>
            </div>
            <div className="bb-flight-card__price-note">kişi başı</div>
            <button className="bb-flight-card__select-btn" onClick={() => onSelect(null)}>
              Uçuşu Seç
            </button>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="bb-flight-card__badges-row">
        {flight.isDirect ? (
          <span className="bb-flight-card__badge bb-flight-card__badge--direct">
            <i className="fa-solid fa-arrow-right" /> Direkt
          </span>
        ) : (
          <span className="bb-flight-card__badge bb-flight-card__badge--stop">{flight.stopText}</span>
        )}
        <span className={`bb-flight-card__badge ${flight.isRefundable ? 'bb-flight-card__badge--refundable' : 'bb-flight-card__badge--nonrefundable'}`}>
          {flight.refundableText}
        </span>
        {baggageDisplay && (
          <span className="bb-flight-card__badge bb-flight-card__badge--baggage">🧳 {baggageDisplay}</span>
        )}
        {flight.cabinClassName && (
          <span className="bb-flight-card__badge bb-flight-card__badge--cabin">{flight.cabinClassName}</span>
        )}
        {flight.availableSeats > 0 && flight.availableSeats <= 9 && (
          <span className="bb-flight-card__badge bb-flight-card__badge--seats">
            🔥 {flight.availableSeatsText}
          </span>
        )}
      </div>

      {/* Fare paketleri */}
      {hasPackages && (
        <div className="bb-flight-card__packages">
          {brandedItems.map((pkg) => {
            const pkgId = pkg.brandedFareItemId ?? pkg.brandItem.brandCode;
            const isExpanded = expandedPackage === pkgId;
            return (
              <div
                key={pkgId}
                className={`bb-fare-package ${isExpanded ? 'bb-fare-package--expanded' : ''}`}
              >
                <div
                  className="bb-fare-package__header"
                  onClick={() => setExpandedPackage(isExpanded ? null : (pkgId ?? null))}
                >
                  <span className="bb-fare-package__name">{pkg.brandItem.brandName}</span>
                  <span className="bb-fare-package__price">{pkg.totalFareFormatted}</span>
                </div>

                <div className="bb-fare-package__rules">
                  {(pkg.brandItem.brandedRules ?? []).slice(0, isExpanded ? undefined : 3).map((rule: BrandedRule, idx: number) => (
                    <div key={idx} className="bb-fare-package__rule">
                      <span className="bb-fare-package__rule-icon">{getRuleIcon(rule.application)}</span>
                      <span className="bb-fare-package__rule-text">{rule.ruleDescription}</span>
                    </div>
                  ))}
                  {!isExpanded && (pkg.brandItem.brandedRules ?? []).length > 3 && (
                    <div className="bb-fare-package__more">
                      +{(pkg.brandItem.brandedRules ?? []).length - 3} kural daha
                    </div>
                  )}
                </div>

                <button
                  className="bb-fare-package__select"
                  onClick={() => onSelect(pkg.brandedFareItemId)}
                >
                  Seç
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlightCard;
