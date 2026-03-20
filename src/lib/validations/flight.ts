import { z } from 'zod';

export const flightSearchSchema = z.object({
  origin: z.string().min(2).max(10).trim(),
  destination: z.string().min(2).max(10).trim(),
  originCountryCode: z.string().min(2).max(5),
  destinationCountryCode: z.string().min(2).max(5),
  originIsCity: z.boolean(),
  destinationIsCity: z.boolean(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  flightType: z.string().min(1),
  flightClass: z.string().min(1),
  adultCount: z.number().int().min(1).max(9),
  childCount: z.number().int().min(0).max(9),
  infantCount: z.number().int().min(0).max(4),
  directFlightsOnly: z.boolean(),
  refundablesOnly: z.boolean(),
  searchTimeoutMilliseconds: z.number().int().min(0),
  preferredAirlines: z.string().nullable(),
  searchReason: z.string().min(1),
});

export const flightAllocateSchema = z.object({
  sessionId: z.string().min(1),
  sessionToken: z.string().min(1),
  productId: z.string().min(1),
  selectedServiceFee: z.number().min(0),
  searchRequest: z.any().nullable(),
});

export type FlightSearchInput = z.infer<typeof flightSearchSchema>;
export type FlightAllocateInput = z.infer<typeof flightAllocateSchema>;
