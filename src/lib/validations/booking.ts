import { z } from 'zod';

const passengerItemSchema = z.object({
  paxType: z.enum(['ADT', 'CHD', 'INF']),
  sequenceNo: z.number().int().min(1).max(9),
  firstName: z.string().min(2).max(50).trim().regex(/^[A-ZÇĞİÖŞÜa-zçğıöşü\s'-]+$/, 'Geçersiz isim'),
  lastName: z.string().min(2).max(50).trim().regex(/^[A-ZÇĞİÖŞÜa-zçğıöşü\s'-]+$/, 'Geçersiz soyisim'),
  gender: z.enum(['M', 'F']),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  citizenNo: z.string().length(11).regex(/^\d{11}$/).nullable().optional(),
  passportNo: z.string().min(5).max(20).regex(/^[A-Z0-9]+$/i).nullable().optional(),
  passportCountry: z.string().length(2).regex(/^[A-Z]{2}$/i).nullable().optional(),
  passportExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  nationality: z.string().length(2).regex(/^[A-Z]{2}$/i).optional().default('TR'),
  tempTag: z.string().max(200).nullable().optional(),
  paxReferenceId: z.string().max(200).nullable().optional(),
});

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

export type UpdatePassengersClientInput = z.infer<typeof updatePassengersClientSchema>;
export type MakePreBookingClientInput = z.infer<typeof makePreBookingClientSchema>;
