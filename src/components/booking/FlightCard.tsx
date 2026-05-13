import { useState } from 'react';
import Image from 'next/image';
import type { FlightResult, FarePackage } from '@/types';
import FarePackageSelector from './FarePackageSelector';
import { getAirlineLogoUrl, getAirlineBrandStyle, getAirlineInitials } from '@/utils/airlineUtils';
import { useCurrency } from '@/context/CurrencyContext';

interface FlightCardProps {
  flight: FlightResult;
  onSelect: (brandedFareItemId?: string | null) => void;
  onOpenPackages?: () => void;
  isSelected?: boolean;
  allocateLoading?: boolean;
  isBest?: boolean;
}


const FlightCard = ({ flight, onSelect, isSelected = false, allocateLoading = false, isBest = false }: FlightCardProps) => {
  const [logoError, setLogoError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const logoPath = getAirlineLogoUrl(flight.airlineCode);
  const brandStyle = getAirlineBrandStyle(flight.airlineCode);
  const { formatPrice, currency, getCurrencySymbol } = useCurrency();

  const hasPackages = flight.farePackages && flight.farePackages.length > 1;

  // Default selected package: isDefault=true or first package
  const defaultPkg = hasPackages
    ? (flight.farePackages.find(p => p.isDefault) ?? flight.farePackages[0])
    : null;
  const [selectedPkg, setSelectedPkg] = useState<FarePackage | null>(defaultPkg);

  // Displayed price: selected package price or flight's totalFare
  const displayPrice = (hasPackages && selectedPkg) ? selectedPkg.totalFare : flight.totalFare;
  const displayPriceFormatted = formatPrice(displayPrice);

  const handlePackageSelect = (pkg: FarePackage) => {
    setSelectedPkg(pkg);
  };

  const handleContinue = () => {
    const fareItemId = (hasPackages && selectedPkg) ? selectedPkg.brandedFareItemId : null;
    onSelect(fareItemId);
  };

  return (
    <div className={`bb-flight-card ${isSelected ? 'bb-flight-card--selected' : ''} ${isBest ? 'bb-flight-card--best' : ''}`}>
      {isBest && (
        <div
          className="bb-flight-card__best-badge"
          role="img"
          aria-label="En uygun uçuş"
          title="Fiyat, süre ve aktarma sayısına göre en iyi seçenek"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l2.9 6.6L22 9.3l-5.4 4.7L18.2 22 12 18.3 5.8 22l1.6-8L2 9.3l7.1-.7L12 2z" />
          </svg>
          <span>En Uygun Uçuş</span>
        </div>
      )}
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
                width={36}
                height={36}
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

      {/* Details toggle row */}
      <div className="bb-flight-card__badges-row">
        <button
          type="button"
          className="bb-flight-card__details-toggle"
          onClick={() => setDetailsOpen(!detailsOpen)}
        >
          Uçuş Detayları
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4, transition: 'transform .2s', transform: detailsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Flight Details — expandable */}
      {detailsOpen && flight.segments.length > 0 && (
        <div className="bb-flight-card__details">
          {flight.segments.map((seg, i) => (
            <div key={i}>
              {i > 0 && seg.layoverFormatted && (
                <div className="bb-flight-card__layover">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>{seg.layoverFormatted} aktarma bekleme — {seg.originName ?? seg.originCode} ({seg.originCode})</span>
                </div>
              )}
              <div className="bb-flight-card__detail-seg">
                <div className="bb-flight-card__detail-timeline">
                  <div className="bb-flight-card__detail-dot" />
                  <div className="bb-flight-card__detail-line" />
                  <div className="bb-flight-card__detail-dot" />
                </div>
                <div className="bb-flight-card__detail-info">
                  <div className="bb-flight-card__detail-row">
                    <span className="bb-flight-card__detail-time">{seg.departureTime}</span>
                    <span className="bb-flight-card__detail-airport">{seg.originName ?? seg.originCode} ({seg.originCode})</span>
                    {seg.departureDate && <span className="bb-flight-card__detail-date">{seg.departureDate}</span>}
                  </div>
                  <div className="bb-flight-card__detail-mid">
                    <span className="bb-flight-card__detail-flight">
                      {seg.airlineName ?? flight.airlineName} {seg.flightNumber}
                    </span>
                    {seg.durationFormatted && <span className="bb-flight-card__detail-dur">{seg.durationFormatted}</span>}
                    {seg.bookingClassName && <span className="bb-flight-card__detail-class">{seg.bookingClassName}</span>}
                  </div>
                  <div className="bb-flight-card__detail-row">
                    <span className="bb-flight-card__detail-time">{seg.arrivalTime}</span>
                    <span className="bb-flight-card__detail-airport">{seg.destinationName ?? seg.destinationCode} ({seg.destinationCode})</span>
                    {seg.arrivalDate && seg.arrivalDate !== seg.departureDate && <span className="bb-flight-card__detail-date">{seg.arrivalDate}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
//son deneme

export default FlightCard;
