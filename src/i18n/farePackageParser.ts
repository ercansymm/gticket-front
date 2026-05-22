/**
 * Fare Package Universal Translation Parser
 * ===========================================
 *
 * Tüm havayollarından gelen tarife paketi metinlerini Türkçe'ye çevirir.
 * Statik sözlük + regex pattern + semantic keyword fallback yaklaşımını
 * birleştirerek dayanıklı bir çeviri katmanı sunar.
 *
 * Strateji (sırasıyla):
 *   1. EXACT_MATCH_DICTIONARY  — bilinen sabit metinler için tam eşleşme
 *   2. PATTERN_RULES           — sayı + birim içeren dinamik metinler (regex)
 *   3. partialKeywordMatch     — bilinmeyen metinde anahtar kelime varsa kategori bazlı yaklaşık çeviri
 *   4. Title Case fallback     — son çare; dev modda warn ile loglanır
 *
 * Eklenti yaparken: önce metni `normalize()` ile karşılaştır, sonra uygun katmana ekle.
 */

// ============================================================================
// 1. NORMALIZE
// ============================================================================

function normalize(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;]+$/g, '')
    .replace(/\s*\/\s*/g, ' / ');
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((w) =>
      w.length > 0 ? w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1) : w,
    )
    .join(' ');
}

// ============================================================================
// 2. KATEGORİ KODLARI (tek merkezi map)
// ============================================================================

const CATEGORY_MAP: Record<string, string> = {
  // Bagaj
  BAGGAGE: 'BAGAJ',
  BG: 'BAGAJ',
  CHECKED_BAGGAGE: 'BAGAJ',
  CB: 'BAGAJ',

  // El bagajı
  CABIN_BAGGAGE: 'EL BAGAJI',
  CARRY_ON: 'EL BAGAJI',
  CY: 'EL BAGAJI',
  HAND_BAGGAGE: 'EL BAGAJI',

  // Değişiklik
  CHANGE: 'DEĞİŞİKLİK',
  VC: 'DEĞİŞİKLİK',
  CE: 'DEĞİŞİKLİK',
  VOLUNTARY_CHANGE: 'DEĞİŞİKLİK',
  DEGISIKLIK: 'DEĞİŞİKLİK',

  // İade
  REFUND: 'İADE',
  VR: 'İADE',
  RE: 'İADE',
  VOLUNTARY_REFUND: 'İADE',
  IADE: 'İADE',

  // Koltuk
  SEAT: 'KOLTUK',
  SE: 'KOLTUK',
  SA: 'KOLTUK',
  SEAT_SELECTION: 'KOLTUK',
  KOLTUK: 'KOLTUK',

  // Premium koltuk / Business Features
  BF: 'PREMIUM KOLTUK',
  BUSINESS_FEATURES: 'PREMIUM KOLTUK',
  PREMIUM_SEAT: 'PREMIUM KOLTUK',

  // İkram
  MEAL: 'İKRAM',
  ML: 'İKRAM',
  CATERING: 'İKRAM',
  IKRAM: 'İKRAM',

  // Mil
  MILES: 'MİL KAZANIMI',
  MILEAGE: 'MİL KAZANIMI',
  FF: 'MİL KAZANIMI',
  FFP: 'MİL KAZANIMI',
  MI: 'MİL KAZANIMI',
  MESAFE: 'MİL KAZANIMI',
  MIL_KAZANIMI: 'MİL KAZANIMI',

  // Lounge
  LOUNGE: 'LOUNGE',
  LG: 'LOUNGE',

  // İnternet / Mesaj / Eğlence
  IE: 'İNTERNET / MESAJ',
  INTERNET: 'İNTERNET / MESAJ',
  WIFI: 'İNTERNET / MESAJ',
  IFE: 'İNTERNET / MESAJ',
  ENTERTAINMENT: 'İNTERNET / MESAJ',
  MESSAGING: 'İNTERNET / MESAJ',

  // Öncelikli işlemler
  TS: 'ÖNCELİKLİ İŞLEMLER',
  PR: 'ÖNCELİKLİ İŞLEMLER',
  PRIORITY: 'ÖNCELİKLİ İŞLEMLER',
  PRIORITY_SERVICES: 'ÖNCELİKLİ İŞLEMLER',
  TIER_SERVICES: 'ÖNCELİKLİ İŞLEMLER',
  ONCELIKLI: 'ÖNCELİKLİ İŞLEMLER',

  // Aynı gün
  SB: 'AYNI GÜN İŞLEM',
  SAMEDAY: 'AYNI GÜN İŞLEM',

  // Üst sınıf yükseltme
  UP: 'ÜST SINIF YÜKSELTME',
  UPGRADE: 'ÜST SINIF YÜKSELTME',
  CLASS_UPGRADE: 'ÜST SINIF YÜKSELTME',
  UST_SINIF: 'ÜST SINIF YÜKSELTME',

  // Karbon nötrleme
  CO: 'KARBON AYAK İZİ',
  CARBON: 'KARBON AYAK İZİ',
  CARBON_OFFSET: 'KARBON AYAK İZİ',
  SUSTAINABILITY: 'KARBON AYAK İZİ',

  // Öncelikli biniş
  PB: 'ÖNCELİKLİ BİNİŞ',
  PRIORITY_BOARDING: 'ÖNCELİKLİ BİNİŞ',

  // Hızlı geçiş
  FAST_TRACK: 'HIZLI GEÇİŞ',
  FT: 'HIZLI GEÇİŞ',

  // Diğer
  OTHER: 'DİĞER',
};

