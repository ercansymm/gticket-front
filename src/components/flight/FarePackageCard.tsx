'use client';

import { useMemo, useState } from 'react';
import type { FarePackage, FreeBaggageAllowance } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { summarizeFarePackage, type FareLineState, type FareSummaryLine } from '@/utils/fareSummary';

interface FarePackageCardProps {
  pkg: FarePackage;
  isActive: boolean;
  onSelect: (pkg: FarePackage) => void;
  compact?: boolean;
  isCheapest?: boolean;
  freeBaggageAllowances?: FreeBaggageAllowance[];
}

const PAX_TYPE_LABELS: Record<string, string> = {
  ADT: 'Yetişkin',
  ADULT: 'Yetişkin',
  CHD: 'Çocuk',
  CHILD: 'Çocuk',
  INF: 'Bebek',
  INFANT: 'Bebek',
};

function StatusIcon({ state }: { state: FareLineState }) {
  if (state === 'included') {
    return (
      <svg
        className="bb-pkg-card__rule-status bb-pkg-card__rule-status--included"
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        aria-label="Dahil"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (state === 'chargeable') {
    return (
      <svg
        className="bb-pkg-card__rule-status bb-pkg-card__rule-status--chargeable"
        width="16" height="16" viewBox="0 0 24 24"
        aria-label="Ek ücretli"
      >
        <circle cx="12" cy="12" r="10" fill="#0284c7" />
        <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff">₺</text>
      </svg>
    );
  }
  return (
    <svg
      className="bb-pkg-card__rule-status bb-pkg-card__rule-status--excluded"
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      aria-label="Dahil değil"
    >
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  );
}

function CategorySection({ title, lines }: { title: string; lines: FareSummaryLine[] }) {
  if (lines.length === 0) return null;
  return (
    <div className="bb-pkg-card__category">
      <h5 className="bb-pkg-card__category-title">{title}</h5>
      <ul className="bb-pkg-card__rules">
        {lines.map((line, i) => (
          <li key={i} className={`bb-pkg-card__rule bb-pkg-card__rule--${line.state}`}>
            <StatusIcon state={line.state} />
            <span className="bb-pkg-card__rule-label">{line.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const FarePackageCard = ({
  pkg,
  isActive,
  onSelect,
  compact = false,
  isCheapest = false,
  freeBaggageAllowances = [],
}: FarePackageCardProps) => {
  const [paxOpen, setPaxOpen] = useState(false);
  const { formatPrice } = useCurrency();

  const summary = useMemo(
    () => summarizeFarePackage(pkg, freeBaggageAllowances),
    [pkg, freeBaggageAllowances],
  );

  const baggageLines = [summary.baggage, summary.cabin].filter(Boolean) as FareSummaryLine[];
  const changeLines = summary.change ? [summary.change] : [];
  const refundLines = summary.refund ? [summary.refund] : [];
  const isEmpty =
    baggageLines.length === 0 &&
    changeLines.length === 0 &&
    refundLines.length === 0 &&
    summary.extras.length === 0;

  return (
    <div
      className={`bb-pkg-card ${isActive ? 'bb-pkg-card--active' : ''} ${compact ? 'bb-pkg-card--compact' : ''}`}
      onClick={() => onSelect(pkg)}
      role="radio"
      aria-checked={isActive}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(pkg); } }}
    >
      <div className="bb-pkg-card__header">
        <div className="bb-pkg-card__header-left">
          <span className={`bb-pkg-card__radio ${isActive ? 'bb-pkg-card__radio--checked' : ''}`} aria-hidden="true" />
          <span className="bb-pkg-card__name">{summary.brandName ?? 'Standart'}</span>
        </div>
        {isCheapest && (
          <span className="bb-pkg-card__badge">En Uygun</span>
        )}
      </div>

      <div className="bb-pkg-card__body">
        <CategorySection title="BAGAJ" lines={baggageLines} />
        <CategorySection title="DEĞİŞİKLİK" lines={changeLines} />
        <CategorySection title="İADE" lines={refundLines} />
        <CategorySection title="EKSTRA" lines={summary.extras} />
        {isEmpty && (
          <p className="bb-pkg-card__empty-note">Bu tarife için detaylı bilgi mevcut değildir.</p>
        )}
      </div>

      <div className="bb-pkg-card__price-area">
        {pkg.priceDifferenceFormatted && (
          <span className="bb-pkg-card__diff">{pkg.priceDifferenceFormatted}</span>
        )}
        <span className="bb-pkg-card__total">
          {formatPrice(pkg.totalFare)}
        </span>
      </div>

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
