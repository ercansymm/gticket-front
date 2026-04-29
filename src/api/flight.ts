import apiClient from './client';
import type {
  FlightSearchRequest, FlightSearchResponse,
  AllocateClientRequest, AllocateResponse,
  RemoveProductClientRequest, RemoveProductResponse,
  MakePaymentClientRequest, MakePaymentResponse,
  FinalizeShoppingClientRequest, FinalizeShoppingResponse,
  PokeShoppingFileClientRequest, PokeShoppingFileResponse,
  ReadShoppingFileClientRequest, ReadShoppingFileResponse,
  LogoutClientRequest, LogoutResponse,
  BookingDetailResponse,
  CancelBookingClientRequest, CancelBookingResponse,
  BookingStatusRequest, BookingStatusResponse,
  MyBookingsResponse,
} from '@/types/flight';
import type {
  UpdatePassengersClientRequest, UpdatePassengersResponse,
  MakePreBookingClientRequest, MakePreBookingResponse,
  PrepareBookingClientRequest,
} from '@/types/booking';

export const healthCheck = async (): Promise<string> => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const searchFlights = async (params: FlightSearchRequest): Promise<FlightSearchResponse> => {
  const response = await apiClient.post<FlightSearchResponse>('/flight/search', params);
  return response.data;
};

export const allocateFlight = async (params: AllocateClientRequest): Promise<AllocateResponse> => {
  const response = await apiClient.post<AllocateResponse>('/flight/allocate', params);
  return response.data;
};

export const updatePassengers = async (params: UpdatePassengersClientRequest): Promise<UpdatePassengersResponse> => {
  const response = await apiClient.post<UpdatePassengersResponse>('/flight/update-passengers', params);
  return response.data;
};

// UpdatePassengers + MakePreBooking tek round-trip'te yapar
export const prepareBooking = async (params: PrepareBookingClientRequest): Promise<MakePreBookingResponse> => {
  const response = await apiClient.post<MakePreBookingResponse>('/flight/prepare-booking', params);
  return response.data;
};

export const makePreBooking = async (params: MakePreBookingClientRequest): Promise<MakePreBookingResponse> => {
  try {
    const response = await apiClient.post<MakePreBookingResponse>('/flight/make-prebooking', params);
    return response.data;
  } catch (error: any) {
    // 409 Conflict = fiyat degisikligi — response body icindeki data'yi normal response olarak don
    if (error.response?.status === 409 && error.response?.data?.code === 'PRICE_CHANGED') {
      return error.response.data.data as MakePreBookingResponse;
    }
    throw error;
  }
};

// Sepetten ürün kaldırma
export const removeProduct = async (params: RemoveProductClientRequest): Promise<RemoveProductResponse> => {
  const response = await apiClient.post<RemoveProductResponse>('/flight/remove-product', params);
  return response.data;
};

// Ödeme — kart bilgisi BFF üzerinden gider, istemci sadece searchId + kart gönderir
export const makePayment = async (params: MakePaymentClientRequest): Promise<MakePaymentResponse> => {
  const response = await apiClient.post<MakePaymentResponse>('/flight/make-payment', params);
  return response.data;
};

// Biletleme — e-ticket numaraları döner
export const finalizeShopping = async (params: FinalizeShoppingClientRequest): Promise<FinalizeShoppingResponse> => {
  const response = await apiClient.post<FinalizeShoppingResponse>('/flight/finalize-shopping', params);
  return response.data;
};

// Durum sorgulama (polling)
export const pokeShoppingFile = async (params: PokeShoppingFileClientRequest): Promise<PokeShoppingFileResponse> => {
  const response = await apiClient.post<PokeShoppingFileResponse>('/flight/poke-shopping-file', params);
  return response.data;
};

// Tam detay okuma
export const readShoppingFile = async (params: ReadShoppingFileClientRequest): Promise<ReadShoppingFileResponse> => {
  const response = await apiClient.post<ReadShoppingFileResponse>('/flight/read-shopping-file', params);
  return response.data;
};

// Oturum kapatma
export const logoutSession = async (params: LogoutClientRequest): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>('/flight/logout', params);
  return response.data;
};

// Booking sorgulama (DB)
export const getBookingById = async (bookingId: string): Promise<BookingDetailResponse> => {
  const response = await apiClient.get<BookingDetailResponse>(`/flight/booking/${encodeURIComponent(bookingId)}`);
  return response.data;
};

