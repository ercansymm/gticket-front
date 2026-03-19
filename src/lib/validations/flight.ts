import { z } from 'zod';

export const flightSearchSchema = z.object({
  origin: z.string().min(2).max(10).trim(),
  destination: z.string().min(2).max(10).trim(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçersiz tarih formatı'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  passengers: z.object({
    adult: z.number().int().min(1).max(9),
    child: z.number().int().min(0).max(9).optional(),
    infant: z.number().int().min(0).max(4).optional(),
  }),
  cabinClass: z.enum(['ECONOMY', 'BUSINESS', 'FIRST']).optional(),
  tripType: z.enum(['one-way', 'round-trip']).optional(),
});

export const flightAllocateSchema = z.object({
  flightId: z.string().min(1),
  sessionId: z.string().min(1),
});

export type FlightSearchInput = z.infer<typeof flightSearchSchema>;
export type FlightAllocateInput = z.infer<typeof flightAllocateSchema>;
