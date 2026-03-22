// ========== UÇUŞ ARAMA (AirSearch) ==========

export type TripType = 'OW' | 'RT' | 'MP';
export type CabinClass = 'Economy' | 'Business' | 'First' | 'Comfort';

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  originCountryCode?: string;
  destinationCountryCode?: string;
  originIsCity?: boolean;
  destinationIsCity?: boolean;
  departureDate: string;
  returnDate?: string | null;
  flightType?: TripType;
  flightClass?: CabinClass;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
  directFlightsOnly?: boolean;
  refundablesOnly?: boolean;
  searchTimeoutMilliseconds?: number;
  preferredAirlines?: string[] | null;
  searchReason?: 'SearchOnly' | 'SearchAndBook';
}

// İstemciye dönen güvenli response — sessionId/sessionToken YOK
export interface FlightSearchResponse {
  hasError: boolean;
  errorMessage: string | null;
  searchId: string | null;
  flights: FlightResult[];
  filterOptions: FilterOptions | null;
}

// Server-side'da kullanılan ham backend response — istemciye GİTMEZ
export interface FlightSearchBackendResponse extends FlightSearchResponse {
  sessionId: string | null;
  sessionToken: string | null;
}

export interface FlightResult {
  productId: string | null;
  productItemId: string | null;
  airlineCode: string | null;
  airlineName: string | null;
  flightNumber: string | null;
  bookingProvider: string | null;
  originCode: string | null;
  originName: string | null;
  destinationCode: string | null;
  destinationName: string | null;
  departureDate: string | null;
  departureTime: string | null;
  arrivalDate: string | null;
  arrivalTime: string | null;
  durationHours: number;
  durationMinutes: number;
  durationFormatted: string | null;
  equipment: string | null;
  baseFare: number;
  taxes: number;
  serviceFee: number;
  totalFare: number;
  currency: string | null;
  totalFareFormatted: string | null;
  isRefundable: boolean;
  isReservable: boolean;
  refundableText: string | null;
  fareType: string | null;
  bookingClass: string | null;
  bookingClassName: string | null;
  availableSeats: number;
  availableSeatsText: string | null;
  stopCount: number;
  isDirect: boolean;
  stopText: string | null;
  segments: FlightSegmentResult[];
  brandedFareItems: BrandedFareItem[];
  freeBaggageAllowances: FreeBaggageAllowance[];
}

export interface FlightSegmentResult {
  sequenceNo: number;
  originCode: string | null;
  originName: string | null;
  destinationCode: string | null;
  destinationName: string | null;
  departureDate: string | null;
  departureTime: string | null;
  arrivalDate: string | null;
  arrivalTime: string | null;
  durationHours: number;
  durationMinutes: number;
  durationFormatted: string | null;
  airlineCode: string | null;
  airlineName: string | null;
  flightNumber: string | null;
  equipment: string | null;
  bookingClass: string | null;
  bookingClassName: string | null;
  fareType: string | null;
  fareTypeName: string | null;
  layoverMinutes: number | null;
  layoverFormatted: string | null;
}

export interface FilterOptions {
  minPrice: number;
  maxPrice: number;
  airlines: AirlineFilterItem[];
  hasDirectFlights: boolean;
  hasRefundableFlights: boolean;
  earliestDeparture: string | null;
  latestDeparture: string | null;
  cabinClasses: string[];
  farePackages: string[];
}

export type FlightSortBy = 'cheapest' | 'expensive' | 'earliest' | 'latest' | 'arrival' | 'shortest' | 'stops' | 'airline';

export interface FlightFilters {
  directOnly: boolean;
  refundableOnly: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  airlineCodes: string[];
  cabinClasses: string[];
  farePackages: string[];
  departureTimeFrom: string | null;
  departureTimeTo: string | null;
}

export interface AirlineFilterItem {
  code: string | null;
  name: string | null;
}

// ========== BRANDED FARE ==========

export interface BrandedFareItem {
  brandedFareItemId: string | null;
  brandedFarePassengers: BrandedFarePassenger[];
  totalFareInfo: BrandedFareTotalInfo | null;
  brandedItems: BrandedItem[];
}

export interface BrandedFarePassenger {
  passengerCount: number;
  passengerType: string | null;
  fareComponents: FareComponent[];
  passengerFareInfo: PassengerFareInfo | null;
  policy: FarePolicy | null;
}

export interface FareComponent {
  brandId: string | null;
  bookingClass: string | null;
  cabinClass: string | null;
  fareBasisCode: string | null;
  freeBaggageAllowanceId: string | null;
  availableSeats: number;
  segmentId: string | null;
}

export interface PassengerFareInfo {
  baseFare: number;
  taxes: number;
  totalFare: number;
  currency: string | null;
  paxSequence: number;
  paxType: string | null;
}

export interface FarePolicy {
  cancellationPolicies: CancellationPolicy[];
  changePolicies: ChangePolicy[];
}

export interface CancellationPolicy {
  amount: number;
  applicability: string | null;
  minutesToDeparture: number;
  currency: string | null;
  isRefundable: boolean;
}

