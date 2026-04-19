import type { FlightResult } from '@/types';

/**
 * "En Uygun Uçuş" skorlaması.
 *
 * Google Flights "Best" mantığına benzer: fiyat + süre + aktarma kombinasyonunu
 * ağırlıklı olarak skorlar. Düşük skor = daha iyi.
 *
 * Ağırlıklar:
 *  • %65 fiyat (min-max normalize) — her zaman en önemli kriter
 *  • %25 süre  (min-max normalize)
 *  • %10 aktarma cezası (her aktarma için 0.2 birim)
 *
 * KESIN KURAL: Algoritma havayolu kodu/markası bilgisine ASLA bakmaz.
 * Sadece fiyat + süre + aktarma sayısı kullanılır.
 *
 * Öncelik: listede aktarmasız uçuş varsa sadece onlar arasında arar; yoksa
 * tüm liste üzerinden en iyi skoru seçer.
 */

const PRICE_WEIGHT = 0.65;
const DURATION_WEIGHT = 0.25;
const STOPS_WEIGHT = 0.10;
const STOPS_PENALTY_PER_STOP = 0.2;

function getDurationMinutes(f: FlightResult): number {
  const h = Number.isFinite(f.durationHours) ? f.durationHours : 0;
  const m = Number.isFinite(f.durationMinutes) ? f.durationMinutes : 0;
  return h * 60 + m;
}

/**
 * Fiyatı güvenli sayıya çevirir. Backend `totalFare` zaten number döner ama
 * koruma amaçlı string formatlarını da (TR: "1.234,56", EN: "1,234.56") parse eder.
 * String compare ("9000" > "34000") tuzağına düşmemek için kritik.
 */
function parseSafePrice(price: number | string | null | undefined): number {
  if (typeof price === 'number') return Number.isFinite(price) ? price : Number.POSITIVE_INFINITY;
  if (price == null) return Number.POSITIVE_INFINITY;

  const cleaned = String(price).replace(/[^\d,.\-]/g, '');
  if (!cleaned) return Number.POSITIVE_INFINITY;

  // Hangi sembol ondalık ayraç? Son geçen ',' veya '.' ondalık kabul edilir.
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalized: string;
  if (lastComma > lastDot) {
    // TR formatı: "1.234,56" → "1234.56"
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // EN formatı: "1,234.56" → "1234.56" (veya zaten "1234.56")
    normalized = cleaned.replace(/,/g, '');
  }
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? Number.POSITIVE_INFINITY : num;
}

function scoreFlight(
  flight: FlightResult,
  minPrice: number,
  maxPrice: number,
  minDuration: number,
  maxDuration: number,
): number {
  const priceRange = maxPrice - minPrice;
  const durationRange = maxDuration - minDuration;

  const flightPrice = parseSafePrice(flight.totalFare);
  const priceScore = priceRange === 0 ? 0 : (flightPrice - minPrice) / priceRange;

  const duration = getDurationMinutes(flight);
  const durationScore = durationRange === 0 ? 0 : (duration - minDuration) / durationRange;

  const stopsPenalty = (flight.stopCount ?? 0) * STOPS_PENALTY_PER_STOP;

  return priceScore * PRICE_WEIGHT + durationScore * DURATION_WEIGHT + stopsPenalty * STOPS_WEIGHT;
}

/**
 * Filtrelenmiş uçuş listesinde "en uygun" uçuşu bulur ve productId'sini döner.
 * Kıyaslanacak başka uçuş yoksa (0 veya 1 uçuş) null döner — tek uçuşta rozet
 * göstermek anlamsız.
 */
export function findBestFlightId(flights: FlightResult[]): string | null {
  if (!flights || flights.length < 2) return null;

  // Aktarmasız uçuşlar varsa sadece onların arasında ara
  const direct = flights.filter((f) => f.isDirect || (f.stopCount ?? 0) === 0);
  const candidates = direct.length > 0 ? direct : flights;

  const prices = candidates.map((f) => parseSafePrice(f.totalFare));
  const durations = candidates.map(getDurationMinutes);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  let best = candidates[0];
  let bestScore = scoreFlight(best, minPrice, maxPrice, minDuration, maxDuration);

  for (let i = 1; i < candidates.length; i++) {
    const s = scoreFlight(candidates[i], minPrice, maxPrice, minDuration, maxDuration);
    if (s < bestScore) {
      bestScore = s;
      best = candidates[i];
    }
  }

  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[findBestFlightId] Seçilen:', {
      productId: best.productId,
      airline: best.airlineCode,
      price: parseSafePrice(best.totalFare),
      duration: getDurationMinutes(best),
      stops: best.stopCount,
      score: bestScore.toFixed(4),
    });
  }

  return best.productId ?? null;
}

/**
 * Bir tarife paketi listesindeki en ucuz paketin brandedFareItemId'sini döner.
 * Tek paket varsa null döner.
 *
 * Backend'in `pkg.isDefault` flag'ine güvenmek yerine fiyat üzerinden dinamik
 * tespit eder — böylece "En Uygun" rozeti her zaman gerçekten en ucuz pakete gider.
 */
export function findCheapestPackageId<
  T extends { brandedFareItemId: string | null; totalFare: number | string | null | undefined },
>(packages: T[] | null | undefined): string | null {
  if (!packages || packages.length < 2) return null;

  let cheapest = packages[0];
  let cheapestPrice = parseSafePrice(cheapest.totalFare);

  for (let i = 1; i < packages.length; i++) {
    const p = parseSafePrice(packages[i].totalFare);
    if (p < cheapestPrice) {
      cheapestPrice = p;
      cheapest = packages[i];
    }
  }

  return cheapest.brandedFareItemId ?? null;
}
