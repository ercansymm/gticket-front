'use client';

import { useState } from 'react';
import type { FlightResult, FarePackage } from '@/types';
import FarePackageCard from '../flight/FarePackageCard';

interface BrandedFareModalProps {
  flight: FlightResult;
  returnFlight?: FlightResult | null;
  onSelect: (brandedFareItemId: string | null) => void;
  onClose: () => void;
  loading?: boolean;
}

const BrandedFareModal = ({ flight, returnFlight, onSelect, onClose, loading = false }: BrandedFareModalProps) => {
  const packages = flight.farePackages ?? [];
  const defaultPkg = packages.find(p => p.isDefault) ?? packages[0] ?? null;
  const [selectedPkg, setSelectedPkg] = useState<FarePackage | null>(defaultPkg);

  if (packages.length === 0) return null;

  const handleConfirm = () => {
    onSelect(selectedPkg?.brandedFareItemId ?? null);
  };

  return (
    <div className="bb-modal-overlay" role="dialog" aria-modal="true" aria-label="Tarife seçimi" onClick={onClose}>
      <div className="bb-modal bb-modal--fare" onClick={(e) => e.stopPropagation()}>
        <div className="bb-modal__header">
          <h3 className="bb-modal__title">Tarife Seçin</h3>
          <button className="bb-modal__close" onClick={onClose} aria-label="Kapat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="bb-modal__body">
          <div className="bb-modal__flight-info">
            <span className="bb-modal__route">
              {flight.originCode} → {flight.destinationCode}
            </span>
            <span className="bb-modal__flight-no">{flight.flightNumber}</span>
            {flight.departureTime && (
              <span className="bb-modal__time">{flight.departureTime}</span>
            )}
          </div>

          {returnFlight && (
            <div className="bb-modal__flight-info bb-modal__flight-info--return">
              <span className="bb-modal__route">
                {returnFlight.originCode} → {returnFlight.destinationCode}
              </span>
              <span className="bb-modal__flight-no">{returnFlight.flightNumber}</span>
              {returnFlight.departureTime && (
                <span className="bb-modal__time">{returnFlight.departureTime}</span>
              )}
            </div>
          )}

          <div className="bb-flight-card__packages">
            {packages.map((pkg) => (
              <FarePackageCard
                key={pkg.brandedFareItemId}
                pkg={pkg}
                isActive={selectedPkg?.brandedFareItemId === pkg.brandedFareItemId}
                onSelect={setSelectedPkg}
                freeBaggageAllowances={flight.freeBaggageAllowances ?? []}
              />
            ))}
          </div>
        </div>

        <div className="bb-modal__footer">
          <button className="bb-modal__btn bb-modal__btn--cancel" onClick={onClose}>
            Vazgeç
          </button>
          <button
            className="bb-modal__btn bb-modal__btn--confirm"
            onClick={handleConfirm}
            disabled={loading || !selectedPkg}
          >
            {loading ? 'Tahsis ediliyor...' : 'Seç ve İlerle'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandedFareModal;
