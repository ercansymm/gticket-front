/**
 * Fare Package Summary
 * ====================
 *
 * BiletBank'tan gelen ham `FarePackage.rules[]` + `FreeBaggageAllowance[]`
 * verisini, UI'da tek bakışta okunabilen 4-5 satırlık özete indirger.
 *
 * Aynı özet hem arama sonuçlarındaki paket kartında hem de checkout'taki
 * Bilet Özeti panelinde kullanılır — iki ekran arasında tutarlılık garantilenir.
 */

import type { FarePackage, FarePackageRule, FreeBaggageAllowance } from '@/types';
import { translateFeature } from '@/i18n/farePackageParser';

export type FareLineState = 'included' | 'chargeable' | 'excluded';

export interface FareSummaryLine {
  state: FareLineState;
  label: string;
}

export interface FareSummary {
  brandName: string | null;
  baggage: FareSummaryLine | null;
  cabin: FareSummaryLine | null;
  change: FareSummaryLine | null;
  refund: FareSummaryLine | null;
  extras: FareSummaryLine[];
}

// ============================================================================
// Kategori kodları
// ============================================================================

const CHECKED_BAGGAGE_GROUPS = new Set([
  'BG', 'BAGGAGE', 'CB', 'CHECKED_BAGGAGE', 'C', 'CHK', 'CHECKED',
]);

const CABIN_BAGGAGE_GROUPS = new Set([
  'CY', 'CABIN_BAGGAGE', 'CARRY_ON', 'HAND_BAGGAGE', 'CABIN',
]);

const CHECKED_ALLOWANCE_CATS = new Set([
  'CHECKED', 'BAGGAGE', 'BG', 'CB', 'CHECKED_BAGGAGE', 'C',
]);

const CABIN_ALLOWANCE_CATS = new Set([
  'CABIN', 'CABIN_BAGGAGE', 'CARRY_ON', 'CY', 'HAND_BAGGAGE',
]);

const CHANGE_GROUPS = new Set(['VC', 'CE', 'CHANGE', 'VOLUNTARY_CHANGE']);
const REFUND_GROUPS = new Set(['VR', 'RE', 'REFUND', 'VOLUNTARY_REFUND']);

// Extras: önem sırası (öncelikli olanlar listenin başında)
const EXTRA_CATEGORY_ORDER: Array<{ groups: Set<string>; label: string }> = [
  { groups: new Set(['ML', 'MEAL', 'CATERING']), label: 'İkram' },
  { groups: new Set(['SE', 'SA', 'SEAT', 'SEAT_SELECTION']), label: 'Koltuk seçimi' },
  { groups: new Set(['LG', 'LOUNGE']), label: 'Lounge erişimi' },
  { groups: new Set(['PR', 'PRIORITY', 'PB', 'PRIORITY_BOARDING', 'TS', 'PRIORITY_SERVICES']), label: 'Öncelikli hizmet' },
  { groups: new Set(['FF', 'FFP', 'MI', 'MILES', 'MILEAGE']), label: 'Mil kazanımı' },
  { groups: new Set(['IE', 'INTERNET', 'WIFI', 'IFE', 'ENTERTAINMENT']), label: 'Wi-Fi / Eğlence' },
];

// ============================================================================
// Yardımcılar
// ============================================================================

function ruleState(rule: FarePackageRule): FareLineState {
  if (rule.isIncluded && !rule.isChargeable) return 'included';
  if (rule.isChargeable) return 'chargeable';
  return 'excluded';
}

function normalizeGroup(code: string | null | undefined): string {
  return (code ?? '').trim().toUpperCase();
}

function descriptionHasNumber(desc: string | null | undefined): boolean {
  if (!desc) return false;
  return /\d/.test(desc);
}

/**
 * "CHANGE MORE THAN 12 HOURS BEFORE DEPARTURE" → 12
 * "NONCHANGEABLE LESS THAN 1 HOUR" → 1
 * Bulunamazsa null.
 */
function extractHours(desc: string | null | undefined): number | null {
  if (!desc) return null;
  const m = desc.match(/(\d+)\s*HOUR/i);
  return m ? Number(m[1]) : null;
}

