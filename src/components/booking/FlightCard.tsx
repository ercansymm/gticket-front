import { useState } from 'react';
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
  if (flight.freeBaggageAllowances && flight.freeBaggageAllowances.length > 0) {
    const bag = flight.freeBaggageAllowances[0];
    if (bag.allowance && bag.unit) {
      return `${bag.allowance} ${bag.unit}`;
    }
  }
  return null;
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
  const baggageDisplay = getBaggageDisplay(flight);
  const brandedItems = collectBrandedItems(flight.brandedFareItems ?? []);
  const hasPackages = brandedItems.length > 0;

  return (
    <div className="bb-flight-card">
      {/* Üst kısım: havayolu + saat + fiyat */}
      <div className="bb-flight-card__top">
        <div className="bb-flight-card__airline">
          <span className="bb-flight-card__airline-name">{flight.airlineName}</span>
          <span className="bb-flight-card__flight-number">{flight.flightNumber}</span>
        </div>

        <div className="bb-flight-card__times">
          <div className="bb-flight-card__time">{flight.departureTime}</div>
          <div className="bb-flight-card__duration">
            {flight.durationFormatted}
            <span></span>
            {flight.originCode} → {flight.destinationCode}
          </div>
          <div className="bb-flight-card__time">{flight.arrivalTime}</div>
        </div>

        <div className="bb-flight-card__meta">
          <div className="bb-flight-card__badges">
            {flight.isDirect ? (
              <span className="bb-flight-card__badge bb-flight-card__badge--direct">
                {flight.stopText ?? 'Aktarmasız'}
              </span>
            ) : (
              <span className="bb-flight-card__badge bb-flight-card__badge--stop">
                {flight.stopText}
              </span>
            )}
            <span className={`bb-flight-card__badge ${flight.isRefundable ? 'bb-flight-card__badge--refundable' : 'bb-flight-card__badge--nonrefundable'}`}>
              {flight.refundableText}
            </span>
            {baggageDisplay && (
              <span className="bb-flight-card__badge bb-flight-card__badge--baggage">
                🧳 {baggageDisplay}
              </span>
            )}
            {flight.bookingClassName && (
              <span className="bb-flight-card__badge">
                {flight.bookingClassName}
              </span>
            )}
            {flight.availableSeats <= 9 && (
              <span className="bb-flight-card__badge bb-flight-card__badge--seats">
                {flight.availableSeatsText}
              </span>
            )}
          </div>
        </div>

        {/* Paket yoksa doğrudan fiyat + seç butonu */}
        {!hasPackages && (
          <div className="bb-flight-card__action">
            <div className="bb-flight-card__price">
              <div className="bb-flight-card__amount">{flight.totalFareFormatted}</div>
            </div>
            <button className="bb-flight-card__select" onClick={() => onSelect(null)}>
              Seç
            </button>
          </div>
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

                {/* Kurallar — her zaman göster ama kısa/uzun */}
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
