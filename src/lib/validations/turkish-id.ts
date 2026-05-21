/**
 * Türkiye Cumhuriyeti Kimlik No (TCKN) doğrulama algoritması.
 *
 * Kurallar:
 *  1) 11 haneli sayısal
 *  2) İlk hane 0 olamaz
 *  3) 10. hane = ((d1+d3+d5+d7+d9)*7 - (d2+d4+d6+d8)) mod 10
 *  4) 11. hane = (d1+..+d10) mod 10
 */
export function isValidTCKN(tc: string): boolean {
  if (!/^\d{11}$/.test(tc)) return false;
  const d = tc.split('').map(Number);
  if (d[0] === 0) return false;
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const c10 = ((odd * 7 - even) % 10 + 10) % 10;
  if (c10 !== d[9]) return false;
  const sum10 = d.slice(0, 10).reduce((a, b) => a + b, 0);
  return (sum10 % 10) === d[10];
}