export interface ChangePolicy {
  amount: number;
  applicability: string | null;
  minutesToDeparture: number;
  currency: string | null;
  isChangeable: boolean;
}

export interface BrandedFareTotalInfo {
  totalFare: number;
  totalTaxes: number;
}

export interface BrandedItem {
  brandCode: string | null;
  brandId: string | null;
  brandName: string | null;
  brandedRules: BrandedRule[];
}

export interface BrandedRule {
  application: string | null;
  displayType: string | null;
  ruleDescription: string | null;
  serviceGroup: string | null;
}

export interface FreeBaggageAllowance {
  allowance: string | null;
  category: string | null;
  type: string | null;
  unit: string | null;
  paxType: string | null;
}

// ========== SORT & FILTER ==========

export interface FlightSortRequest {
  sortBy: 'price' | 'cheapest' | 'earliest' | 'latest' | 'shortest' | 'duration';
  flights: FlightResult[];
}

export interface FlightFilterRequest {
  directOnly?: boolean;
  refundableOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  airlineCodes?: string[];
  departureTimeFrom?: string;
  departureTimeTo?: string;
  flights: FlightResult[];
}

export interface FlightFilterResponse {
  flights: FlightResult[];
  filterOptions: FilterOptions;
}

// ========== SESSION (server-side only) ==========

export interface FlightSessionData {
  searchId: string | null;
  shoppingFileId: string | null;
  sessionId: string | null;
  sessionToken: string | null;
}

// ========== ALLOCATE ==========

// İstemcinin gönderdiği — session bilgisi YOK, sadece searchId
export interface AllocateClientRequest {
  searchId: string;
  productId: string;
}

// Server-side'da backend'e gönderilen tam request
export interface AllocateBackendRequest {
  sessionId?: string | null;
  sessionToken?: string | null;
  searchRequest?: FlightSearchRequest | null;
  productId: string;
  selectedServiceFee?: number;
}

// İstemciye dönen güvenli response — hassas alanlar filtrelenmiş
export interface AllocateResponse {
  hasError: boolean;
  errorMessage: string | null;
  searchId: string | null;
  shoppingFileId: string | null;
  isPriceChanged: boolean;
  isFlightInfoChanged: boolean | null;
  currency: string | null;
  canBeReserved: boolean;
  isCreditCardPaymentEnabled: boolean;
  airBookings: AirBooking[];
  priceSummary: PriceSummary | null;
  passengers: AllocatePassenger[];
}

export interface AirBooking {
  productId: string | null;
  pnr: string | null;
  providerId: string | null;
  status: string | null;
  currency: string | null;
  totalFare: number;
  baseFare: number;
  taxes: number;
  serviceFee: number;
  isRefundable: boolean;
  canBeReserved: boolean;
  validatingCarrier: string | null;
  flightType: string | null;
  bookingItems: BookingItem[];
  segments: AllocateSegment[];
  brandedFareItems: AllocateBrandedFareItem[];
  brandedItems: AllocateBrandedItem[];
  baggageAllowances: AllocateBaggageAllowance[];
}

export interface BookingItem {
  productItemId: string | null;
  currency: string | null;
  baseFare: number;
  taxes: number;
  totalFare: number;
  serviceFee: number;
  baggage: string | null;
  paxType: string | null;
  paxSequenceNo: number;
  paxReferenceId: string | null;
}

export interface AllocateSegment {
  segmentId: string | null;
  originCode: string | null;
  destinationCode: string | null;
  departureDay: string | null;
  departureTime: string | null;
  arrivalDay: string | null;
  arrivalTime: string | null;
  marketingAirline: string | null;
  operatingAirline: string | null;
  flightNumber: string | null;
  bookingClass: string | null;
  fareBasis: string | null;
  duration: string | null;
  selectedBrandedFareItemId: string | null;
  sequenceNo: number;
}

export interface AllocateBrandedFareItem {
  brandedFareItemId: string | null;
  currency: string | null;
  totalFare: number;
  totalTaxes: number;
  passengers: AllocateBrandedFarePassenger[];
}

export interface AllocateBrandedFarePassenger {
  passengerType: string | null;
  passengerCount: number;
  baseFare: number;
  taxes: number;
  totalFare: number;
  currency: string | null;
  bookingClass: string | null;
  cabinClass: string | null;
  fareBasisCode: string | null;
  brandId: string | null;
  seatsAvailable: number;
}

export interface AllocateBrandedItem {
  brandId: string | null;
  brandCode: string | null;
  brandName: string | null;
  rules: AllocateBrandedRule[];
}

export interface AllocateBrandedRule {
  application: string | null;
  displayType: string | null;
  ruleDescription: string | null;
  serviceGroup: string | null;
}

export interface AllocateBaggageAllowance {
  id: string | null;
  paxType: string | null;
  allowance: string | null;
  category: string | null;
  type: string | null;
  unit: string | null;
}

export interface AllocatePassenger {
  tempTag: string | null;
  sequenceNo: number;
  type: string | null;
  paxReferenceId: string | null;
}