export function translateCategory(code: string | null | undefined): string {
  if (!code) return '';
  const normalized = normalize(code).replace(/\s+/g, '_');
  return CATEGORY_MAP[normalized] ?? toTitleCase(code);
}

// ============================================================================
// 3. REGEX PATTERN MATCHERS (dinamik metinler)
// ============================================================================

interface PatternRule {
  pattern: RegExp;
  transform: (match: RegExpMatchArray) => string;
  description: string;
}

const ORDINAL_TR = ['', 'Birinci', 'İkinci', 'Üçüncü', 'Dördüncü', 'Beşinci'];

const PATTERN_RULES: PatternRule[] = [
  // ===== BAGAJ (CHECKED) =====

  // "1 Checked Bag Up To 32kg Each" / "3 Checked Bags Up To 32kg Each"
  {
    pattern: /^(\d+)\s+CHECKED\s+BAGS?\s+UP\s+TO\s+(\d+)\s*KGS?(\s+EACH)?$/,
    transform: (m) => {
      const [, pieces, kg] = m;
      return pieces === '1'
        ? `${kg} kg'a kadar ${pieces} adet bagaj`
        : `${pieces} adet bagaj (her biri ${kg} kg'a kadar)`;
    },
    description: 'Checked bag with weight limit',
  },

  // "1st Bag Upto50lb23kg 62in158cm" (AA / Delta formatı)
  {
    pattern: /^(\d+)(?:ST|ND|RD|TH)\s+BAG\s+UPTO\s*(\d+)\s*LB\s*(\d+)\s*KG\s+(\d+)\s*IN\s*(\d+)\s*CM$/,
    transform: (m) => {
      const [, ordinal, , kg, , cm] = m;
      const ordinalTr = ORDINAL_TR[Number(ordinal)] ?? `${ordinal}.`;
      return `${ordinalTr} bagaj (${kg} kg / ${cm} cm'e kadar)`;
    },
    description: 'Ordinal bag with lb/kg/in/cm',
  },

  // "Checked Bag 2pc Of 23kgs 158cm" (KLM / Amadeus formatı)
  {
    pattern: /^CHECKED\s+BAG\s+(\d+)\s*PCS?\s+OF\s+(\d+)\s*KGS?\s+(\d+)\s*CM$/,
    transform: (m) => {
      const [, pieces, kg, cm] = m;
      return `${pieces} adet ${kg} kg / ${cm} cm bagaj`;
    },
    description: 'KLM checked bag',
  },

  // "30 KG CHECKED BAGGAGE" / "30 KG BAGGAGE ALLOWANCE" / "30 KG BAGGAGE"
  {
    pattern: /^(\d+)\s*KGS?\s+(?:CHECKED\s+)?BAGGAGE(?:\s+ALLOWANCE)?$/,
    transform: (m) => `${m[1]} kg bagaj hakkı`,
    description: 'Simple kg baggage',
  },

  // "1X15 KG BAGGAGE ALLOWANCE" / "2x23 KG BAGGAGE"
  {
    pattern: /^(\d+)\s*X\s*(\d+)\s*KGS?\s+(?:CHECKED\s+)?BAGGAGE(?:\s+ALLOWANCE)?$/,
    transform: (m) => {
      const [, pieces, kg] = m;
      return pieces === '1'
        ? `${kg} kg bagaj`
        : `${pieces} parça x ${kg} kg bagaj`;
    },
    description: 'Multiplied kg baggage (THY v2)',
  },

  // "1 PIECE OF 23KG" / "2 PIECES OF 32KGS"
  {
    pattern: /^(\d+)\s+PIECES?\s+OF\s+(\d+)\s*KGS?$/,
    transform: (m) => {
      const [, pieces, kg] = m;
      return pieces === '1' ? `${kg} kg bagaj` : `${pieces} parça x ${kg} kg bagaj`;
    },
    description: 'Piece of kg baggage (international)',
  },

  // "1 PIECE BAGGAGE" / "2 PIECES BAGGAGE"
  {
    pattern: /^(\d+)\s+PIECES?\s+BAGGAGE$/,
    transform: (m) => `${m[1]} parça bagaj`,
    description: 'Piece concept baggage',
  },

  // "1PC X 23KG" / "2 PC 32 KG"
  {
    pattern: /^(\d+)\s*PCS?\s*(?:X|OF)?\s*(\d+)\s*KGS?$/,
    transform: (m) => {
      const [, pieces, kg] = m;
      return pieces === '1' ? `${kg} kg bagaj` : `${pieces} parça x ${kg} kg bagaj`;
    },
    description: 'PC abbreviation baggage',
  },

  // ===== EL BAGAJI =====

  // "1 Cabin Bag Up To 8kg" / "2 Cabin Bags Up To 8kg"
  {
    pattern: /^(\d+)\s+CABIN\s+BAGS?\s+UP\s+TO\s+(\d+)\s*KGS?$/,
    transform: (m) => {
      const [, pieces, kg] = m;
      return pieces === '1'
        ? `${kg} kg'a kadar ${pieces} adet el bagajı`
        : `${pieces} adet el bagajı (her biri ${kg} kg'a kadar)`;
    },
    description: 'Cabin bag with limit',
  },

  // "Cabin Baggage 12kg 2pc 115cm" (KLM formatı)
  {
    pattern: /^CABIN\s+BAGGAGE\s+(\d+)\s*KG\s+(\d+)\s*PCS?\s+(\d+)\s*CM$/,
    transform: (m) => {
      const [, kg, pieces, cm] = m;
      return `${pieces} adet ${kg} kg / ${cm} cm el bagajı`;
    },
    description: 'KLM cabin baggage',
  },

  // "1 PIECE X 8 KG CABIN BAGGAGE" (THY eski format)
  {
    pattern: /^(\d+)\s+PIECES?\s*X\s*(\d+)\s*KG\s+CABIN\s+BAGGAGE$/,
    transform: (m) => `${m[1]} adet ${m[2]} kg el bagajı`,
    description: 'THY old cabin format',
  },

  // "8 KG CABIN BAGGAGE"
  {
    pattern: /^(\d+)\s*KG\s+CABIN\s+BAGGAGE$/,
    transform: (m) => `${m[1]} kg el bagajı`,
    description: 'Simple cabin kg',
  },

  // "1X8 KG CABIN BAGGAGE" / "2x8 KG CABIN BAGGAGE"
  {
    pattern: /^(\d+)\s*X\s*(\d+)\s*KGS?\s+CABIN\s+BAGGAGE$/,
    transform: (m) => {
      const [, pieces, kg] = m;
      return pieces === '1'
        ? `${kg} kg el bagajı`
        : `${pieces} parça x ${kg} kg el bagajı`;
    },
    description: 'Multiplied cabin baggage (THY v2)',
  },

  // "1 PIECE OF 8KG CABIN BAGGAGE"
  {
    pattern: /^(\d+)\s+PIECES?\s+OF\s+(\d+)\s*KGS?\s+CABIN\s+BAGGAGE$/,
    transform: (m) => {
      const [, pieces, kg] = m;
      return pieces === '1' ? `${kg} kg el bagajı` : `${pieces} parça x ${kg} kg el bagajı`;
    },
    description: 'Piece-of-kg cabin baggage',
  },

  // ===== PEGASUS / AJET compact format =====
  // "HBAG8" / "HBAG10" — hand bag with kg
  {
    pattern: /^HBAG\s*(\d+)$/,
    transform: (m) => `${m[1]} kg el bagajı`,
    description: 'Compact hand bag (Pegasus/AJet)',
  },

  // "CHECKEDBAG20" / "CHECKEDBAG25" / "CHECKED BAG 30"
  {
    pattern: /^CHECKED\s*BAG\s*(\d+)$/,
    transform: (m) => `${m[1]} kg bagaj hakkı`,
    description: 'Compact checked bag (Pegasus/AJet)',
  },

  // "CBAG20" — kısaltma varyantı
  {
    pattern: /^CBAG\s*(\d+)$/,
    transform: (m) => `${m[1]} kg bagaj hakkı`,
    description: 'Compact CBAG shorthand',
  },

  // ===== MİL =====

  // "110 Percent Miles Earned" / "25 Percent Extra Miles" / "100 PERCENT MILES"
  {
    pattern: /^(\d+)\s+PERCENT\s+(EXTRA\s+)?MILES(?:\s+EARNED)?$/,
    transform: (m) => {
      const [, percent, extra] = m;
      return extra ? `%${percent} ekstra mil` : `%${percent} mil kazanımı`;
    },
    description: 'Percent miles',
  },

  // ===== ZAMAN BAZLI DEĞİŞİKLİK / İADE (THY ve EN) =====

  // "CHANGE MORE THAN 12 HOURS BEFORE DEPARTURE"
  {
    pattern: /^(CHANGE|REFUND)\s+(MORE|LESS)\s+THAN\s+(\d+)\s+HOURS?\s+BEFORE\s+DEPARTURE$/,
    transform: (m) => {
      const [, action, direction, hours] = m;
      const actionTr = action === 'CHANGE' ? 'değişiklik' : 'iade';
      const directionTr =
        direction === 'LESS'
          ? `Kalkışa ${hours} saatten az kala`
          : `Kalkışa ${hours} saatten fazla varken`;
      return `${directionTr} ${actionTr}`;
    },
    description: 'Time-windowed change/refund',
  },

  // "NONCHANGEABLE LESS THAN 1 HOUR" benzeri eski format
  {
    pattern: /^(NONCHANGEABLE|CHANGEABLE|CHANGE\s+WITH\s+PENALTY|NONREFUNDABLE|REFUNDABLE|REFUND\s+WITH\s+PENALTY)\s+(LESS|MORE)\s+THAN\s+(\d+)\s+HOURS?$/,
    transform: (m) => {
      const action = m[1].replace(/\s+/g, ' ');
      const direction = m[2];
      const hours = m[3];
      const actionMap: Record<string, string> = {
        NONCHANGEABLE: 'değiştirilemez',
        CHANGEABLE: 'değiştirilebilir',
        'CHANGE WITH PENALTY': 'ücretli değişiklik',
        NONREFUNDABLE: 'iade edilemez',
        REFUNDABLE: 'iade edilebilir',
        'REFUND WITH PENALTY': 'ücretli iade',
      };
      const actionTr = actionMap[action] ?? action.toLowerCase();
      const directionTr =
        direction === 'LESS'
          ? `Kalkışa ${hours} saatten az süre kala`
          : `Kalkışa ${hours} saatten fazla süre varken`;
      return `${directionTr} ${actionTr}`;
    },
    description: 'Legacy timed rule',
  },
];

