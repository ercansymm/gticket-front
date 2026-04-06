/**
 * Türkçe karakterleri ASCII karşılıklarına dönüştürüp küçük harfe çevirir.
 * Havalimanı arama, autocomplete ve filtreleme gibi yerlerde
 * "ıst" ile "ist" aramasının aynı sonucu vermesi için kullanılır.
 */
export const normalizeForSearch = (text: string): string => {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g');
};
