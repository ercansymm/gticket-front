import { z } from 'zod';

const passengerSchema = z.object({
  firstName: z.string().min(2).max(50).trim(),
  lastName: z.string().min(2).max(50).trim(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['M', 'F']),
  nationality: z.string().length(2),
  passportNumber: z.string().max(20).optional(),
  tcKimlik: z.string().length(11).regex(/^\d+$/).optional(),
  type: z.enum(['ADULT', 'CHILD', 'INFANT']),
});

const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).max(15).regex(/^[\d+]+$/),
  firstName: z.string().min(2).max(50).trim(),
  lastName: z.string().min(2).max(50).trim(),
});

export const bookingSchema = z.object({
  flightId: z.string().min(1),
  sessionId: z.string().min(1),
  passengers: z.array(passengerSchema).min(1).max(9),
  contact: contactSchema,
});

export type BookingInput = z.infer<typeof bookingSchema>;
