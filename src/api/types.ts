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
  AllocateClientRequest,
  AllocateResponse,
  AirBooking,
  BookingItem,
  AllocatePassenger,
  PriceSummary,
  FlightSessionData,
  FlightSortRequest,
  FlightFilterRequest,
  FlightFilterResponse,
  BrandedFareItem,
  FreeBaggageAllowance,
  AllocateSegment,
  AllocateBrandedFareItem,
  AllocateBrandedItem,
  AllocateBaggageAllowance,
  PriceItem,
  FlightSortBy,
  FlightFilters,
  // Payment & finalize
  RemoveProductClientRequest,
  RemoveProductResponse,
  MakePaymentClientRequest,
  MakePaymentResponse,
  FinalizeShoppingClientRequest,
  FinalizeShoppingResponse,
  TicketInfo,
  // Polling & detail
  PokeShoppingFileClientRequest,
  PokeShoppingFileResponse,
  ReadShoppingFileClientRequest,
  ReadShoppingFileResponse,
  ReadShoppingPassenger,
  ReadShoppingPayment,
  // Logout
  LogoutClientRequest,
  LogoutResponse,
  // Booking query
  BookingDetailResponse,
} from '../types/flight';

export type {
  UpdatePassengersClientRequest,
  UpdatePassengersResponse,
  MakePreBookingClientRequest,
  MakePreBookingResponse,
  PassengerItem,
  ContactInfo,
  PreBookingSegment,
} from '../types/booking';

export type {
  Airport,
} from '../types/lookup';
