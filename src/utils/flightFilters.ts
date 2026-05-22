import type {
  FlightResult,
  FlightFilters,
  FlightSortBy,
  FilterFacets,
  FreeBaggageAllowance,
  StopBucket,
  BaggageBucket,
  DirectionFacet,
} from '@/types';

// ────────────────────────────────────────────────────────
// Konstantlar
// ────────────────────────────────────────────────────────

const CHECKED_CATS = new Set(['BG', 'BAGGAGE', 'CB', 'CHECKED_BAGGAGE']);
const CABIN_CATS = new Set(['CY', 'CABIN_BAGGAGE', 'CARRY_ON', 'HAND_BAGGAGE']);
const PERSONAL_CATS = new Set(['PI', 'PERSONAL_ITEM', 'PERSONAL']);

// Gün dilimleri — "HH:MM" string karşılaştırması (lexicographic = chronologic)
export interface TimeBucketDef {
  key: 'gece' | 'sabah' | 'ogle' | 'aksam';
  label: string;
  from: string;
  to: string;
}

export const TIME_BUCKETS: TimeBucketDef[] = [
  { key: 'gece',  label: 'Gece',  from: '00:00', to: '05:59' },
  { key: 'sabah', label: 'Sabah', from: '06:00', to: '11:59' },
  { key: 'ogle',  label: 'Öğle',  from: '12:00', to: '17:59' },
  { key: 'aksam', label: 'Akşam', from: '18:00', to: '23:59' },
];

export const INITIAL_FILTERS: FlightFilters = {
  refundableOnly: false,
  minPrice: null,
  maxPrice: null,
  airlineCodes: [],
  cabinClasses: [],
  farePackages: [],
  stopBuckets: [],
  baggageBuckets: [],
  airportCodes: [],
  outboundDepartureFrom: null,
  outboundDepartureTo: null,
  outboundArrivalFrom: null,
  outboundArrivalTo: null,
  outboundMaxDurationMinutes: null,
  returnDepartureFrom: null,
  returnDepartureTo: null,
  returnArrivalFrom: null,
  returnArrivalTo: null,
  returnMaxDurationMinutes: null,
};

// ────────────────────────────────────────────────────────
// Helper'lar
// ────────────────────────────────────────────────────────

function durationMinutes(f: FlightResult): number {
  return (f.durationHours ?? 0) * 60 + (f.durationMinutes ?? 0);
}

function timeInRange(time: string | null | undefined, from: string | null, to: string | null): boolean {
  if (!time) return true;
  if (from && time < from) return false;
  if (to && time > to) return false;
  return true;
}

function maxAllowanceKg(allowances: FreeBaggageAllowance[], cats: Set<string>): number {
  let max = 0;
  for (const a of allowances) {
    if (!cats.has((a.category ?? '').toUpperCase())) continue;
    if (!['ADT', 'ADULT', null, undefined, ''].includes(a.paxType ?? 'ADT')) continue;
    const value = parseInt(a.allowance ?? '0', 10);
    if (!Number.isNaN(value) && value > max) max = value;
  }
  return max;
}

function hasBaggageBucket(f: FlightResult, bucket: BaggageBucket): boolean {
  const allowances = f.freeBaggageAllowances ?? [];
  if (bucket === 'personal') {
    return allowances.some(a => PERSONAL_CATS.has((a.category ?? '').toUpperCase()));
  }
  if (bucket === 'cabin') {
    return maxAllowanceKg(allowances, CABIN_CATS) > 0
      || allowances.some(a => CABIN_CATS.has((a.category ?? '').toUpperCase()));
  }
  if (bucket === 'checked23') return maxAllowanceKg(allowances, CHECKED_CATS) >= 23;
  if (bucket === 'checked30') return maxAllowanceKg(allowances, CHECKED_CATS) >= 30;
  return false;
}

function stopBucketOf(f: FlightResult): StopBucket {
  if (f.isDirect || f.stopCount === 0) return 'direct';
  if (f.stopCount === 1) return 'one';
  return 'twoPlus';
}

// ────────────────────────────────────────────────────────
// filterFlights — direction parametresine göre saat/süre alanları seçilir.
// Stops/baggage/airline/airport/price filtreleri her iki yöne de uygulanır.
// ────────────────────────────────────────────────────────

