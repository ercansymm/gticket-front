import type { Airport } from '@/types';

/**
 * Türkiye aktif iç hat havalimanları — fallback verisi.
 * Backend çalışıyorsa API'den gelir; çökmüşse bu liste kullanılır.
 */
export const airports: Airport[] = [
  // ── İstanbul ──
  { code: 'IST', nameTr: 'İstanbul Havalimanı', nameEn: 'Istanbul Airport', cityTr: 'İstanbul', cityEn: 'Istanbul', countryCode: 'TR', isDomestic: true },
  { code: 'SAW', nameTr: 'Sabiha Gökçen Havalimanı', nameEn: 'Sabiha Gokcen Airport', cityTr: 'İstanbul', cityEn: 'Istanbul', countryCode: 'TR', isDomestic: true },

  // ── Ankara ──
  { code: 'ESB', nameTr: 'Esenboğa Havalimanı', nameEn: 'Esenboga Airport', cityTr: 'Ankara', cityEn: 'Ankara', countryCode: 'TR', isDomestic: true },

  // ── Akdeniz ──
  { code: 'AYT', nameTr: 'Antalya Havalimanı', nameEn: 'Antalya Airport', cityTr: 'Antalya', cityEn: 'Antalya', countryCode: 'TR', isDomestic: true },
  { code: 'GZP', nameTr: 'Gazipaşa-Alanya Havalimanı', nameEn: 'Gazipasa-Alanya Airport', cityTr: 'Alanya', cityEn: 'Alanya', countryCode: 'TR', isDomestic: true },
  { code: 'ADA', nameTr: 'Adana Havalimanı', nameEn: 'Adana Airport', cityTr: 'Adana', cityEn: 'Adana', countryCode: 'TR', isDomestic: true },
  { code: 'MZH', nameTr: 'Amasya Merzifon Havalimanı', nameEn: 'Amasya Merzifon Airport', cityTr: 'Amasya', cityEn: 'Amasya', countryCode: 'TR', isDomestic: true },
  { code: 'HTY', nameTr: 'Hatay Havalimanı', nameEn: 'Hatay Airport', cityTr: 'Hatay', cityEn: 'Hatay', countryCode: 'TR', isDomestic: true },
  { code: 'ISE', nameTr: 'Süleyman Demirel Havalimanı', nameEn: 'Isparta Suleyman Demirel Airport', cityTr: 'Isparta', cityEn: 'Isparta', countryCode: 'TR', isDomestic: true },
  { code: 'KSY', nameTr: 'Kars Harakani Havalimanı', nameEn: 'Kars Harakani Airport', cityTr: 'Kars', cityEn: 'Kars', countryCode: 'TR', isDomestic: true },

  // ── Ege ──
  { code: 'ADB', nameTr: 'Adnan Menderes Havalimanı', nameEn: 'Adnan Menderes Airport', cityTr: 'İzmir', cityEn: 'Izmir', countryCode: 'TR', isDomestic: true },
  { code: 'BJV', nameTr: 'Milas-Bodrum Havalimanı', nameEn: 'Milas-Bodrum Airport', cityTr: 'Bodrum', cityEn: 'Bodrum', countryCode: 'TR', isDomestic: true },
  { code: 'DLM', nameTr: 'Dalaman Havalimanı', nameEn: 'Dalaman Airport', cityTr: 'Dalaman', cityEn: 'Dalaman', countryCode: 'TR', isDomestic: true },
  { code: 'DNZ', nameTr: 'Denizli Çardak Havalimanı', nameEn: 'Denizli Cardak Airport', cityTr: 'Denizli', cityEn: 'Denizli', countryCode: 'TR', isDomestic: true },
  { code: 'KZR', nameTr: 'Zafer Havalimanı', nameEn: 'Zafer Airport', cityTr: 'Kütahya', cityEn: 'Kutahya', countryCode: 'TR', isDomestic: true },
  { code: 'USQ', nameTr: 'Uşak Havalimanı', nameEn: 'Usak Airport', cityTr: 'Uşak', cityEn: 'Usak', countryCode: 'TR', isDomestic: true },

  // ── Marmara ──
  { code: 'BZC', nameTr: 'Balıkesir Merkez Havalimanı', nameEn: 'Balikesir Airport', cityTr: 'Balıkesir', cityEn: 'Balikesir', countryCode: 'TR', isDomestic: true },
  { code: 'EDO', nameTr: 'Balıkesir Koca Seyit Havalimanı', nameEn: 'Balikesir Koca Seyit Airport', cityTr: 'Edremit', cityEn: 'Edremit', countryCode: 'TR', isDomestic: true },
  { code: 'BDM', nameTr: 'Bandırma Havalimanı', nameEn: 'Bandirma Airport', cityTr: 'Bandırma', cityEn: 'Bandirma', countryCode: 'TR', isDomestic: true },
  { code: 'BTZ', nameTr: 'Bursa Yenişehir Havalimanı', nameEn: 'Bursa Yenisehir Airport', cityTr: 'Bursa', cityEn: 'Bursa', countryCode: 'TR', isDomestic: true },
  { code: 'CKZ', nameTr: 'Çanakkale Havalimanı', nameEn: 'Canakkale Airport', cityTr: 'Çanakkale', cityEn: 'Canakkale', countryCode: 'TR', isDomestic: true },
  { code: 'TEQ', nameTr: 'Tekirdağ Çorlu Havalimanı', nameEn: 'Tekirdag Corlu Airport', cityTr: 'Tekirdağ', cityEn: 'Tekirdag', countryCode: 'TR', isDomestic: true },

  // ── İç Anadolu ──
  { code: 'KYA', nameTr: 'Konya Havalimanı', nameEn: 'Konya Airport', cityTr: 'Konya', cityEn: 'Konya', countryCode: 'TR', isDomestic: true },
  { code: 'ASR', nameTr: 'Kayseri Erkilet Havalimanı', nameEn: 'Kayseri Erkilet Airport', cityTr: 'Kayseri', cityEn: 'Kayseri', countryCode: 'TR', isDomestic: true },
  { code: 'NAV', nameTr: 'Kapadokya Havalimanı', nameEn: 'Cappadocia Airport', cityTr: 'Nevşehir', cityEn: 'Nevsehir', countryCode: 'TR', isDomestic: true },
  { code: 'SIC', nameTr: 'Sinop Havalimanı', nameEn: 'Sinop Airport', cityTr: 'Sinop', cityEn: 'Sinop', countryCode: 'TR', isDomestic: true },
  { code: 'OGU', nameTr: 'Ordu-Giresun Havalimanı', nameEn: 'Ordu-Giresun Airport', cityTr: 'Ordu', cityEn: 'Ordu', countryCode: 'TR', isDomestic: true },
  { code: 'YKO', nameTr: 'Yozgat Havalimanı', nameEn: 'Yozgat Airport', cityTr: 'Yozgat', cityEn: 'Yozgat', countryCode: 'TR', isDomestic: true },
  { code: 'KFS', nameTr: 'Kastamonu Havalimanı', nameEn: 'Kastamonu Airport', cityTr: 'Kastamonu', cityEn: 'Kastamonu', countryCode: 'TR', isDomestic: true },

  // ── Karadeniz ──
  { code: 'TZX', nameTr: 'Trabzon Havalimanı', nameEn: 'Trabzon Airport', cityTr: 'Trabzon', cityEn: 'Trabzon', countryCode: 'TR', isDomestic: true },
  { code: 'SZF', nameTr: 'Samsun Çarşamba Havalimanı', nameEn: 'Samsun Carsamba Airport', cityTr: 'Samsun', cityEn: 'Samsun', countryCode: 'TR', isDomestic: true },
  { code: 'RZV', nameTr: 'Rize-Artvin Havalimanı', nameEn: 'Rize-Artvin Airport', cityTr: 'Rize', cityEn: 'Rize', countryCode: 'TR', isDomestic: true },
  { code: 'ZON', nameTr: 'Zonguldak Havalimanı', nameEn: 'Zonguldak Airport', cityTr: 'Zonguldak', cityEn: 'Zonguldak', countryCode: 'TR', isDomestic: true },
  { code: 'BFQ', nameTr: 'Bayburt-Of-Kalkandere Havalimanı', nameEn: 'Bayburt Airport', cityTr: 'Bayburt', cityEn: 'Bayburt', countryCode: 'TR', isDomestic: true },
  { code: 'KCM', nameTr: 'Kahramanmaraş Havalimanı', nameEn: 'Kahramanmaras Airport', cityTr: 'Kahramanmaraş', cityEn: 'Kahramanmaras', countryCode: 'TR', isDomestic: true },

  // ── Güneydoğu Anadolu ──
  { code: 'GZT', nameTr: 'Gaziantep Havalimanı', nameEn: 'Gaziantep Airport', cityTr: 'Gaziantep', cityEn: 'Gaziantep', countryCode: 'TR', isDomestic: true },
  { code: 'DIY', nameTr: 'Diyarbakır Havalimanı', nameEn: 'Diyarbakir Airport', cityTr: 'Diyarbakır', cityEn: 'Diyarbakir', countryCode: 'TR', isDomestic: true },
  { code: 'SFQ', nameTr: 'Şanlıurfa GAP Havalimanı', nameEn: 'Sanliurfa GAP Airport', cityTr: 'Şanlıurfa', cityEn: 'Sanliurfa', countryCode: 'TR', isDomestic: true },
  { code: 'MQM', nameTr: 'Mardin Havalimanı', nameEn: 'Mardin Airport', cityTr: 'Mardin', cityEn: 'Mardin', countryCode: 'TR', isDomestic: true },
  { code: 'BGG', nameTr: 'Bingöl Havalimanı', nameEn: 'Bingol Airport', cityTr: 'Bingöl', cityEn: 'Bingol', countryCode: 'TR', isDomestic: true },
  { code: 'SXZ', nameTr: 'Siirt Havalimanı', nameEn: 'Siirt Airport', cityTr: 'Siirt', cityEn: 'Siirt', countryCode: 'TR', isDomestic: true },
  { code: 'NKT', nameTr: 'Şırnak Şerafettin Elçi Havalimanı', nameEn: 'Sirnak Serafettin Elci Airport', cityTr: 'Şırnak', cityEn: 'Sirnak', countryCode: 'TR', isDomestic: true },
  { code: 'BAL', nameTr: 'Batman Havalimanı', nameEn: 'Batman Airport', cityTr: 'Batman', cityEn: 'Batman', countryCode: 'TR', isDomestic: true },

  // ── Doğu Anadolu ──
  { code: 'VAN', nameTr: 'Van Ferit Melen Havalimanı', nameEn: 'Van Ferit Melen Airport', cityTr: 'Van', cityEn: 'Van', countryCode: 'TR', isDomestic: true },
  { code: 'ERZ', nameTr: 'Erzurum Havalimanı', nameEn: 'Erzurum Airport', cityTr: 'Erzurum', cityEn: 'Erzurum', countryCode: 'TR', isDomestic: true },
  { code: 'EZS', nameTr: 'Elazığ Havalimanı', nameEn: 'Elazig Airport', cityTr: 'Elazığ', cityEn: 'Elazig', countryCode: 'TR', isDomestic: true },
  { code: 'MLX', nameTr: 'Malatya Havalimanı', nameEn: 'Malatya Airport', cityTr: 'Malatya', cityEn: 'Malatya', countryCode: 'TR', isDomestic: true },
  { code: 'ERC', nameTr: 'Erzincan Havalimanı', nameEn: 'Erzincan Airport', cityTr: 'Erzincan', cityEn: 'Erzincan', countryCode: 'TR', isDomestic: true },
  { code: 'TJK', nameTr: 'Tokat Havalimanı', nameEn: 'Tokat Airport', cityTr: 'Tokat', cityEn: 'Tokat', countryCode: 'TR', isDomestic: true },
  { code: 'MSR', nameTr: 'Muş Havalimanı', nameEn: 'Mus Airport', cityTr: 'Muş', cityEn: 'Mus', countryCode: 'TR', isDomestic: true },
  { code: 'AJI', nameTr: 'Ağrı Ahmed-i Hani Havalimanı', nameEn: 'Agri Ahmed-i Hani Airport', cityTr: 'Ağrı', cityEn: 'Agri', countryCode: 'TR', isDomestic: true },
  { code: 'IGD', nameTr: 'Iğdır Havalimanı', nameEn: 'Igdir Airport', cityTr: 'Iğdır', cityEn: 'Igdir', countryCode: 'TR', isDomestic: true },
  { code: 'HRK', nameTr: 'Hakkari Yüksekova Selahaddin Eyyubi Havalimanı', nameEn: 'Hakkari Yuksekova Airport', cityTr: 'Hakkari', cityEn: 'Hakkari', countryCode: 'TR', isDomestic: true },
];