/** "MORE THAN" varsa true, "LESS THAN" varsa false, hiçbiri yoksa null */
function isWideWindow(desc: string | null | undefined): boolean | null {
  if (!desc) return null;
  const upper = desc.toUpperCase();
  if (/MORE\s+THAN/.test(upper)) return true;
  if (/LESS\s+THAN/.test(upper)) return false;
  // Türkçe varyantlar (parser çevirmiş olabilir)
  if (/FAZLA\s+(SÜRE\s+)?VARKEN|FAZLA\s+KALA/i.test(desc)) return true;
  if (/AZ\s+(SÜRE\s+)?KALA/i.test(desc)) return false;
  return null;
}

// ============================================================================
// Bagaj
// ============================================================================

/**
 * Bagaj allowance'ını "15 kg bagaj" / "2 parça x 23 kg bagaj" formatına getir.
 */
function formatAllowance(allowance: FreeBaggageAllowance, kind: 'checked' | 'cabin'): string | null {
  const amount = allowance.allowance?.trim();
  if (!amount || amount === '0') return null;

  const unit = (allowance.unit ?? '').trim();
  const unitUpper = unit.toUpperCase();
  const suffix = kind === 'cabin' ? 'el bagajı' : 'bagaj';

  // Piece bazlı (yurt dışı): "2 PC" / "1 piece"
  if (/^(PC|PIECE|PARÇA|P)$/i.test(unitUpper)) {
    return `${amount} parça ${suffix}`;
  }

  // KG bazlı (yurt içi)
  if (/^(KG|KGS?)$/i.test(unitUpper) || /^\d+$/.test(amount)) {
    const unitLabel = unit ? unit.toLowerCase().replace(/^kgs?$/, 'kg') : 'kg';
    return `${amount} ${unitLabel} ${suffix}`;
  }

  // Bilinmeyen birim — yine de göster
  return `${amount}${unit ? ' ' + unit : ''} ${suffix}`;
}

function pickAllowance(
  allowances: FreeBaggageAllowance[],
  cats: Set<string>,
): FreeBaggageAllowance | null {
  const isAdt = (a: FreeBaggageAllowance) =>
    ['ADT', 'ADULT'].includes((a.paxType ?? 'ADT').toUpperCase());

  return (
    allowances.find(a => cats.has((a.category ?? '').toUpperCase()) && isAdt(a)) ??
    allowances.find(a => cats.has((a.category ?? '').toUpperCase())) ??
    null
  );
}

/**
 * Bagaj satırı oluştur. Önce paket rule'larına bak, anlamlı bilgi yoksa
 * fallback olarak `FreeBaggageAllowance[]`'a düş.
 */
function summarizeBaggage(
  rules: FarePackageRule[],
  fallbackAllowances: FreeBaggageAllowance[],
  groups: Set<string>,
  allowanceCats: Set<string>,
  kind: 'checked' | 'cabin',
): FareSummaryLine | null {
  const categoryRules = rules.filter(r => groups.has(normalizeGroup(r.serviceGroup)));

  // 1. Anlamlı rule (rakam içeren description) — paketin kendi metnini kullan
  const meaningful = categoryRules.find(r => descriptionHasNumber(r.description));
  if (meaningful?.description) {
    return {
      state: ruleState(meaningful),
      label: translateFeature(meaningful.description),
    };
  }

  // 2. Allowance fallback (yurt dışı için kritik)
  const allowance = pickAllowance(fallbackAllowances, allowanceCats);
  if (allowance) {
    const label = formatAllowance(allowance, kind);
    if (label) {
      return { state: 'included', label };
    }
  }

  // 3. Kural var ama hepsi anlamsız/excluded — "yok" olarak göster
  if (categoryRules.length > 0) {
    const allExcluded = categoryRules.every(r => !r.isIncluded);
    if (allExcluded) {
      return {
        state: 'excluded',
        label: kind === 'cabin' ? 'El bagajı yok' : 'Bagaj hakkı yok',
      };
    }
  }

  return null;
}

// ============================================================================
// Değişiklik / İade konsolidasyonu
// ============================================================================

