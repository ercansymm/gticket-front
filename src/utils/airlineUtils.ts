/** Airline brand colors – used as logo container background on fallback */
export const AIRLINE_COLORS: Record<string, { bg: string; color: string }> = {
  // Turkey
  TK: { bg: '#E30A17', color: '#fff' },
  PC: { bg: '#FFB800', color: '#1a1a1a' },
  VF: { bg: '#1A56DB', color: '#fff' },
  XQ: { bg: '#E30A17', color: '#fff' },
  AJ: { bg: '#232b5c', color: '#fff' },
  KK: { bg: '#00529B', color: '#fff' },
  // Europe
  LH: { bg: '#05164D', color: '#fff' },
  BA: { bg: '#075AAA', color: '#fff' },
  AF: { bg: '#002157', color: '#fff' },
  KL: { bg: '#00A1DE', color: '#fff' },
  OS: { bg: '#E20A17', color: '#fff' },
  LX: { bg: '#E30613', color: '#fff' },
  SN: { bg: '#00205B', color: '#fff' },
  AZ: { bg: '#0B3E8C', color: '#fff' },
  SK: { bg: '#00205B', color: '#fff' },
  FI: { bg: '#003B6F', color: '#fff' },
  W6: { bg: '#C6007E', color: '#fff' },
  FR: { bg: '#073590', color: '#fff' },
  U2: { bg: '#FF6600', color: '#fff' },
  // Middle East & Africa
  EK: { bg: '#D71921', color: '#fff' },
  QR: { bg: '#5C0632', color: '#fff' },
  SV: { bg: '#006747', color: '#fff' },
  MS: { bg: '#002B5C', color: '#fff' },
  RJ: { bg: '#1A1F71', color: '#fff' },
  WY: { bg: '#8A1538', color: '#fff' },
  ET: { bg: '#009639', color: '#fff' },
  SA: { bg: '#002B5C', color: '#fff' },
  // Americas
  UA: { bg: '#002244', color: '#fff' },
  AA: { bg: '#0078D2', color: '#fff' },
  DL: { bg: '#003366', color: '#fff' },
  AC: { bg: '#F01428', color: '#fff' },
  // Asia-Pacific
  SQ: { bg: '#00295B', color: '#fff' },
  CX: { bg: '#006564', color: '#fff' },
  NH: { bg: '#13448F', color: '#fff' },
  JL: { bg: '#CC0000', color: '#fff' },
  OZ: { bg: '#C60C30', color: '#fff' },
  KE: { bg: '#00256C', color: '#fff' },
  CI: { bg: '#003768', color: '#fff' },
  MH: { bg: '#1C3E6E', color: '#fff' },
  TG: { bg: '#6B2C91', color: '#fff' },
  GA: { bg: '#00529B', color: '#fff' },
  QF: { bg: '#E0001A', color: '#fff' },
  '6E': { bg: '#2D2A6E', color: '#fff' },
};

const FALLBACK_STYLE = { bg: '#6b7280', color: '#fff' };

/**
 * Returns airline logo from the Aviasales (pics.avs.io) CDN.
 * More reliable than kiwi.com – returns 404 quickly for missing logos
 * instead of timing out for ~10s.
 */
export function getAirlineLogoUrl(code: string | null, size = 64): string | null {
  if (!code) return null;
  return `https://pics.avs.io/${size}/${size}/${code}.png`;
}

export function getAirlineBrandStyle(code: string | null): { bg: string; color: string } {
  return (code && AIRLINE_COLORS[code]) || FALLBACK_STYLE;
}

export function getAirlineInitials(name: string | null): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}