export type FilterDirection = 'outbound' | 'return';

export function filterFlights(
  flights: FlightResult[],
  filters: FlightFilters,
  direction: FilterDirection = 'outbound',
): FlightResult[] {
  let result = flights;

  if (filters.refundableOnly) {
    result = result.filter(f => f.isRefundable);
  }

  if (filters.minPrice != null) {
    result = result.filter(f => f.totalFare >= filters.minPrice!);
  }
  if (filters.maxPrice != null) {
    result = result.filter(f => f.totalFare <= filters.maxPrice!);
  }

  if (filters.airlineCodes.length > 0) {
    result = result.filter(f => f.airlineCode != null && filters.airlineCodes.includes(f.airlineCode));
  }

  if (filters.cabinClasses.length > 0) {
    result = result.filter(f => f.cabinClassName != null && filters.cabinClasses.includes(f.cabinClassName));
  }

  if (filters.farePackages.length > 0) {
    result = result.filter(f =>
      f.farePackages?.some(p => p.brandName != null && filters.farePackages.includes(p.brandName))
    );
  }

  if (filters.stopBuckets.length > 0) {
    result = result.filter(f => filters.stopBuckets.includes(stopBucketOf(f)));
  }

  if (filters.baggageBuckets.length > 0) {
    result = result.filter(f => filters.baggageBuckets.every(b => hasBaggageBucket(f, b)));
  }

  if (filters.airportCodes.length > 0) {
    result = result.filter(f => {
      const codes = [f.originCode, f.destinationCode].filter(Boolean) as string[];
      return codes.some(c => filters.airportCodes.includes(c));
    });
  }

  const depFrom = direction === 'outbound' ? filters.outboundDepartureFrom : filters.returnDepartureFrom;
  const depTo   = direction === 'outbound' ? filters.outboundDepartureTo   : filters.returnDepartureTo;
  const arrFrom = direction === 'outbound' ? filters.outboundArrivalFrom   : filters.returnArrivalFrom;
  const arrTo   = direction === 'outbound' ? filters.outboundArrivalTo     : filters.returnArrivalTo;
  const maxDur  = direction === 'outbound' ? filters.outboundMaxDurationMinutes : filters.returnMaxDurationMinutes;

  if (depFrom || depTo) {
    result = result.filter(f => timeInRange(f.departureTime, depFrom, depTo));
  }
  if (arrFrom || arrTo) {
    result = result.filter(f => timeInRange(f.arrivalTime, arrFrom, arrTo));
  }
  if (maxDur != null) {
    result = result.filter(f => durationMinutes(f) <= maxDur);
  }

  return result;
}

// ────────────────────────────────────────────────────────
// computeFacets — uçuş listesinden zengin filtre opsiyonlarını türet
// ────────────────────────────────────────────────────────

function buildDirectionFacet(flights: FlightResult[]): DirectionFacet | null {
  if (flights.length === 0) return null;
  let earliestDep = '23:59', latestDep = '00:00';
  let earliestArr = '23:59', latestArr = '00:00';
  let maxDur = 0;
  let originCode: string | null = null;
  let originName: string | null = null;
  let destinationCode: string | null = null;
  let destinationName: string | null = null;

  for (const f of flights) {
    if (f.departureTime) {
      if (f.departureTime < earliestDep) earliestDep = f.departureTime;
      if (f.departureTime > latestDep) latestDep = f.departureTime;
    }
    if (f.arrivalTime) {
      if (f.arrivalTime < earliestArr) earliestArr = f.arrivalTime;
      if (f.arrivalTime > latestArr) latestArr = f.arrivalTime;
    }
    const d = durationMinutes(f);
    if (d > maxDur) maxDur = d;
    if (!originCode && f.originCode) { originCode = f.originCode; originName = f.originName; }
    if (!destinationCode && f.destinationCode) { destinationCode = f.destinationCode; destinationName = f.destinationName; }
  }
  return {
    originCode,
    originName,
    destinationCode,
    destinationName,
    earliestDeparture: earliestDep,
    latestDeparture: latestDep,
    earliestArrival: earliestArr,
    latestArrival: latestArr,
    maxDurationMinutes: maxDur,
  };
}

