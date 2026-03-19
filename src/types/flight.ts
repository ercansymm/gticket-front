// ========== UÇUŞ ARAMA (AirSearch) ==========

export type TripType = 'oneway' | 'roundtrip' | 'multicity';
export type CabinClass = 'economy' | 'business';

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  originCountryCode: string;
  destinationCountryCode: string;
  originIsCity: boolean;
  destinationIsCity: boolean;
  departureDate: string;
  returnDate: string | null;
  flightType: string;
  flightClass: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
  directFlightsOnly: boolean;
  refundablesOnly: boolean;
  searchTimeoutMilliseconds: number;
  preferredAirlines: string | null;
  searchReason: string;
}

export interface FlightSearchResponse {
  hasError: boolean;
  errorMessage: string | null;
  searchId: string;
  sessionId: string;
  sessionToken: string;
  flights: FlightResult[];
  filterOptions: FilterOptions;
}

export interface FlightResult {
  productId: string;
  productItemId: string | null;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  bookingProvider: string;
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  durationHours: number;
  durationMinutes: number;
  durationFormatted: string;
  equipment: string;
  baseFare: number;
  taxes: number;
  serviceFee: number;
  totalFare: number;
  currency: string;
  totalFareFormatted: string;
  isRefundable: boolean;
  isReservable: boolean;
  refundableText: string;
  fareType: string;
  bookingClass: string;
  bookingClassName: string;
  availableSeats: number;
  availableSeatsText: string;
  stopCount: number;
  isDirect: boolean;
  stopText: string;
  segments: FlightSegmentResult[];
  customerCommissionMin: number;
  customerCommissionMax: number;
  customerCommissionValue: number;
  freeBaggageAllowances: unknown[];
}

export interface FlightSegmentResult {
  sequenceNo: number;
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  durationHours: number;
  durationMinutes: number;
  durationFormatted: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  equipment: string;
  bookingClass: string;
  bookingClassName: string;
  fareType: string;
  fareTypeName: string;
  layoverMinutes: number | null;
  layoverFormatted: string | null;
}

export interface FilterOptions {
  minPrice: number;
  maxPrice: number;
  airlines: { code: string; name: string }[];
  hasDirectFlights: boolean;
  hasRefundableFlights: boolean;
  earliestDeparture: string;
  latestDeparture: string;
}

// ========== ALLOCATE ==========

export interface AllocateRequest {
  sessionId: string;
  sessionToken: string;
  productId: string;
  selectedServiceFee: number;
  searchRequest: null;
}

export interface AllocateResponse {
  hasError: boolean;
  errorMessage: string | null;
  shoppingFileId: string;
  sessionId: string;
  sessionToken: string;
  lastAllocatedProductIds: string[];
  isPriceChanged: boolean;
  currency: string;
  canBeReserved: boolean;
  airBookings: AirBooking[];
  passengers: AllocatePassenger[];
  priceSummary: PriceSummary;
}

export interface AirBooking {
  productId: string;
  pnr: string | null;
  status: string;
  currency: string;
  totalFare: number;
  baseFare: number;
  taxes: number;
  isRefundable: boolean;
  canBeReserved: boolean;
  validatingCarrier: string;
  bookingItems: BookingItem[];
  segments: FlightSegmentResult[];
}

export interface BookingItem {
  productItemId: string;
  currency: string;
  baseFare: number;
  taxes: number;
  totalFare: number;
  paxType: string;
  paxSequenceNo: number;
  paxReferenceId: string;
}

export interface AllocatePassenger {
  tempTag: string;
  sequenceNo: number;
  type: string;
}

export interface PriceSummary {
  grandTotal: number;
  totalBaseFare: number;
  totalTaxes: number;
  totalServiceFee: number;
  currency: string;
}
