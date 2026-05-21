import type { Airport } from '@/types';

/**
 * Türkiye aktif iç hat havalimanları — fallback verisi.
 * Backend çalışıyorsa API'den gelir; çökmüşse bu liste kullanılır.
 */
export const airports: Airport[] = [
  // ── İstanbul ──
  { code: 'IST', nameTr: 'İstanbul Havalimanı', nameEn: 'Istanbul Airport', cityTr: 'İstanbul', cityEn: 'Istanbul', countryCode: 'TR', isDomestic: true, cityCode: 'IST' },
  { code: 'SAW', nameTr: 'Sabiha Gökçen Havalimanı', nameEn: 'Sabiha Gokcen Airport', cityTr: 'İstanbul', cityEn: 'Istanbul', countryCode: 'TR', isDomestic: true, cityCode: 'IST' },

  // ── Ankara ──
  { code: 'ESB', nameTr: 'Esenboğa Havalimanı', nameEn: 'Esenboga Airport', cityTr: 'Ankara', cityEn: 'Ankara', countryCode: 'TR', isDomestic: true },

  // ── Akdeniz ──
  { code: 'AYT', nameTr: 'Antalya Havalimanı', nameEn: 'Antalya Airport', cityTr: 'Antalya', cityEn: 'Antalya', countryCode: 'TR', isDomestic: true },
  { code: 'GZP', nameTr: 'Gazipaşa-Alanya Havalimanı', nameEn: 'Gazipasa-Alanya Airport', cityTr: 'Alanya', cityEn: 'Alanya', countryCode: 'TR', isDomestic: true },
  { code: 'COV', nameTr: 'Çukurova Havalimanı', nameEn: 'Cukurova International Airport', cityTr: 'Mersin', cityEn: 'Mersin', countryCode: 'TR', isDomestic: true },
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

  // ══════════════════════════════════════
  // ULUSLARARASI — Aynı şehirde 2+ havalimanı
  // ══════════════════════════════════════

  // ── Londra ──
  { code: 'LHR', nameTr: 'Heathrow Havalimanı', nameEn: 'Heathrow Airport', cityTr: 'Londra', cityEn: 'London', countryCode: 'GB', isDomestic: false, cityCode: 'LON' },
  { code: 'LGW', nameTr: 'Gatwick Havalimanı', nameEn: 'Gatwick Airport', cityTr: 'Londra', cityEn: 'London', countryCode: 'GB', isDomestic: false, cityCode: 'LON' },
  { code: 'STN', nameTr: 'Stansted Havalimanı', nameEn: 'Stansted Airport', cityTr: 'Londra', cityEn: 'London', countryCode: 'GB', isDomestic: false, cityCode: 'LON' },
  { code: 'LTN', nameTr: 'Luton Havalimanı', nameEn: 'Luton Airport', cityTr: 'Londra', cityEn: 'London', countryCode: 'GB', isDomestic: false, cityCode: 'LON' },

  // ── Paris ──
  { code: 'CDG', nameTr: 'Charles de Gaulle Havalimanı', nameEn: 'Charles de Gaulle Airport', cityTr: 'Paris', cityEn: 'Paris', countryCode: 'FR', isDomestic: false },
  { code: 'ORY', nameTr: 'Orly Havalimanı', nameEn: 'Orly Airport', cityTr: 'Paris', cityEn: 'Paris', countryCode: 'FR', isDomestic: false },

  // ── New York ──
  { code: 'JFK', nameTr: 'John F. Kennedy Havalimanı', nameEn: 'John F. Kennedy Airport', cityTr: 'New York', cityEn: 'New York', countryCode: 'US', isDomestic: false },
  { code: 'EWR', nameTr: 'Newark Liberty Havalimanı', nameEn: 'Newark Liberty Airport', cityTr: 'New York', cityEn: 'New York', countryCode: 'US', isDomestic: false },
  { code: 'LGA', nameTr: 'LaGuardia Havalimanı', nameEn: 'LaGuardia Airport', cityTr: 'New York', cityEn: 'New York', countryCode: 'US', isDomestic: false },

  // ── Moskova ──
  { code: 'SVO', nameTr: 'Şeremetyevo Havalimanı', nameEn: 'Sheremetyevo Airport', cityTr: 'Moskova', cityEn: 'Moscow', countryCode: 'RU', isDomestic: false },
  { code: 'DME', nameTr: 'Domodedovo Havalimanı', nameEn: 'Domodedovo Airport', cityTr: 'Moskova', cityEn: 'Moscow', countryCode: 'RU', isDomestic: false },
  { code: 'VKO', nameTr: 'Vnukovo Havalimanı', nameEn: 'Vnukovo Airport', cityTr: 'Moskova', cityEn: 'Moscow', countryCode: 'RU', isDomestic: false },

  // ── Milano ──
  { code: 'MXP', nameTr: 'Malpensa Havalimanı', nameEn: 'Malpensa Airport', cityTr: 'Milano', cityEn: 'Milan', countryCode: 'IT', isDomestic: false },
  { code: 'LIN', nameTr: 'Linate Havalimanı', nameEn: 'Linate Airport', cityTr: 'Milano', cityEn: 'Milan', countryCode: 'IT', isDomestic: false },
  { code: 'BGY', nameTr: 'Bergamo Havalimanı', nameEn: 'Bergamo Airport', cityTr: 'Milano', cityEn: 'Milan', countryCode: 'IT', isDomestic: false },

  // ── Roma ──
  { code: 'FCO', nameTr: 'Fiumicino Havalimanı', nameEn: 'Fiumicino Airport', cityTr: 'Roma', cityEn: 'Rome', countryCode: 'IT', isDomestic: false },
  { code: 'CIA', nameTr: 'Ciampino Havalimanı', nameEn: 'Ciampino Airport', cityTr: 'Roma', cityEn: 'Rome', countryCode: 'IT', isDomestic: false },

  // ── Berlin ──
  { code: 'BER', nameTr: 'Berlin Brandenburg Havalimanı', nameEn: 'Berlin Brandenburg Airport', cityTr: 'Berlin', cityEn: 'Berlin', countryCode: 'DE', isDomestic: false },
  { code: 'SXF', nameTr: 'Schönefeld Havalimanı', nameEn: 'Schonefeld Airport', cityTr: 'Berlin', cityEn: 'Berlin', countryCode: 'DE', isDomestic: false },

  // ── Dubai ──
  { code: 'DXB', nameTr: 'Dubai Uluslararası Havalimanı', nameEn: 'Dubai International Airport', cityTr: 'Dubai', cityEn: 'Dubai', countryCode: 'AE', isDomestic: false },
  { code: 'DWC', nameTr: 'Al Maktoum Havalimanı', nameEn: 'Al Maktoum Airport', cityTr: 'Dubai', cityEn: 'Dubai', countryCode: 'AE', isDomestic: false },

  // ── Tokyo ──
  { code: 'NRT', nameTr: 'Narita Havalimanı', nameEn: 'Narita Airport', cityTr: 'Tokyo', cityEn: 'Tokyo', countryCode: 'JP', isDomestic: false },
  { code: 'HND', nameTr: 'Haneda Havalimanı', nameEn: 'Haneda Airport', cityTr: 'Tokyo', cityEn: 'Tokyo', countryCode: 'JP', isDomestic: false },

  // ── Seul ──
  { code: 'ICN', nameTr: 'Incheon Havalimanı', nameEn: 'Incheon Airport', cityTr: 'Seul', cityEn: 'Seoul', countryCode: 'KR', isDomestic: false },
  { code: 'GMP', nameTr: 'Gimpo Havalimanı', nameEn: 'Gimpo Airport', cityTr: 'Seul', cityEn: 'Seoul', countryCode: 'KR', isDomestic: false },

  // ── Buenos Aires ──
  { code: 'EZE', nameTr: 'Ezeiza Havalimanı', nameEn: 'Ezeiza Airport', cityTr: 'Buenos Aires', cityEn: 'Buenos Aires', countryCode: 'AR', isDomestic: false },
  { code: 'AEP', nameTr: 'Aeroparque Havalimanı', nameEn: 'Aeroparque Airport', cityTr: 'Buenos Aires', cityEn: 'Buenos Aires', countryCode: 'AR', isDomestic: false },

  // ── Bangkok ──
  { code: 'BKK', nameTr: 'Suvarnabhumi Havalimanı', nameEn: 'Suvarnabhumi Airport', cityTr: 'Bangkok', cityEn: 'Bangkok', countryCode: 'TH', isDomestic: false },
  { code: 'DMK', nameTr: 'Don Mueang Havalimanı', nameEn: 'Don Mueang Airport', cityTr: 'Bangkok', cityEn: 'Bangkok', countryCode: 'TH', isDomestic: false },

  // ── Şangay ──
  { code: 'PVG', nameTr: 'Pudong Havalimanı', nameEn: 'Pudong Airport', cityTr: 'Şangay', cityEn: 'Shanghai', countryCode: 'CN', isDomestic: false },
  { code: 'SHA', nameTr: 'Hongqiao Havalimanı', nameEn: 'Hongqiao Airport', cityTr: 'Şangay', cityEn: 'Shanghai', countryCode: 'CN', isDomestic: false },

  // ── Tahran ──
  { code: 'IKA', nameTr: 'İmam Humeyni Havalimanı', nameEn: 'Imam Khomeini Airport', cityTr: 'Tahran', cityEn: 'Tehran', countryCode: 'IR', isDomestic: false },
  { code: 'THR', nameTr: 'Mehrabad Havalimanı', nameEn: 'Mehrabad Airport', cityTr: 'Tahran', cityEn: 'Tehran', countryCode: 'IR', isDomestic: false },

  // ── Chicago ──
  { code: 'ORD', nameTr: "O'Hare Havalimanı", nameEn: "O'Hare Airport", cityTr: 'Chicago', cityEn: 'Chicago', countryCode: 'US', isDomestic: false },
  { code: 'MDW', nameTr: 'Midway Havalimanı', nameEn: 'Midway Airport', cityTr: 'Chicago', cityEn: 'Chicago', countryCode: 'US', isDomestic: false },

  // ── Washington ──
  { code: 'IAD', nameTr: 'Dulles Havalimanı', nameEn: 'Dulles Airport', cityTr: 'Washington', cityEn: 'Washington', countryCode: 'US', isDomestic: false },
  { code: 'DCA', nameTr: 'Reagan Havalimanı', nameEn: 'Reagan Airport', cityTr: 'Washington', cityEn: 'Washington', countryCode: 'US', isDomestic: false },

  // ── Toronto ──
  { code: 'YYZ', nameTr: 'Pearson Havalimanı', nameEn: 'Pearson Airport', cityTr: 'Toronto', cityEn: 'Toronto', countryCode: 'CA', isDomestic: false },
  { code: 'YTZ', nameTr: 'Billy Bishop Havalimanı', nameEn: 'Billy Bishop Airport', cityTr: 'Toronto', cityEn: 'Toronto', countryCode: 'CA', isDomestic: false },

  // ══════════════════════════════════════
  // ULUSLARARASI — Tekil popüler havalimanları
  // ══════════════════════════════════════
  { code: 'FRA', nameTr: 'Frankfurt Havalimanı', nameEn: 'Frankfurt Airport', cityTr: 'Frankfurt', cityEn: 'Frankfurt', countryCode: 'DE', isDomestic: false },
  { code: 'MUC', nameTr: 'Münih Havalimanı', nameEn: 'Munich Airport', cityTr: 'Münih', cityEn: 'Munich', countryCode: 'DE', isDomestic: false },
  { code: 'AMS', nameTr: 'Schiphol Havalimanı', nameEn: 'Schiphol Airport', cityTr: 'Amsterdam', cityEn: 'Amsterdam', countryCode: 'NL', isDomestic: false },
  { code: 'BCN', nameTr: 'El Prat Havalimanı', nameEn: 'El Prat Airport', cityTr: 'Barselona', cityEn: 'Barcelona', countryCode: 'ES', isDomestic: false },
  { code: 'MAD', nameTr: 'Barajas Havalimanı', nameEn: 'Barajas Airport', cityTr: 'Madrid', cityEn: 'Madrid', countryCode: 'ES', isDomestic: false },
  { code: 'ATH', nameTr: 'Atina Havalimanı', nameEn: 'Athens Airport', cityTr: 'Atina', cityEn: 'Athens', countryCode: 'GR', isDomestic: false },
  { code: 'VIE', nameTr: 'Viyana Havalimanı', nameEn: 'Vienna Airport', cityTr: 'Viyana', cityEn: 'Vienna', countryCode: 'AT', isDomestic: false },
  { code: 'ZRH', nameTr: 'Zürih Havalimanı', nameEn: 'Zurich Airport', cityTr: 'Zürih', cityEn: 'Zurich', countryCode: 'CH', isDomestic: false },
  { code: 'BRU', nameTr: 'Brüksel Havalimanı', nameEn: 'Brussels Airport', cityTr: 'Brüksel', cityEn: 'Brussels', countryCode: 'BE', isDomestic: false },
  { code: 'CPH', nameTr: 'Kopenhag Havalimanı', nameEn: 'Copenhagen Airport', cityTr: 'Kopenhag', cityEn: 'Copenhagen', countryCode: 'DK', isDomestic: false },
  { code: 'OSL', nameTr: 'Oslo Havalimanı', nameEn: 'Oslo Airport', cityTr: 'Oslo', cityEn: 'Oslo', countryCode: 'NO', isDomestic: false },
  { code: 'DOH', nameTr: 'Hamad Havalimanı', nameEn: 'Hamad Airport', cityTr: 'Doha', cityEn: 'Doha', countryCode: 'QA', isDomestic: false },
  { code: 'CAI', nameTr: 'Kahire Havalimanı', nameEn: 'Cairo Airport', cityTr: 'Kahire', cityEn: 'Cairo', countryCode: 'EG', isDomestic: false },
  { code: 'TBS', nameTr: 'Tiflis Havalimanı', nameEn: 'Tbilisi Airport', cityTr: 'Tiflis', cityEn: 'Tbilisi', countryCode: 'GE', isDomestic: false },
  { code: 'GYD', nameTr: 'Haydar Aliyev Havalimanı', nameEn: 'Heydar Aliyev Airport', cityTr: 'Bakü', cityEn: 'Baku', countryCode: 'AZ', isDomestic: false },
  { code: 'ECN', nameTr: 'Ercan Havalimanı', nameEn: 'Ercan Airport', cityTr: 'Lefkoşa', cityEn: 'Nicosia', countryCode: 'CY', isDomestic: false },
  { code: 'SKP', nameTr: 'Üsküp Havalimanı', nameEn: 'Skopje Airport', cityTr: 'Üsküp', cityEn: 'Skopje', countryCode: 'MK', isDomestic: false },
  { code: 'SOF', nameTr: 'Sofya Havalimanı', nameEn: 'Sofia Airport', cityTr: 'Sofya', cityEn: 'Sofia', countryCode: 'BG', isDomestic: false },
  { code: 'OTP', nameTr: 'Bükreş Havalimanı', nameEn: 'Bucharest Airport', cityTr: 'Bükreş', cityEn: 'Bucharest', countryCode: 'RO', isDomestic: false },
  { code: 'BEG', nameTr: 'Belgrad Havalimanı', nameEn: 'Belgrade Airport', cityTr: 'Belgrad', cityEn: 'Belgrade', countryCode: 'RS', isDomestic: false },
  { code: 'SJJ', nameTr: 'Saraybosna Havalimanı', nameEn: 'Sarajevo Airport', cityTr: 'Saraybosna', cityEn: 'Sarajevo', countryCode: 'BA', isDomestic: false },
  { code: 'PRN', nameTr: 'Priştine Havalimanı', nameEn: 'Pristina Airport', cityTr: 'Priştine', cityEn: 'Pristina', countryCode: 'XK', isDomestic: false },
  { code: 'TIA', nameTr: 'Tiran Havalimanı', nameEn: 'Tirana Airport', cityTr: 'Tiran', cityEn: 'Tirana', countryCode: 'AL', isDomestic: false },
  { code: 'JED', nameTr: 'Cidde Havalimanı', nameEn: 'Jeddah Airport', cityTr: 'Cidde', cityEn: 'Jeddah', countryCode: 'SA', isDomestic: false },
  { code: 'RUH', nameTr: 'Riyad Havalimanı', nameEn: 'Riyadh Airport', cityTr: 'Riyad', cityEn: 'Riyadh', countryCode: 'SA', isDomestic: false },
  { code: 'KWI', nameTr: 'Kuveyt Havalimanı', nameEn: 'Kuwait Airport', cityTr: 'Kuveyt', cityEn: 'Kuwait', countryCode: 'KW', isDomestic: false },
  { code: 'AMM', nameTr: 'Amman Havalimanı', nameEn: 'Amman Airport', cityTr: 'Amman', cityEn: 'Amman', countryCode: 'JO', isDomestic: false },
  { code: 'TLV', nameTr: 'Ben Gurion Havalimanı', nameEn: 'Ben Gurion Airport', cityTr: 'Tel Aviv', cityEn: 'Tel Aviv', countryCode: 'IL', isDomestic: false },
  { code: 'BEY', nameTr: 'Beyrut Havalimanı', nameEn: 'Beirut Airport', cityTr: 'Beyrut', cityEn: 'Beirut', countryCode: 'LB', isDomestic: false },
];