export interface ComputeFacetsInput {
  allFlights: FlightResult[];
  outboundFlights?: FlightResult[];
  returnFlights?: FlightResult[];
}

// RT'de count'lar gidiş listesinden hesaplanır — filter uygulanınca kullanıcının
// göreceği sonuçla tutarlı olsun (gidiş listesi boşalırsa toplam da boşalır).
// OW'da outbound = allFlights, davranış değişmez.
export function computeFacets({ allFlights, outboundFlights, returnFlights }: ComputeFacetsInput): FilterFacets {
  const countSource = outboundFlights && outboundFlights.length > 0 ? outboundFlights : allFlights;

  let priceMin = Number.POSITIVE_INFINITY;
  let priceMax = 0;
  const stops = { direct: 0, one: 0, twoPlus: 0 };
  const baggage = { personal: 0, cabin: 0, checked23: 0, checked30: 0 };
  const airlineMap = new Map<string, { code: string; name: string; count: number }>();
  const airportMap = new Map<string, { code: string; name: string; count: number }>();

  // Fiyat range tüm uçuşlardan
  for (const f of allFlights) {
    if (f.totalFare < priceMin) priceMin = f.totalFare;
    if (f.totalFare > priceMax) priceMax = f.totalFare;
  }

  // Count'lar gidiş listesinden (RT'de doğru senkronizasyon)
  for (const f of countSource) {
    const bucket = stopBucketOf(f);
    stops[bucket] += 1;

    if (hasBaggageBucket(f, 'personal')) baggage.personal += 1;
    if (hasBaggageBucket(f, 'cabin')) baggage.cabin += 1;
    if (hasBaggageBucket(f, 'checked23')) baggage.checked23 += 1;
    if (hasBaggageBucket(f, 'checked30')) baggage.checked30 += 1;

    if (f.airlineCode) {
      const key = f.airlineCode;
      const existing = airlineMap.get(key);
      if (existing) existing.count += 1;
      else airlineMap.set(key, { code: key, name: f.airlineName ?? key, count: 1 });
    }

    const seen = new Set<string>();
    for (const code of [f.originCode, f.destinationCode]) {
      if (!code || seen.has(code)) continue;
      seen.add(code);
      const name = code === f.originCode ? f.originName : f.destinationName;
      const existing = airportMap.get(code);
      if (existing) existing.count += 1;
      else airportMap.set(code, { code, name: name ?? code, count: 1 });
    }
  }

  if (!Number.isFinite(priceMin)) priceMin = 0;

  return {
    totalCount: countSource.length,
    priceMin: Math.floor(priceMin),
    priceMax: Math.ceil(priceMax),
    stops,
    baggage,
    airlines: [...airlineMap.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    airports: [...airportMap.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    outbound: outboundFlights && outboundFlights.length > 0 ? buildDirectionFacet(outboundFlights) : buildDirectionFacet(allFlights),
    returnLeg: returnFlights && returnFlights.length > 0 ? buildDirectionFacet(returnFlights) : null,
  };
}

// ────────────────────────────────────────────────────────
// sortFlights — değişmedi
// ────────────────────────────────────────────────────────

export function sortFlights(flights: FlightResult[], sortBy: FlightSortBy): FlightResult[] {
  const sorted = [...flights];
  switch (sortBy) {
    case 'cheapest':
      return sorted.sort((a, b) => a.totalFare - b.totalFare);
    case 'expensive':
      return sorted.sort((a, b) => b.totalFare - a.totalFare);
    case 'earliest':
      return sorted.sort((a, b) => (a.departureTime ?? '').localeCompare(b.departureTime ?? ''));
    case 'latest':
      return sorted.sort((a, b) => (b.departureTime ?? '').localeCompare(a.departureTime ?? ''));
    case 'arrival':
      return sorted.sort((a, b) => (a.arrivalTime ?? '').localeCompare(b.arrivalTime ?? ''));
    case 'shortest':
      return sorted.sort((a, b) => durationMinutes(a) - durationMinutes(b));
    case 'stops':
      return sorted.sort((a, b) => a.stopCount - b.stopCount || a.totalFare - b.totalFare);
    case 'airline':
      return sorted.sort((a, b) => (a.airlineName ?? '').localeCompare(b.airlineName ?? ''));
    default:
      return sorted;
  }
}
