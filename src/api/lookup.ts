import apiClient from './client';

// Backend'den gelen ham havalimanı tipi
interface AirportRaw {
  id: number;
  iataCode: string;
  icaoCode: string;
  nameTr: string;
  nameEn: string;
  cityTr: string;
  cityEn: string;
  countryTr: string;
  countryEn: string;
  countryCode: string;
  timezone: string;
  isCity: boolean;
  isDomestic: boolean;
  isActive: boolean;
  sortOrder: number;
}

// Frontend'de kullanılan mapped tip
export interface AirportDto {
  iataCode: string;        // "IST"
  name: string;            // Aktif dile göre
  city: string;            // Aktif dile göre
  countryCode: string;     // "TR"
  isDomestic: boolean;
}

/** Bozuk encoding kontrolü — ? veya � varsa true döner */
const isBroken = (str: string | undefined | null): boolean => {
  if (!str) return true;
  return str.includes('?') || str.includes('\ufffd');
};

/** Havalimanı koduna göre bilinen isimler (encoding fallback) */
const airportNamesFallback: Record<string, { nameTr: string; nameEn: string; cityTr: string; cityEn: string }> = {
  'IST': { nameTr: 'İstanbul Havalimanı', nameEn: 'Istanbul Airport', cityTr: 'İstanbul', cityEn: 'Istanbul' },
  'SAW': { nameTr: 'Sabiha Gökçen Havalimanı', nameEn: 'Sabiha Gokcen Airport', cityTr: 'İstanbul', cityEn: 'Istanbul' },
  'ESB': { nameTr: 'Esenboğa Havalimanı', nameEn: 'Esenboga Airport', cityTr: 'Ankara', cityEn: 'Ankara' },
  'AYT': { nameTr: 'Antalya Havalimanı', nameEn: 'Antalya Airport', cityTr: 'Antalya', cityEn: 'Antalya' },
  'ADB': { nameTr: 'Adnan Menderes Havalimanı', nameEn: 'Adnan Menderes Airport', cityTr: 'İzmir', cityEn: 'Izmir' },
  'TZX': { nameTr: 'Trabzon Havalimanı', nameEn: 'Trabzon Airport', cityTr: 'Trabzon', cityEn: 'Trabzon' },
  'ADA': { nameTr: 'Adana Havalimanı', nameEn: 'Adana Airport', cityTr: 'Adana', cityEn: 'Adana' },
  'BJV': { nameTr: 'Milas-Bodrum Havalimanı', nameEn: 'Milas-Bodrum Airport', cityTr: 'Bodrum', cityEn: 'Bodrum' },
  'DLM': { nameTr: 'Dalaman Havalimanı', nameEn: 'Dalaman Airport', cityTr: 'Dalaman', cityEn: 'Dalaman' },
  'GZT': { nameTr: 'Gaziantep Havalimanı', nameEn: 'Gaziantep Airport', cityTr: 'Gaziantep', cityEn: 'Gaziantep' },
  'VAN': { nameTr: 'Van Havalimanı', nameEn: 'Van Airport', cityTr: 'Van', cityEn: 'Van' },
  'ERZ': { nameTr: 'Erzurum Havalimanı', nameEn: 'Erzurum Airport', cityTr: 'Erzurum', cityEn: 'Erzurum' },
  'DIY': { nameTr: 'Diyarbakır Havalimanı', nameEn: 'Diyarbakir Airport', cityTr: 'Diyarbakır', cityEn: 'Diyarbakir' },
  'SZF': { nameTr: 'Samsun Çarşamba Havalimanı', nameEn: 'Samsun Airport', cityTr: 'Samsun', cityEn: 'Samsun' },
  'KYA': { nameTr: 'Konya Havalimanı', nameEn: 'Konya Airport', cityTr: 'Konya', cityEn: 'Konya' },
  'EZS': { nameTr: 'Elazığ Havalimanı', nameEn: 'Elazig Airport', cityTr: 'Elazığ', cityEn: 'Elazig' },
  'MLX': { nameTr: 'Malatya Havalimanı', nameEn: 'Malatya Airport', cityTr: 'Malatya', cityEn: 'Malatya' },
  'NAV': { nameTr: 'Kapadokya Havalimanı', nameEn: 'Cappadocia Airport', cityTr: 'Nevşehir', cityEn: 'Nevsehir' },
  'HTY': { nameTr: 'Hatay Havalimanı', nameEn: 'Hatay Airport', cityTr: 'Hatay', cityEn: 'Hatay' },
};