// PNR ile booking sorgulama (DB)
export const getBookingByPnr = async (pnr: string): Promise<BookingDetailResponse> => {
  const response = await apiClient.get<BookingDetailResponse>(`/flight/booking/pnr/${encodeURIComponent(pnr)}`);
  return response.data;
};

// --- Helpers for booking lookup response parsing ---
function parseDate(val: string | null | undefined): string | null {
  if (!val) return null;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return null;
  }
}

function parseTime(timeVal: string | null | undefined, dateVal: string | null | undefined): string | null {
  // If timeVal is already "HH:mm" format, return as is
  if (timeVal && /^\d{1,2}:\d{2}$/.test(timeVal)) return timeVal;
  // If timeVal is an ISO string, extract time
  if (timeVal) {
    try {
      const d = new Date(timeVal);
      if (!isNaN(d.getTime())) return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    } catch { /* fall through */ }
  }
  // Last resort: extract time from the date field
  if (dateVal) {
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime()) && (d.getHours() !== 0 || d.getMinutes() !== 0)) {
        return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      }
    } catch { /* ignore */ }
  }
  return null;
}

// InternalPnr + Soyad ile booking sorgulama
export const lookupBookingByPnrAndLastName = async (pnr: string, lastName: string): Promise<BookingDetailResponse> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await apiClient.get<any>(`/flight/booking/lookup/${encodeURIComponent(pnr)}/${encodeURIComponent(lastName)}`);
  const raw = response.data;

  // Backend fareDetails array → flat price fields
  const fare = Array.isArray(raw.fareDetails) ? raw.fareDetails[0] : null;

  // Backend segments: parse dates & times properly
  const segments = Array.isArray(raw.segments)
    ? raw.segments.map((s: Record<string, unknown>) => {
        // DepartureDate/ArrivalDate are ISO strings → format as "18 Nis 2026"
        const depDate = parseDate(s.departureDate as string | null);
        const arrDate = parseDate(s.arrivalDate as string | null);
        // DepartureTime/ArrivalTime are "HH:mm" strings or ISO → extract time
        const depTime = parseTime(s.departureTime as string | null, s.departureDate as string | null);
        const arrTime = parseTime(s.arrivalTime as string | null, s.arrivalDate as string | null);
        return {
          ...s,
          departureDay: depDate,
          arrivalDay: arrDate,
          departureTime: depTime,
          arrivalTime: arrTime,
        };
      })
    : [];

  return {
    hasError: false,
    errorMessage: null,
    bookingId: raw.id ?? null,
    bookingCode: raw.bookingCode ?? null,
    pnr: raw.pnr ?? null,
    status: raw.status ?? null,
    grandTotal: raw.grandTotal ?? 0,
    totalFare: fare?.grandTotal ?? raw.grandTotal ?? 0,
    baseFare: fare?.baseFare ?? 0,
    taxes: fare?.totalTax ?? 0,
    serviceFee: fare?.serviceFee ?? 0,
    currency: fare?.currency ?? raw.currency ?? null,
    createdAt: raw.createdAt ?? null,
    isFinalized: raw.isFinalized ?? false,
    isGuest: raw.isGuest ?? false,
    passengers: raw.passengers ?? [],
    segments,
    tickets: raw.tickets ?? [],
  } as BookingDetailResponse;
};

// Rezervasyon iptali
export const cancelBooking = async (params: CancelBookingClientRequest): Promise<CancelBookingResponse> => {
  const response = await apiClient.post<CancelBookingResponse>('/flight/cancel-booking', params);
  return response.data;
};

// Canlı booking status
export const getBookingStatus = async (params: BookingStatusRequest): Promise<BookingStatusResponse> => {
  const response = await apiClient.post<BookingStatusResponse>('/flight/booking-status', params);
  return response.data;
};

// Kullanıcı booking listesi
export const getMyBookingsByUser = async (userId: string): Promise<MyBookingsResponse> => {
  const response = await apiClient.get<MyBookingsResponse>(`/flight/my-bookings/user/${encodeURIComponent(userId)}`);
  return response.data;
};

// Email ile booking listesi
export const getMyBookingsByEmail = async (email: string): Promise<MyBookingsResponse> => {
  const response = await apiClient.get<MyBookingsResponse>(`/flight/my-bookings/email/${encodeURIComponent(email)}`);
  return response.data;
};
