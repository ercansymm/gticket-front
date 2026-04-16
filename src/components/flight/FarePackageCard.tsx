'use client';

import { useState } from 'react';
import type { FarePackage, FarePackageRule } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';

interface FarePackageCardProps {
  pkg: FarePackage;
  isActive: boolean;
  onSelect: (pkg: FarePackage) => void;
  compact?: boolean;
}

/** Service group → human-readable label mapping */
const SERVICE_GROUP_LABELS: Record<string, string> = {
  BG: 'Bagaj',
  RE: 'İade',
  CE: 'Değişiklik',
  SA: 'Koltuk Seçimi',
  ML: 'İkram',
  LG: 'Lounge',
  MI: 'Mesafe',
  FF: 'Mil',
  PR: 'Öncelik',
};

const PAX_TYPE_LABELS: Record<string, string> = {
  ADT: 'Yetişkin',
  ADULT: 'Yetişkin',
  CHD: 'Çocuk',
  CHILD: 'Çocuk',
  INF: 'Bebek',
  INFANT: 'Bebek',
};

/** SVG icons for rule statuses — professional, no emoji */
function RuleStatusIcon({ rule }: { rule: FarePackageRule }) {
  if (rule.isIncluded && !rule.isChargeable) {
    // Included (free)
    return (
      <svg className="bb-pkg-card__rule-status bb-pkg-card__rule-status--included" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (rule.isChargeable) {
    // Chargeable (extra fee)
    return (
      <svg className="bb-pkg-card__rule-status bb-pkg-card__rule-status--chargeable" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }
  // Not available
  return (
    <svg className="bb-pkg-card__rule-status bb-pkg-card__rule-status--excluded" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/** SVG icons for service groups */
function ServiceGroupIcon({ group }: { group: string | null }) {
  switch (group) {
    case 'BG':
      return (
        <svg className="bb-pkg-card__svc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 20h12" />
          <path d="M6 14h12" />
          <path d="M6 8h12" />
          <rect x="6" y="4" width="12" height="16" rx="1" />
          <path d="M9 4V2" />
          <path d="M15 4V2" />
        </svg>
      );
    case 'ML':
      return (
        <svg className="bb-pkg-card__svc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      );
    case 'SA':
      return (
        <svg className="bb-pkg-card__svc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
          <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
          <path d="M5 18v2" />
          <path d="M19 18v2" />
        </svg>
      );
    case 'RE':
      return (
        <svg className="bb-pkg-card__svc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      );
    case 'CE':
      return (
        <svg className="bb-pkg-card__svc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
      );
    default:
      return (
        <svg className="bb-pkg-card__svc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      );
  }
}

function getRuleLabel(serviceGroup: string | null, description: string | null): string {
  if (description) return description;
  if (serviceGroup && SERVICE_GROUP_LABELS[serviceGroup]) return SERVICE_GROUP_LABELS[serviceGroup];
  return serviceGroup ?? '';
}

const FarePackageCard = ({ pkg, isActive, onSelect, compact = false }: FarePackageCardProps) => {
  const [paxOpen, setPaxOpen] = useState(false);
  const { formatPrice } = useCurrency();

  return (
    <div
      className={`bb-pkg-card ${isActive ? 'bb-pkg-card--active' : ''} ${compact ? 'bb-pkg-card--compact' : ''}`}
      onClick={() => onSelect(pkg)}
      role="radio"
      aria-checked={isActive}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(pkg); } }}
    >
      {/* Header */}
      <div className="bb-pkg-card__header">
        <div className="bb-pkg-card__header-left">
          <span className={`bb-pkg-card__radio ${isActive ? 'bb-pkg-card__radio--checked' : ''}`} />
          <span className="bb-pkg-card__name">{pkg.brandName ?? 'Standart'}</span>
        </div>
        {pkg.isDefault && (
          <span className="bb-pkg-card__badge">En Uygun</span>
        )}
      </div>

      {/* Rules grid */}
      <div className="bb-pkg-card__rules">
        {pkg.rules.map((rule, idx) => (
          <div key={idx} className="bb-pkg-card__rule">
            <RuleStatusIcon rule={rule} />
            <ServiceGroupIcon group={rule.serviceGroup} />
            <span className="bb-pkg-card__rule-label">
              {getRuleLabel(rule.serviceGroup, rule.description)}
            </span>
          </div>
        ))}
      </div>

      {/* Price */}
      <div className="bb-pkg-card__price-area">
        {pkg.priceDifferenceFormatted && (
          <span className="bb-pkg-card__diff">{pkg.priceDifferenceFormatted}</span>
        )}
        <span className="bb-pkg-card__total">
          {formatPrice(pkg.totalFare)}
        </span>
      </div>

      {/* Passenger breakdown toggle */}
      {pkg.passengerFares && pkg.passengerFares.length > 0 && (
        <div className="bb-pkg-card__pax-section">
          <button
            type="button"
            className="bb-pkg-card__pax-toggle"
            onClick={(e) => { e.stopPropagation(); setPaxOpen(!paxOpen); }}
          >
            <span>Fiyat Detayı</span>
            <svg className={`bb-pkg-card__pax-chevron ${paxOpen ? 'bb-pkg-card__pax-chevron--open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {paxOpen && (
            <div className="bb-pkg-card__pax-list">
              {pkg.passengerFares.map((pf, idx) => (
                <div key={idx} className="bb-pkg-card__pax-row">
                  <span>{PAX_TYPE_LABELS[(pf.passengerType ?? 'ADT').toUpperCase()] ?? pf.passengerType} x{pf.passengerCount}</span>
                  <span>
                    {formatPrice(pf.totalFare)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FarePackageCard;
