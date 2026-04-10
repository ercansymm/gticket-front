// ========== UPDATE PASSENGERS ==========

// İstemciden gelen — session bilgisi YOK
export interface UpdatePassengersClientRequest {
  searchId: string;
  productId: string;
  productItemId: string;
  passengers: PassengerItem[];
  contact: ContactInfo;
}

// Server-side'da backend'e gönderilen tam request
export interface UpdatePassengersBackendRequest {
  sessionId: string;
  sessionToken: string;
  shoppingFileId: string;
  productId: string;
  productItemId: string;
  passengers: PassengerItem[];
  contact: ContactInfo;
}

export interface PassengerItem {
  paxType: 'ADT' | 'CHD' | 'INF';
  sequenceNo: number;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  citizenNo?: string | null;
  passportNo?: string | null;
  passportCountry?: string | null;
  passportExpiry?: string | null;
  nationality?: string;
  tempTag?: string | null;
  paxReferenceId?: string | null;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface UpdatePassengersResponse {
  hasError: boolean;
  errorMessage: string | null;
}

// ========== MAKE PRE-BOOKING ==========

// İstemciden gelen — session bilgisi YOK
export interface MakePreBookingClientRequest {
  searchId: string;
  productId: string;
  brandedFareItemId: string;
  passengers: PassengerItem[];
  contact: ContactInfo;
}

// Server-side'da backend'e gönderilen tam request
export interface MakePreBookingBackendRequest {
  sessionId: string;
  sessionToken: string;
  productId: string;
  brandedFareItemId: string;
  shoppingFileId: string;
  userId?: string | null;
  passengers: PassengerItem[];
  contact: ContactInfo;
}

export interface MakePreBookingResponse {
  hasError: boolean;
  errorMessage: string | null;
  bookingCode: string | null;
  status: string | null;
  totalFare: number;
  baseFare: number;
  taxes: number;
  serviceFee: number;
  currency: string | null;
  isPriceChanged: boolean;
  oldPrice: number;
  prebookingExpiresAt: string | null;
  reservationExpiresAt: string | null;
  segments: PreBookingSegment[];
  bookingId: string | null;
  isGuest: boolean;
}

export interface PreBookingSegment {
  segmentId: string | null;
  originCode: string | null;
  destinationCode: string | null;
  departureDay: string | null;
  departureTime: string | null;
  arrivalDay: string | null;
  arrivalTime: string | null;
  flightNumber: string | null;
  marketingAirline: string | null;
  bookingClass: string | null;
}

// ========== HATA TİPLERİ ==========

export interface ValidationError {
  error: string;
}

export interface ServerError {
  error: string;
}

export interface BusinessError {
  hasError: true;
  errorMessage: string;
}
