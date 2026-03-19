// Re-export from centralized types — backward compatibility
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
} from '../types/common';

export type {
  TripType,
  CabinClass,
  FlightSearchRequest,
  FlightSearchResponse,
  FlightResult,
  FlightSegmentResult,
  FilterOptions,
  AllocateRequest,
  AllocateResponse,
  AirBooking,
  BookingItem,
  AllocatePassenger,
  PriceSummary,
} from '../types/flight';

export type {
  BookRequest,
  BookPassenger,
  ContactInfo,
  BookResponse,
} from '../types/booking';

export type {
  Airport,
} from '../types/lookup';
