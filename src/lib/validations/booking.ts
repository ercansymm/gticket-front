import { z } from 'zod';
import { isValidTCKN } from './turkish-id';

// Bugünden ileri olamaz, 120 yıldan eski olamaz.
function isValidBirthDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (d > today) return false;
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  return d >= minDate;
}

const passengerItemSchema = z.object({
  paxType: z.enum(['ADT', 'CHD', 'INF']),
  sequenceNo: z.number().int().min(1).max(9),
  firstName: z.string().min(2).max(50).trim().regex(/^[A-ZÇĞİÖŞÜa-zçğıöşü\s'-]+$/, 'Geçersiz isim'),
  lastName: z.string().min(2).max(50).trim().regex(/^[A-ZÇĞİÖŞÜa-zçğıöşü\s'-]+$/, 'Geçersiz soyisim'),
  gender: z.enum(['M', 'F']),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidBirthDate, 'Doğum tarihi gelecekte olamaz'),
  citizenNo: z.string().length(11).regex(/^\d{11}$/)
    .refine(isValidTCKN, 'Geçersiz TC kimlik numarası')
    .nullable().optional()
    .or(z.literal('')).transform(v => v || null),
  passportNo: z.string().min(5).max(20).regex(/^[A-Z0-9]+$/i).nullable().optional()
    .or(z.literal('')).transform(v => v || null),
  passportCountry: z.string().length(2).regex(/^[A-Z]{2}$/i).nullable().optional()
    .or(z.literal('')).transform(v => v || null),
  passportExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional()
    .or(z.literal('')).transform(v => v || null),
  nationality: z.string().length(2).regex(/^[A-Z]{2}$/i).optional().default('TR'),
  tempTag: z.string().max(200).nullable().optional(),
  paxReferenceId: z.string().max(200).nullable().optional(),
});

// Telefon: TR (+90 5XXXXXXXXX) veya boşluk/parantezli format kabul.
// Backend'e gönderilirken zaten +90 prefix'i ile birleştiriliyor (PassengerForm.tsx).
// Bu schema BFF tarafı validation — saldırgan koruması, daha sıkı format kullanıcı tarafında.
const contactSchema = z.object({
  email: z.string().email().max(254),
  phone: z.string().min(10).max(20).regex(/^\+?[\d\s()-]+$/),
});

// İstemciden gelen — session bilgisi YOK
export const updatePassengersClientSchema = z.object({
  searchId: z.string().min(1).max(100),
  productId: z.string().min(1).max(200),
  productItemId: z.string().min(1).max(200),
  passengers: z.array(passengerItemSchema).min(1).max(9),
  contact: contactSchema,
});

// İstemciden gelen — session bilgisi YOK
export const makePreBookingClientSchema = z.object({
  searchId: z.string().min(1).max(100),
  productId: z.string().min(1).max(200),
  brandedFareItemId: z.string().max(200).optional().default(''),
  passengers: z.array(passengerItemSchema).min(1).max(9),
  contact: contactSchema,
});

// Tek seferde updatePassengers + makePreBooking yapan combined endpoint için
export const prepareBookingClientSchema = z.object({
  searchId: z.string().min(1).max(100),
  productId: z.string().min(1).max(200),
  productItemId: z.string().min(1).max(200),
  brandedFareItemId: z.string().max(200).optional().default(''),
  passengers: z.array(passengerItemSchema).min(1).max(9),
  contact: contactSchema,
});

export type UpdatePassengersClientInput = z.infer<typeof updatePassengersClientSchema>;
export type MakePreBookingClientInput = z.infer<typeof makePreBookingClientSchema>;
export type PrepareBookingClientInput = z.infer<typeof prepareBookingClientSchema>;
