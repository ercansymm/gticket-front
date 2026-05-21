interface AirportTurkishInfo {
  cityName: string;
  airportName: string;
}

const TURKISH_AIRPORT_NAMES: Record<string, AirportTurkishInfo> = {
  // ── İstanbul ──
  IST: { cityName: 'İstanbul', airportName: 'İstanbul Havalimanı' },
  SAW: { cityName: 'İstanbul', airportName: 'Sabiha Gökçen Havalimanı' },

  // ── Ankara ──
  ESB: { cityName: 'Ankara', airportName: 'Esenboğa Havalimanı' },

  // ── Akdeniz ──
  AYT: { cityName: 'Antalya', airportName: 'Antalya Havalimanı' },
  GZP: { cityName: 'Alanya', airportName: 'Gazipaşa-Alanya Havalimanı' },
  ADA: { cityName: 'Adana', airportName: 'Şakirpaşa Havalimanı' },
  COV: { cityName: 'Mersin', airportName: 'Çukurova Havalimanı' },
  MZH: { cityName: 'Amasya', airportName: 'Merzifon Havalimanı' },
  HTY: { cityName: 'Hatay', airportName: 'Hatay Havalimanı' },
  ISE: { cityName: 'Isparta', airportName: 'Süleyman Demirel Havalimanı' },
  KSY: { cityName: 'Kars', airportName: 'Kars Harakani Havalimanı' },

  // ── Ege ──
  ADB: { cityName: 'İzmir', airportName: 'Adnan Menderes Havalimanı' },
  BJV: { cityName: 'Bodrum', airportName: 'Milas-Bodrum Havalimanı' },
  DLM: { cityName: 'Dalaman', airportName: 'Dalaman Havalimanı' },
  DNZ: { cityName: 'Denizli', airportName: 'Çardak Havalimanı' },
  KZR: { cityName: 'Kütahya', airportName: 'Zafer Havalimanı' },
  USQ: { cityName: 'Uşak', airportName: 'Uşak Havalimanı' },

  // ── Marmara ──
  BZC: { cityName: 'Balıkesir', airportName: 'Balıkesir Merkez Havalimanı' },
  EDO: { cityName: 'Balıkesir', airportName: 'Koca Seyit Havalimanı' },
  BDM: { cityName: 'Bandırma', airportName: 'Bandırma Havalimanı' },
  BTZ: { cityName: 'Bursa', airportName: 'Yenişehir Havalimanı' },
  CKZ: { cityName: 'Çanakkale', airportName: 'Çanakkale Havalimanı' },
  TEQ: { cityName: 'Tekirdağ', airportName: 'Çorlu Havalimanı' },

  // ── İç Anadolu ──
  KYA: { cityName: 'Konya', airportName: 'Konya Havalimanı' },
  ASR: { cityName: 'Kayseri', airportName: 'Erkilet Havalimanı' },
  NAV: { cityName: 'Nevşehir', airportName: 'Kapadokya Havalimanı' },
  SIC: { cityName: 'Sinop', airportName: 'Sinop Havalimanı' },
  OGU: { cityName: 'Ordu', airportName: 'Ordu-Giresun Havalimanı' },
  YKO: { cityName: 'Yozgat', airportName: 'Yozgat Havalimanı' },
  KFS: { cityName: 'Kastamonu', airportName: 'Kastamonu Havalimanı' },

  // ── Karadeniz ──
  TZX: { cityName: 'Trabzon', airportName: 'Trabzon Havalimanı' },
  SZF: { cityName: 'Samsun', airportName: 'Çarşamba Havalimanı' },
  RZV: { cityName: 'Rize', airportName: 'Rize-Artvin Havalimanı' },
  ZON: { cityName: 'Zonguldak', airportName: 'Zonguldak Havalimanı' },
  BFQ: { cityName: 'Bayburt', airportName: 'Bayburt Havalimanı' },
  KCM: { cityName: 'Kahramanmaraş', airportName: 'Kahramanmaraş Havalimanı' },

  // ── Güneydoğu Anadolu ──
  GZT: { cityName: 'Gaziantep', airportName: 'Oğuzeli Havalimanı' },
  DIY: { cityName: 'Diyarbakır', airportName: 'Diyarbakır Havalimanı' },
  SFQ: { cityName: 'Şanlıurfa', airportName: 'GAP Havalimanı' },
  MQM: { cityName: 'Mardin', airportName: 'Mardin Havalimanı' },
  BGG: { cityName: 'Bingöl', airportName: 'Bingöl Havalimanı' },
  SXZ: { cityName: 'Siirt', airportName: 'Siirt Havalimanı' },
  NKT: { cityName: 'Şırnak', airportName: 'Şerafettin Elçi Havalimanı' },
  BAL: { cityName: 'Batman', airportName: 'Batman Havalimanı' },

  // ── Doğu Anadolu ──
  VAN: { cityName: 'Van', airportName: 'Ferit Melen Havalimanı' },
  ERZ: { cityName: 'Erzurum', airportName: 'Erzurum Havalimanı' },
  EZS: { cityName: 'Elazığ', airportName: 'Elazığ Havalimanı' },
  MLX: { cityName: 'Malatya', airportName: 'Malatya Havalimanı' },
  ERC: { cityName: 'Erzincan', airportName: 'Erzincan Havalimanı' },
  TJK: { cityName: 'Tokat', airportName: 'Tokat Havalimanı' },
  MSR: { cityName: 'Muş', airportName: 'Muş Havalimanı' },
  AJI: { cityName: 'Ağrı', airportName: 'Ahmed-i Hani Havalimanı' },
  IGD: { cityName: 'Iğdır', airportName: 'Iğdır Havalimanı' },
  HRK: { cityName: 'Hakkari', airportName: 'Yüksekova Havalimanı' },

  // ── KKTC ──
  ECN: { cityName: 'Lefkoşa', airportName: 'Ercan Havalimanı' },
};

export const getTurkishAirportInfo = (iataCode: string): AirportTurkishInfo | null => {
  return TURKISH_AIRPORT_NAMES[iataCode.toUpperCase()] ?? null;
};