// ============================================================================
// 4. EXACT MATCH DICTIONARY (sabit metinler)
// ============================================================================

const EXACT_MATCH_DICTIONARY: Record<string, string> = {
  // ===== BAGAJ DİĞER =====
  'PERSONAL ITEM': 'Kişisel eşya',
  'NO CHECKED BAGGAGE': 'Bagaj hakkı yok',
  'NO CABIN BAGGAGE': 'El bagajı yok',
  'NO BAGGAGE ALLOWANCE': 'Bagaj hakkı yok',
  // Compact format (Pegasus/AJet) — kg bilgisi yok, jenerik
  BAGAJ: 'Bagaj hakkı',
  HBAG: 'El bagajı',
  CABINBAG: 'El bagajı',
  CHECKEDBAG: 'Bagaj hakkı',

  // ===== DEĞİŞİKLİK =====
  'CHANGE BEFORE DEPARTURE': 'Kalkıştan önce değişiklik',
  'CHANGE AFTER DEPARTURE': 'Kalkıştan sonra değişiklik',
  'CHANGEABLE TICKET': 'Değiştirilebilir bilet',
  'NON-CHANGEABLE TICKET': 'Değiştirilemez bilet',
  'NON CHANGEABLE TICKET': 'Değiştirilemez bilet',
  'CHANGE WITHOUT PENALTY': 'Ücretsiz değişiklik',
  'CHANGE WITH PENALTY': 'Ücretli değişiklik',
  // BiletBank zaten Türkçe gönderiyor — idempotent check'i geçmemesi için normalize çıktısına da ekle
  'CEZALI DEĞIŞIKLIK': 'Ücretli değişiklik',
  'CEZALI DEGISIKLIK': 'Ücretli değişiklik',
  'CEZALİ DEĞİŞİKLİK': 'Ücretli değişiklik',
  'NO CHANGE': 'Değişiklik yapılamaz',
  'FREE CHANGE': 'Ücretsiz değişiklik',
  NONCHANGEABLE: 'Değiştirilemez',
  CHANGEABLE: 'Değiştirilebilir',

  // ===== İADE =====
  'REFUND BEFORE DEPARTURE': 'Kalkıştan önce iade',
  'REFUND AFTER DEPARTURE': 'Kalkıştan sonra iade',
  'REFUNDABLE TICKET': 'İade edilebilir bilet',
  'NON-REFUNDABLE TICKET': 'İade edilemez bilet',
  'NON REFUNDABLE TICKET': 'İade edilemez bilet',
  'REFUND WITHOUT PENALTY': 'Ücretsiz iade',
  'REFUND WITH PENALTY': 'Ücretli iade',
  // BiletBank Türkçe formu
  'CEZALI IADE': 'Ücretli iade',
  'CEZALI İADE': 'Ücretli iade',
  'CEZALİ IADE': 'Ücretli iade',
  'CEZALİ İADE': 'Ücretli iade',
  'NO REFUND': 'İade yapılamaz',
  'FREE REFUND': 'Ücretsiz iade',
  NONREFUNDABLE: 'İade edilemez',
  REFUNDABLE: 'İade edilebilir',

  // ===== KOLTUK =====
  // Compact format (Pegasus/AJet): "Standardseat" → "STANDARDSEAT"
  STANDARDSEAT: 'Standart koltuk seçimi',
  PREFERREDSEAT: 'Tercihli koltuk seçimi',
  FRONTSEAT: 'Ön koltuk seçimi',
  PREMIUMSEAT: 'Premium koltuk seçimi',
  EXITROWSEAT: 'Acil çıkış sırası koltuğu',
  EXTRALEGROOMSEAT: 'Geniş bacak mesafeli koltuk',
  'STANDARD SEAT SELECTION': 'Standart koltuk seçimi',
  'STANDARD SEAT RESERVATION': 'Standart koltuk rezervasyonu',
  'PREFERRED SEAT SELECTION': 'Tercihli koltuk seçimi',
  'PREFERRED SEAT RESERVATION': 'Tercihli koltuk rezervasyonu',
  'FRONT SEAT SELECTION': 'Ön koltuk seçimi',
  'PREMIUM SEAT SELECTION': 'Premium koltuk seçimi',
  'EXIT ROW SEAT': 'Acil çıkış sırası koltuğu',
  'EXIT ROW SEAT SELECTION': 'Acil çıkış sırası koltuk seçimi',
  'FREE SEAT SELECTION': 'Ücretsiz koltuk seçimi',
  'PAID SEAT SELECTION': 'Ücretli koltuk seçimi',
  'EXTRA LEGROOM SEAT RESERVATION': 'Geniş bacak mesafeli koltuk rezervasyonu',
  'EXTRA LEGROOM SEAT': 'Geniş bacak mesafeli koltuk',
  'SEAT SELECTION': 'Koltuk seçimi',
  'KOLTUK SECIMI': 'Koltuk seçimi',

  // ===== PREMIUM KOLTUK (BF kategorisi) =====
  'FIRST CLASS SUITE PLUS': 'First Class Suite Plus',
  'FIRST CLASS SUITE': 'First Class Suite',
  'ECONOMY LEGROOM SEAT': 'Ekonomi geniş bacak mesafeli koltuk',
  'BUSINESS EXTRA SPACE SEAT': 'Business geniş koltuk',
  'BUSINESS SUITE': 'Business Suite',
  'BUSINESS PRIVACY SEAT': 'Business özel koltuk',
  'BUSINESS EXTRA LONG BED': 'Business yatak koltuk',
  'BUSINESS FLAT BED': 'Business yatay yatak',

  // ===== İKRAM =====
  'MEAL SERVICE': 'İkram servisi',
  'NO MEAL SERVICE': 'İkram yok',
  'COMPLIMENTARY FOOD AND BEV': 'Ücretsiz yiyecek ve içecek',
  'COMPLIMENTARY FOOD AND BEVERAGE': 'Ücretsiz yiyecek ve içecek',
  'CATERING ON INTERCONT FLTS': 'Kıtalararası uçuşlarda ikram',
  'CATERING ON INTERCONTINENTAL FLIGHTS': 'Kıtalararası uçuşlarda ikram',
  'CATERING ON EUROPE FLTS': 'Avrupa uçuşlarında ikram',
  'CATERING ON EUROPE FLIGHTS': 'Avrupa uçuşlarında ikram',
  SNACK: 'Atıştırmalık',
  BEVERAGE: 'İçecek',
  'HOT MEAL': 'Sıcak yemek',
  'COLD MEAL': 'Soğuk yemek',
  'PREMIUM MEAL SERVICE': 'Premium ikram servisi',
  'ALCOHOLIC BEVERAGE': 'Alkollü içecek',
  'NON-ALCOHOLIC BEVERAGE': 'Alkolsüz içecek',
  'NON ALCOHOLIC BEVERAGE': 'Alkolsüz içecek',
  MEAL: 'İkram',
  'FREE MEAL': 'Ücretsiz ikram',
  // Compact format (Pegasus/AJet)
  SANDWICH: 'Sandviç ikramı',
  SANDVIC: 'Sandviç ikramı',
  COFFEE: 'Kahve ikramı',
  TEA: 'Çay ikramı',

  // ===== LOUNGE =====
  'LOUNGE ACCESS': 'Lounge erişimi',
  'LOUNGE ERISIMI': 'Lounge erişimi',
  'LOUNGE USE IF AVAILABLE': 'Mümkünse lounge kullanımı',
  'NO LOUNGE ACCESS': 'Lounge erişimi yok',

  // ===== MİL =====
  'MILEAGE ACCRUAL': 'Mil kazanımı',
  'MIL KAZANIMI': 'Mil kazanımı',
  'NO MILEAGE ACCRUAL': 'Mil kazanımı yok',
  'MILES EARNING': 'Mil kazanımı',
  'STANDARD MILES': 'Standart mil kazanımı',
  MILES: 'Mil kazanımı',
  'NO MILES': 'Mil kazanımı yok',

  // ===== İNTERNET / MESAJ / EĞLENCE =====
  'ONLINE MESSAGE RIGHT': 'Online mesaj hakkı',
  'INTERNET PACKAGE RIGHT': 'İnternet paketi hakkı',
  'WIFI ACCESS': 'Wi-Fi erişimi',
  'WIFI SUBJECT TO ONBOARD AVAIL': 'Uçuşta müsaitse Wi-Fi',
  'WIFI SUBJECT TO ONBOARD AVAILABILITY': 'Uçuşta müsaitse Wi-Fi',
  'IN FLIGHT ENTERTAINMENT': 'Uçuş içi eğlence sistemi',
  'IN-FLIGHT ENTERTAINMENT': 'Uçuş içi eğlence sistemi',
  'MAGAZINES / NEWSPAPER': 'Dergi / gazete',
  'MAGAZINES NEWSPAPER': 'Dergi / gazete',
  NEWSPAPER: 'Gazete',
  MAGAZINES: 'Dergi',

  // ===== ÖNCELİKLİ İŞLEMLER =====
  'PRIORITY BAGGAGE': 'Öncelikli bagaj teslimi',
  'PRIORITY BAGGAGE HANDLING': 'Öncelikli bagaj teslimi',
  'ONCELIKLI BAGAJ TESLIMI': 'Öncelikli bagaj teslimi',
  'PRIORITY CHECK IN': 'Öncelikli check-in',
  'PRIORITY CHECK-IN': 'Öncelikli check-in',
  'PRIORITY CHECKIN': 'Öncelikli check-in',
  'ONCELIKLI CHECK IN': 'Öncelikli check-in',
  'ONCELIKLI CHECK-IN': 'Öncelikli check-in',
  'PRIORITY SECURITY': 'Öncelikli güvenlik kontrolü',
  'ONCELIKLI GUVENLIK KONTROLU': 'Öncelikli güvenlik kontrolü',
  'PRIORITY BOARDING': 'Öncelikli biniş',
  'ONCELIKLI BINIS': 'Öncelikli biniş',
  'PRIORITY LANE': 'Öncelikli geçiş bandı',
  'FAST TRACK': 'Hızlı geçiş (Fast Track)',
  'FAST TRACK IF AVAILABLE': 'Mümkünse hızlı geçiş (Fast Track)',

  // ===== ÜST SINIF YÜKSELTME =====
  'UPGRADE ELIGIBILITY': 'Üst sınıfa yükseltme hakkı',
  'UST SINIFA YUKSELTME HAKKI': 'Üst sınıfa yükseltme hakkı',
  'UPGRADE AVAILABLE': 'Üst sınıfa yükseltme mümkün',
  'NO UPGRADE': 'Üst sınıfa yükseltme yok',
  'COMPLIMENTARY UPGRADE': 'Ücretsiz üst sınıf yükseltme',

  // ===== AYNI GÜN =====
  'SAMEDAY CHANGE TO EARLY FLIGHT': 'Aynı gün erken uçuşa değişiklik',
  'SAME DAY CHANGE TO EARLY FLIGHT': 'Aynı gün erken uçuşa değişiklik',
  'SAMEDAY CHANGE': 'Aynı gün uçuş değişikliği',
  'SAME DAY CHANGE': 'Aynı gün uçuş değişikliği',

  // ===== KARBON =====
  'CARBON OFFSET': 'Karbon ayak izi nötrleme',
  'CARBON NEUTRAL': 'Karbon nötr',
  'SUSTAINABLE FLIGHT': 'Sürdürülebilir uçuş',

  // ===== ZAMAN BAZLI KURALLAR (THY pattern'leri zaten Türkçe gelir, idempotent olmalı) =====
  'KALKISA 12 SAATTEN FAZLA SURE VARKEN DEGISTIRILEBILIR': 'Kalkışa 12 saatten fazla süre varken değiştirilebilir',
  'KALKISA 12 SAATTEN AZ SURE KALA DEGISTIRILEBILIR': 'Kalkışa 12 saatten az süre kala değiştirilebilir',
  'KALKISA 1 SAATTEN AZ SURE KALA DEGISTIRILEMEZ': 'Kalkışa 1 saatten az süre kala değiştirilemez',
};

