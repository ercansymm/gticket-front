import { z } from 'zod';

export const flightSearchSchema = z.object({
  origin: z.string().min(2).max(10).trim().regex(/^[A-Z]{2,5}$/i, 'Geçersiz havalimanı kodu'),
  destination: z.string().min(2).max(10).trim().regex(/^[A-Z]{2,5}$/i, 'Geçersiz havalimanı kodu'),
  originCountryCode: z.string().min(2).max(5).optional().default('TR'),
  destinationCountryCode: z.string().min(2).max(5).optional().default('TR'),
  originIsCity: z.boolean().optional().default(false),
  destinationIsCity: z.boolean().optional().default(false),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  flightType: z.enum(['OW', 'RT', 'MP']).optional().default('OW'),
  flightClass: z.enum(['Economy', 'Business', 'First', 'Comfort']).optional().default('Economy'),
  adultCount: z.number().int().min(1).max(9).optional().default(1),
  childCount: z.number().int().min(0).max(9).optional().default(0),
  infantCount: z.number().int().min(0).max(4).optional().default(0),
  directFlightsOnly: z.boolean().optional().default(false),
  refundablesOnly: z.boolean().optional().default(false),
  searchTimeoutMilliseconds: z.number().int().min(0).max(60000).optional().default(0),
  preferredAirlines: z.array(z.string().regex(/^[A-Z0-9]{2}$/i)).max(10).nullable().optional(),
  searchReason: z.enum(['SearchOnly', 'SearchAndBook']).optional().default('SearchAndBook'),
}).refine(data => (data.adultCount ?? 1) + (data.childCount ?? 0) <= 9, {
  message: 'Toplam yolcu 9\'u geçemez',
}).refine(data => (data.infantCount ?? 0) <= (data.adultCount ?? 1), {
  message: 'Bebek sayısı yetişkin sayısını geçemez',
}).refine(data => {
  if (data.flightType === 'RT' && !data.returnDate) return false;
  return true;
}, {
  message: 'Gidiş-dönüş aramada dönüş tarihi zorunlu',
});

// İstemciden gelen allocate request — session bilgisi YOK
export const flightAllocateClientSchema = z.object({
  searchId: z.string().min(1).max(100),
  productId: z.string().min(1).max(200),
});

// İstemciden gelen remove-product request
export const removeProductClientSchema = z.object({
  searchId: z.string().min(1).max(100),
  productId: z.string().min(1).max(200),
});

// İstemciden gelen make-payment request
// paymentType: 'RunningAccount' → kart bilgisi gerekmez, 'CreditCard' → kart bilgisi zorunlu
export const makePaymentClientSchema = z.discriminatedUnion('paymentType', [
  z.object({
    paymentType: z.literal('RunningAccount'),
    searchId: z.string().min(1).max(100),
  }),
  z.object({
    paymentType: z.literal('CreditCard'),
    searchId: z.string().min(1).max(100),
    cardHolderName: z.string().min(3).max(100).trim().regex(/^[A-ZÇĞİÖŞÜa-zçğıöşü\s]+$/, 'Geçersiz kart sahibi adı'),
    cardNumber: z.string().regex(/^\d{15,16}$/, 'Geçersiz kart numarası'),
    expireMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Geçersiz ay'),
    expireYear: z.string().regex(/^\d{2,4}$/, 'Geçersiz yıl'),
    cvv: z.string().regex(/^\d{3,4}$/, 'Geçersiz CVV'),
    installmentCount: z.number().int().min(1).max(12).optional().default(1),
  }),
]);

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
export type SearchIdOnlyInput = z.infer<typeof searchIdOnlySchema>;