export interface PriceSummary {
  grandTotal: number;
  totalBaseFare: number;
  totalTaxes: number;
  totalServiceFee: number;
  currency: string | null;
  priceItems: PriceItem[];
}

export interface PriceItem {
  productId: string | null;
  productType: string | null;
  total: number;
}

// ========== REMOVE PRODUCT ==========

// İstemciden gelen — session bilgisi YOK
export interface RemoveProductClientRequest {
  searchId: string;
  productId: string;
}

// Server-side'da backend'e gönderilen tam request
export interface RemoveProductBackendRequest {
  sessionId: string;
  sessionToken: string;
  shoppingFileId: string;
  productId: string;
}

export interface RemoveProductResponse {
  hasError: boolean;
  errorMessage: string | null;
  isRemoved: boolean;
}

// ========== MAKE PAYMENT ==========

// İstemciden gelen — session bilgisi YOK, kart bilgisi var
export interface MakePaymentClientRequest {
  searchId: string;
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvv: string;
  installmentCount?: number;
}

// Server-side'da backend'e gönderilen tam request
export interface MakePaymentBackendRequest {
  sessionId: string;
  sessionToken: string;
  shoppingFileId: string;
  creditCard: CreditCardInfo;
  installmentCount: number;
}

export interface CreditCardInfo {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvv: string;
}

export interface MakePaymentResponse {
  hasError: boolean;
  errorMessage: string | null;
  isPaymentSuccess: boolean;
  is3DSecureRequired: boolean;
  threeDSecureUrl: string | null;
  transactionId: string | null;
  paymentAmount: number;
  currency: string | null;
}

// ========== FINALIZE SHOPPING ==========

// İstemciden gelen — session bilgisi YOK
export interface FinalizeShoppingClientRequest {
  searchId: string;
}

// Server-side'da backend'e gönderilen tam request
export interface FinalizeShoppingBackendRequest {
  sessionId: string;
  sessionToken: string;
  shoppingFileId: string;
}

export interface FinalizeShoppingResponse {
  hasError: boolean;
  errorMessage: string | null;
  isFinalized: boolean;
  tickets: TicketInfo[];
  bookingCode: string | null;
  pnr: string | null;
}

export interface TicketInfo {
  ticketNumber: string | null;
  passengerName: string | null;
  passengerType: string | null;
  segmentInfo: string | null;
  status: string | null;
}

// ========== POKE SHOPPING FILE ==========

// İstemciden gelen — session bilgisi YOK
export interface PokeShoppingFileClientRequest {
  searchId: string;
}

// Server-side'da backend'e gönderilen tam request
export interface PokeShoppingFileBackendRequest {
  sessionId: string;
  sessionToken: string;
  shoppingFileId: string;
}

export interface PokeShoppingFileResponse {
  hasError: boolean;
  errorMessage: string | null;
  status: string | null;
  isPriceChanged: boolean;
  isCancelled: boolean;
  totalFare: number;
  currency: string | null;
}

// ========== READ SHOPPING FILE ==========

// İstemciden gelen — session bilgisi YOK
export interface ReadShoppingFileClientRequest {
  searchId: string;
}

// Server-side'da backend'e gönderilen tam request
export interface ReadShoppingFileBackendRequest {
  sessionId: string;
  sessionToken: string;
  shoppingFileId: string;
}

export interface ReadShoppingFileResponse {
  hasError: boolean;
  errorMessage: string | null;
  status: string | null;
  bookingCode: string | null;
  pnr: string | null;
  totalFare: number;
  currency: string | null;
  passengers: ReadShoppingPassenger[];
  segments: AllocateSegment[];
  tickets: TicketInfo[];
  payments: ReadShoppingPayment[];
}

export interface ReadShoppingPassenger {
  sequenceNo: number;
  firstName: string | null;
  lastName: string | null;
  paxType: string | null;
  ticketNumber: string | null;
}

export interface ReadShoppingPayment {
  paymentType: string | null;
  amount: number;
  currency: string | null;
  status: string | null;
  transactionId: string | null;
}

// ========== LOGOUT ==========

// İstemciden gelen — session bilgisi YOK
export interface LogoutClientRequest {
  searchId: string;
}

// Server-side'da backend'e gönderilen tam request
export interface LogoutBackendRequest {
  sessionId: string;
  sessionToken: string;
}

export interface LogoutResponse {
  hasError: boolean;
  errorMessage: string | null;
  isLoggedOut: boolean;
}

// ========== BOOKING QUERY (DB) ==========

export interface BookingDetailResponse {
  hasError: boolean;
  errorMessage: string | null;
  bookingId: string | null;
  bookingCode: string | null;
  pnr: string | null;
  status: string | null;
  totalFare: number;
  baseFare: number;
  taxes: number;
  serviceFee: number;
  currency: string | null;
  createdAt: string | null;
  passengers: ReadShoppingPassenger[];
  segments: AllocateSegment[];
  tickets: TicketInfo[];
}