function summarizePolicy(
  rules: FarePackageRule[],
  groups: Set<string>,
  noun: 'değişiklik' | 'iade',
): FareSummaryLine | null {
  const policyRules = rules.filter(r => groups.has(normalizeGroup(r.serviceGroup)));
  if (policyRules.length === 0) return null;

  // Geniş pencere (more than X hours) ve dar pencere (less than X) rule'larını ayır
  const wideRules: FarePackageRule[] = [];
  const narrowRules: FarePackageRule[] = [];
  const unspecifiedRules: FarePackageRule[] = [];

  for (const r of policyRules) {
    const wide = isWideWindow(r.description);
    if (wide === true) wideRules.push(r);
    else if (wide === false) narrowRules.push(r);
    else unspecifiedRules.push(r);
  }

  // Hangi rule "ana" özet olacak? Geniş pencerede ne sunuluyor — kullanıcının çoğunluk senaryosu.
  const primary =
    wideRules.find(r => r.isIncluded && !r.isChargeable) ??
    wideRules.find(r => r.isChargeable) ??
    wideRules[0] ??
    unspecifiedRules.find(r => r.isIncluded && !r.isChargeable) ??
    unspecifiedRules.find(r => r.isChargeable) ??
    unspecifiedRules[0] ??
    null;

  // Hiç geniş pencere kuralı yoksa ve sadece dar penceredekiler varsa — büyük ihtimal "yapılamaz"
  if (!primary) {
    const narrowAllExcluded = narrowRules.length > 0 && narrowRules.every(r => !r.isIncluded);
    if (narrowAllExcluded) {
      return { state: 'excluded', label: `${capitalize(noun)} yapılamaz` };
    }
    return null;
  }

  const state = ruleState(primary);
  const hours = extractHours(primary.description);

  // Etiketi kur
  let stateLabel: string;
  if (state === 'included') stateLabel = `Ücretsiz ${noun}`;
  else if (state === 'chargeable') stateLabel = `Cezalı ${noun}`;
  else stateLabel = `${capitalize(noun)} yapılamaz`;

  // Zaman penceresi notunu ekle (varsa ve included/chargeable ise anlamlı)
  if (hours !== null && state !== 'excluded') {
    return { state, label: `${stateLabel} (${hours} saatten fazla kala)` };
  }

  // "Excluded + dar pencere kuralı var" durumunda tam tablo göster
  if (state === 'excluded' && narrowRules.length === 0 && wideRules.length === 0) {
    // hiç pencere bilgisi yoksa düz "yapılamaz"
    return { state, label: stateLabel };
  }

  return { state, label: stateLabel };
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1);
}

// ============================================================================
// Extras
// ============================================================================

function summarizeExtras(rules: FarePackageRule[]): FareSummaryLine[] {
  const out: FareSummaryLine[] = [];
  for (const { groups, label: fallbackLabel } of EXTRA_CATEGORY_ORDER) {
    const matching = rules.filter(r => groups.has(normalizeGroup(r.serviceGroup)));
    if (matching.length === 0) continue;

    // included > chargeable > excluded önceliğiyle 1 rule seç
    const pick =
      matching.find(r => r.isIncluded && !r.isChargeable) ??
      matching.find(r => r.isChargeable) ??
      matching[0];

    const label = pick.description ? translateFeature(pick.description) : fallbackLabel;
    out.push({ state: ruleState(pick), label });

    if (out.length >= 3) break;
  }
  return out;
}

// ============================================================================
// Ana fonksiyon
// ============================================================================

export function summarizeFarePackage(
  pkg: FarePackage,
  fallbackAllowances: FreeBaggageAllowance[] = [],
): FareSummary {
  const rules = pkg.rules ?? [];
  const brandName = pkg.brandName?.trim() || null;

  const baggage = summarizeBaggage(rules, fallbackAllowances, CHECKED_BAGGAGE_GROUPS, CHECKED_ALLOWANCE_CATS, 'checked');
  const cabin = summarizeBaggage(rules, fallbackAllowances, CABIN_BAGGAGE_GROUPS, CABIN_ALLOWANCE_CATS, 'cabin');
  const change = summarizePolicy(rules, CHANGE_GROUPS, 'değişiklik');
  const refund = summarizePolicy(rules, REFUND_GROUPS, 'iade');
  const extras = summarizeExtras(rules);

  return { brandName, baggage, cabin, change, refund, extras };
}
