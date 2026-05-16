'use client';

import { useState } from 'react';
import type { FarePackage, FarePackageRule, FreeBaggageAllowance } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import {
  translateCategory,
  translateFeature,
} from '@/i18n/farePackageParser';

interface FarePackageCardProps {
  pkg: FarePackage;
  isActive: boolean;
  onSelect: (pkg: FarePackage) => void;
  compact?: boolean;
  isCheapest?: boolean;
  freeBaggageAllowances?: FreeBaggageAllowance[];
}

// Görüntüleme sırası: en önemli kategoriler üstte.
// Bilinmeyen kodlar sona eklenir.
const CATEGORY_ORDER = [
  'BG', 'BAGGAGE',
  'CY', 'CABIN_BAGGAGE',
  'VC', 'CE', 'CHANGE',
  'VR', 'RE', 'REFUND',
  'SA', 'SE', 'SEAT',
  'ML', 'MEAL',
  'LG', 'LOUNGE',
  'PR', 'PRIORITY', 'PB',
  'FF', 'FFP', 'MI', 'MILES', 'MESAFE',
  'IE', 'INTERNET', 'WIFI',
  'SB', 'SAMEDAY',
] as const;

const PAX_TYPE_LABELS: Record<string, string> = {
  ADT: 'Yetişkin',
  ADULT: 'Yetişkin',
  CHD: 'Çocuk',
  CHILD: 'Çocuk',
  INF: 'Bebek',
  INFANT: 'Bebek',
};

type RuleState = 'included' | 'chargeable' | 'excluded';

function getRuleState(rule: FarePackageRule): RuleState {
  if (rule.isIncluded && !rule.isChargeable) return 'included';
  if (rule.isChargeable) return 'chargeable';
  return 'excluded';
}

function StatusIcon({ state }: { state: RuleState }) {
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
    // Filled blue circle with white ₺ — clearly distinct from the unselected radio.
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

function getRuleLabel(rule: FarePackageRule): string {
  if (rule.description) return translateFeature(rule.description);
  if (rule.serviceGroup) return translateCategory(rule.serviceGroup);
  return '';
}

function groupRulesByCategory(rules: FarePackageRule[]): Array<{ key: string; rules: FarePackageRule[] }> {
  const buckets = new Map<string, FarePackageRule[]>();
  for (const r of rules) {
    const key = (r.serviceGroup ?? 'OTHER').toUpperCase();
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(r);
  }
  const ordered: Array<{ key: string; rules: FarePackageRule[] }> = [];
  for (const key of CATEGORY_ORDER) {
    if (buckets.has(key)) {
      ordered.push({ key, rules: buckets.get(key)! });
      buckets.delete(key);
    }
  }
  for (const [key, list] of buckets) {
    ordered.push({ key, rules: list });
  }
  return ordered;
}

const CHECKED_CATS = new Set(['BG', 'BAGGAGE', 'CB', 'CHECKED_BAGGAGE']);
const CABIN_CATS = new Set(['CY', 'CABIN_BAGGAGE', 'CARRY_ON', 'HAND_BAGGAGE']);
const BAGGAGE_ALL_KEYS = new Set(['BG', 'BAGGAGE', 'CY', 'CABIN_BAGGAGE', 'CB', 'CHECKED_BAGGAGE', 'CARRY_ON', 'HAND_BAGGAGE']);

function buildBagFallback(allowances: FreeBaggageAllowance[]): string[] {
  const items: string[] = [];
  const adtChecked = allowances.find(a =>
    CHECKED_CATS.has((a.category ?? '').toUpperCase()) &&
    ['ADT', 'ADULT'].includes((a.paxType ?? 'ADT').toUpperCase())
  ) ?? allowances.find(a => CHECKED_CATS.has((a.category ?? '').toUpperCase()));
  const adtCabin = allowances.find(a =>
    CABIN_CATS.has((a.category ?? '').toUpperCase()) &&
    ['ADT', 'ADULT'].includes((a.paxType ?? 'ADT').toUpperCase())
  ) ?? allowances.find(a => CABIN_CATS.has((a.category ?? '').toUpperCase()));
  if (adtChecked?.allowance) {
    items.push(`${adtChecked.allowance}${adtChecked.unit ? ' ' + adtChecked.unit : ''} bagaj hakkı`);
  }
  if (adtCabin?.allowance) {
    items.push(`${adtCabin.allowance}${adtCabin.unit ? ' ' + adtCabin.unit : ''} el bagajı`);
  }
  return items;
}

const FarePackageCard = ({ pkg, isActive, onSelect, compact = false, isCheapest = false, freeBaggageAllowances = [] }: FarePackageCardProps) => {
  const [paxOpen, setPaxOpen] = useState(false);
  const { formatPrice } = useCurrency();
  const grouped = groupRulesByCategory(pkg.rules);
  const hasBaggageRules = grouped.some(g => BAGGAGE_ALL_KEYS.has(g.key));
  const bagFallbackItems = (!hasBaggageRules && freeBaggageAllowances.length > 0)
    ? buildBagFallback(freeBaggageAllowances)
    : [];

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
          <span className="bb-pkg-card__name">{pkg.brandName ?? 'Standart'}</span>
        </div>
        {isCheapest && (
          <span className="bb-pkg-card__badge">En Uygun</span>
        )}
      </div>

      <div className="bb-pkg-card__body">
        {bagFallbackItems.length > 0 && (
          <div className="bb-pkg-card__category">
            <h5 className="bb-pkg-card__category-title">BAGAJ</h5>
            <ul className="bb-pkg-card__rules">
              {bagFallbackItems.map((item, i) => (
                <li key={i} className="bb-pkg-card__rule bb-pkg-card__rule--included">
                  <StatusIcon state="included" />
                  <span className="bb-pkg-card__rule-label">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {grouped.map(({ key, rules }) => (
          <div key={key} className="bb-pkg-card__category">
            <h5 className="bb-pkg-card__category-title">
              {translateCategory(key)}
            </h5>
            <ul className="bb-pkg-card__rules">
              {rules.map((rule, idx) => {
                const state = getRuleState(rule);
                return (
                  <li key={idx} className={`bb-pkg-card__rule bb-pkg-card__rule--${state}`}>
                    <StatusIcon state={state} />
                    <span className="bb-pkg-card__rule-label">
                      {getRuleLabel(rule)}
                      {state === 'chargeable' && (
                        <span className="bb-chip bb-chip--chargeable">+ Ek ücretli</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {grouped.length === 0 && bagFallbackItems.length === 0 && (
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