// ============================================================================
// 5. PARTIAL KEYWORD MATCH (son çare semantic eşleme)
// ============================================================================

const KEYWORD_FALLBACKS: Array<[RegExp, string]> = [
  [/\bPRIORITY\b/, 'Öncelikli hizmet'],
  [/\bLOUNGE\b/, 'Lounge erişimi'],
  [/\bUPGRADE\b/, 'Üst sınıf yükseltme'],
  [/\bWI[-\s]?FI\b/, 'Wi-Fi erişimi'],
  [/\bCARBON\b/, 'Karbon nötrleme'],
  [/\bREFUND\b/, 'İade'],
  [/\bCHANGE\b/, 'Değişiklik'],
  [/\bMEAL\b|\bCATERING\b/, 'İkram'],
  [/\bCABIN\s+BAG/, 'El bagajı'],
  [/\bBAGGAGE\b|\bBAG\b/, 'Bagaj'],
  [/\bSEAT\b/, 'Koltuk'],
  [/\bMILES?\b|\bMILEAGE\b/, 'Mil kazanımı'],
  [/\bENTERTAINMENT\b|\bIFE\b/, 'Uçuş içi eğlence'],
];

function partialKeywordMatch(normalized: string): string | null {
  for (const [kw, fallback] of KEYWORD_FALLBACKS) {
    if (kw.test(normalized)) return fallback;
  }
  return null;
}