/** Ham backend verisini dile göre AirportDto'ya dönüştür — bozuk encoding varsa fallback kullan */
const mapAirport = (a: AirportRaw, lang: 'tr' | 'en' = 'tr'): AirportDto => {
  const fallback = airportNamesFallback[a.iataCode];
  const rawName = lang === 'tr' ? a.nameTr : a.nameEn;
  const rawCity = lang === 'tr' ? a.cityTr : a.cityEn;

  const name = rawName && !isBroken(rawName)
    ? rawName
    : (lang === 'tr' ? fallback?.nameTr : fallback?.nameEn) || a.iataCode;
  const city = rawCity && !isBroken(rawCity)
    ? rawCity
    : (lang === 'tr' ? fallback?.cityTr : fallback?.cityEn) || '';

  return {
    iataCode: a.iataCode,
    name,
    city,
    countryCode: a.countryCode || 'TR',
    isDomestic: a.isDomestic ?? true,
  };
};

// Havayolu tipleri
export interface AirlineDto {
  code: string;            // "TK"
  name: string;            // Aktif dile göre
  logoUrl: string | null;
}

// Popüler rota tipleri
export interface PopularRouteDto {
  originCode: string;       // "IST"
  destinationCode: string;  // "AYT"
  originCity: string;       // Aktif dile göre
  destinationCity: string;  // Aktif dile göre
  displayPrice: number;     // 899
  currency: string;         // "TRY"
}

/**
 * Havalimanı arama — autocomplete için
 * GET /api/airport/search?q=ist
 */
export const searchAirports = async (query: string, lang: 'tr' | 'en' = 'tr'): Promise<AirportDto[]> => {
  if (!query || query.length < 2) return [];

  try {
    const response = await apiClient.get<{ value: AirportRaw[] } | AirportRaw[]>(`/api/airport/search?q=${encodeURIComponent(query)}`);
    const raw = Array.isArray(response.data) ? response.data : response.data.value;
    return raw.map(a => mapAirport(a, lang));
  } catch {
    // Search endpoint 404 fallback: tüm havalimanlarını çekip frontend'de filtrele
    try {
      const all = await getAllAirports(lang);
      const q = query.toLowerCase();
      return all.filter(a =>
        a.iataCode?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q)
      );
    } catch {
      return [];
    }
  }
};

/**
 * Tüm yurt içi havalimanları
 * GET /api/airport/domestic
 */
export const getDomesticAirports = async (lang: 'tr' | 'en' = 'tr'): Promise<AirportDto[]> => {
  const response = await apiClient.get<{ value: AirportRaw[] } | AirportRaw[]>('/api/airport/domestic');
  const raw = Array.isArray(response.data) ? response.data : response.data.value;
  return raw.map(a => mapAirport(a, lang));
};

/**
 * Tüm havalimanları
 * GET /api/airport
 */
export const getAllAirports = async (lang: 'tr' | 'en' = 'tr'): Promise<AirportDto[]> => {
  const response = await apiClient.get<{ value: AirportRaw[] } | AirportRaw[]>('/api/airport');
  const raw = Array.isArray(response.data) ? response.data : response.data.value;
  return raw.map(a => mapAirport(a, lang));
};

/**
 * Tüm havayolları
 * GET /api/airline
 */
export const getAllAirlines = async (): Promise<AirlineDto[]> => {
  const response = await apiClient.get<AirlineDto[]>('/api/airline');
  return response.data;
};

/**
 * Popüler rotalar — ana sayfa için
 * GET /api/popularroute
 */
export const getPopularRoutes = async (): Promise<PopularRouteDto[]> => {
  const response = await apiClient.get<PopularRouteDto[]>('/api/popularroute');
  return response.data;
};
