import { z } from 'zod';

const multiCitySegmentSchema = z.object({
  origin: z.string().min(2).max(50).trim().regex(/^[A-Z]{2,5}(,[A-Z]{2,5})*$/i, 'Geçersiz havalimanı kodu'),
  destination: z.string().min(2).max(50).trim().regex(/^[A-Z]{2,5}(,[A-Z]{2,5})*$/i, 'Geçersiz havalimanı kodu'),
  originCountryCode: z.string().min(2).max(5).optional().default('TR'),
  destinationCountryCode: z.string().min(2).max(5).optional().default('TR'),
  originIsCity: z.boolean().optional().default(false),
  destinationIsCity: z.boolean().optional().default(false),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const flightSearchSchema = z.object({
  origin: z.string().min(2).max(50).trim().regex(/^[A-Z]{2,5}(,[A-Z]{2,5})*$/i, 'Geçersiz havalimanı kodu'),
  destination: z.string().min(2).max(50).trim().regex(/^[A-Z]{2,5}(,[A-Z]{2,5})*$/i, 'Geçersiz havalimanı kodu'),
  originCountryCode: z.string().min(2).max(5).optional().default('TR'),
  destinationCountryCode: z.string().min(2).max(5).optional().default('TR'),
  originIsCity: z.boolean().optional().default(false),
  destinationIsCity: z.boolean().optional().default(false),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  flightType: z.enum(['OW', 'RT', 'MP']).optional().default('OW'),
  flightClass: z.enum(['Economy', 'PremiumEconomy', 'Business', 'First']).optional().default('Economy'),
  adultCount: z.number().int().min(1).max(9).optional().default(1),
  childCount: z.number().int().min(0).max(9).optional().default(0),
  infantCount: z.number().int().min(0).max(4).optional().default(0),
  directFlightsOnly: z.boolean().optional().default(false),
  refundablesOnly: z.boolean().optional().default(false),
  searchTimeoutMilliseconds: z.number().int().min(0).max(60000).optional().default(0),
  preferredAirlines: z.array(z.string().regex(/^[A-Z0-9]{2}$/i)).max(10).nullable().optional(),
  searchReason: z.enum(['SearchOnly', 'SearchAndBook']).optional().default('SearchAndBook'),
  segments: z.array(multiCitySegmentSchema).min(2).max(6).nullable().optional(),
}).refine(data => (data.adultCount ?? 1) + (data.childCount ?? 0) <= 9, {
  message: 'Toplam yolcu 9\'u geçemez',
}).refine(data => (data.infantCount ?? 0) <= (data.adultCount ?? 1), {
  message: 'Bebek sayısı yetişkin sayısını geçemez',
}).refine(data => {
  if (data.flightType === 'RT' && !data.returnDate) return false;
  return true;
}, {
  message: 'Gidiş-dönüş aramada dönüş tarihi zorunlu',
}).refine(data => {
  if (data.flightType === 'MP' && (!data.segments || data.segments.length < 2)) return false;
  return true;
}, {
  message: 'Çoklu şehir aramasında en az 2 segment gereklidir',
});

// İstemciden gelen allocate request — session bilgisi YOK
export const flightAllocateClientSchema = z.object({
  searchId: z.string().min(1).max(100),
  productId: z.string().min(1).max(200),
  brandedFareItemId: z.string().max(200).nullish(),
  returnProductId: z.string().max(200).nullish(),
  returnBrandedFareItemId: z.string().max(200).nullish(),
  subOptionFlightIds: z.array(z.string().max(200)).max(10).nullish(),
});

// İstemciden gelen remove-product request
export const removeProductClientSchema = z.object({
  searchId: z.string().min(1).max(100),
  productId: z.string().min(1).max(200),
});

// İstemciden gelen make-payment request
// paymentType: 'CreditCard' → kart bilgisi zorunlu
export const makePaymentClientSchema = z.discriminatedUnion('paymentType', [
  z.object({
    paymentType: z.literal('CreditCard'),
    searchId: z.string().min(1).max(100),
    cardHolderName: z.string().min(3).max(100).trim().regex(/^[A-ZÇĞİÖŞÜa-zçğıöşü\s]+$/, 'Geçersiz kart sahibi adı'),
    cardNumber: z.string().regex(/^\d{15,16}$/, 'Geçersiz kart numarası'),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Geçersiz ay'),
    expiryYear: z.string().regex(/^\d{2,4}$/, 'Geçersiz yıl'),
    cvv: z.string().regex(/^\d{3,4}$/, 'Geçersiz CVV'),
    installmentOptionId: z.string().max(200).optional(),
  }),
  z.object({
    paymentType: z.literal('CreditCardDirect'),
    searchId: z.string().min(1).max(100),
    cardHolderName: z.string().min(3).max(100).trim().regex(/^[A-ZÇĞİÖŞÜa-zçğıöşü\s]+$/, 'Geçersiz kart sahibi adı'),
    cardNumber: z.string().regex(/^\d{15,16}$/, 'Geçersiz kart numarası'),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Geçersiz ay'),
    expiryYear: z.string().regex(/^\d{2,4}$/, 'Geçersiz yıl'),
    cvv: z.string().regex(/^\d{3,4}$/, 'Geçersiz CVV'),
    installmentOptionId: z.string().max(200).optional(),
  }),
]);

// İstemciden gelen retry-payment request
// Var olan booking için ödemeyi tekrar dener; session bilgisi backend'de booking'den alınır
export const retryPaymentClientSchema = z.object({
  bookingId: z.string().min(1).max(100),
  creditCard: z.object({
    cardHolderName: z.string().min(3).max(100).trim().regex(/^[A-ZÇĞİÖŞÜa-zçğıöşü\s]+$/, 'Geçersiz kart sahibi adı'),
    cardNumber: z.string().regex(/^\d{15,16}$/, 'Geçersiz kart numarası'),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Geçersiz ay'),
    expiryYear: z.string().regex(/^\d{2,4}$/, 'Geçersiz yıl'),
    cvv: z.string().regex(/^\d{3,4}$/, 'Geçersiz CVV'),
  }),
  installmentOptionId: z.string().max(200).optional(),
});

// searchId-only endpoints (finalize, poke, read, logout)
export const searchIdOnlySchema = z.object({
  searchId: z.string().min(1).max(100),
});

// Booking sorgulama (bookingId veya PNR — URL param, body yok)
export const bookingIdParamSchema = z.object({
  bookingId: z.string().min(1).max(100),
});

export const pnrParamSchema = z.object({
  pnr: z.string().min(5).max(10).regex(/^[A-Z0-9]+$/i, 'Geçersiz PNR'),
});

// İstemciden gelen cancel-booking request
export const cancelBookingClientSchema = z.object({
  searchId: z.string().min(1).max(100),
  productId: z.string().min(1).max(200),
  bookingId: z.string().max(200).optional(),
});

// Canlı booking status sorgusu
export const bookingStatusSchema = z.object({
  bookingId: z.string().min(1).max(200),
});

export type FlightSearchInput = z.infer<typeof flightSearchSchema>;
export type FlightAllocateClientInput = z.infer<typeof flightAllocateClientSchema>;
export type RemoveProductClientInput = z.infer<typeof removeProductClientSchema>;
export type MakePaymentClientInput = z.infer<typeof makePaymentClientSchema>;
export type RetryPaymentClientInput = z.infer<typeof retryPaymentClientSchema>;
export type SearchIdOnlyInput = z.infer<typeof searchIdOnlySchema>;