// ============================================================================
// 6. ANA FONKSİYON — translateFeature
// ============================================================================

function isLikelyAlreadyTurkish(text: string): boolean {
  // Türkçe karakter içeren ve sadece bilinen İngilizce token'larla başlamayan metin
  return /[ığüşöçİĞÜŞÖÇ]/.test(text);
}

export function translateFeature(rawText: string | null | undefined): string {
  if (!rawText) return '';
  const trimmed = String(rawText).trim();
  if (!trimmed) return '';

  const normalized = normalize(trimmed);

  // 1. Tam eşleşme sözlüğü
  const exact = EXACT_MATCH_DICTIONARY[normalized];
  if (exact) return exact;

  // 2. Regex pattern'leri
  for (const rule of PATTERN_RULES) {
    const match = normalized.match(rule.pattern);
    if (match) return rule.transform(match);
  }

  // 3. Zaten Türkçe görünen metinleri olduğu gibi geri ver (idempotent)
  if (isLikelyAlreadyTurkish(trimmed)) return trimmed;

  // 4. Keyword-based fallback
  const partial = partialKeywordMatch(normalized);
  if (partial) {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        `[farePackageParser] PARTIAL → "${rawText}" → "${partial}"\n` +
          `  Tam çeviri için EXACT_MATCH_DICTIONARY veya PATTERN_RULES'a ekleyin.`,
      );
    }
    return partial;
  }

  // 5. Son çare: Title Case + warn
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(
      `[farePackageParser] ÇEVİRİ EKSİK → "${rawText}"\n` +
        `  Normalized: "${normalized}"\n` +
        `  Lütfen EXACT_MATCH_DICTIONARY veya PATTERN_RULES'a ekleyin.`,
    );
  }
  return toTitleCase(trimmed);
}

// ============================================================================
// 7. BACK-COMPAT EXPORTS (eski kullanımlar)
// ============================================================================

export const translateFarePackageFeature = translateFeature;
export const translateFarePackageCategory = translateCategory;

// ============================================================================
// 8. DEV ARACI — debugTranslate
// ============================================================================

/**
 * Verilen metin dizisini tek tek çevirip konsola tablo olarak basar.
 * QA sırasında çeviri kapsamasını hızlıca yakalamak için kullanılır.
 * Sadece development modunda çalışır.
 */
export function debugTranslate(texts: string[]): void {
  if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'development') return;

  // eslint-disable-next-line no-console
  console.table(
    texts.map((t) => {
      const norm = normalize(t);
      let matched: 'EXACT' | 'PATTERN' | 'PARTIAL' | 'FALLBACK';
      if (EXACT_MATCH_DICTIONARY[norm]) matched = 'EXACT';
      else if (PATTERN_RULES.some((r) => norm.match(r.pattern))) matched = 'PATTERN';
      else if (partialKeywordMatch(norm)) matched = 'PARTIAL';
      else matched = 'FALLBACK';

      return {
        original: t,
        translated: translateFeature(t),
        matched,
      };
    }),
  );
}
