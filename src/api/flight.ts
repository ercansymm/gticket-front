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

// InternalPnr + Soyad ile booking sorgulama
export const lookupBookingByPnrAndLastName = async (pnr: string, lastName: string): Promise<BookingDetailResponse> => {
  const response = await apiClient.get<BookingDetailResponse>(`/flight/booking/lookup/${encodeURIComponent(pnr)}/${encodeURIComponent(lastName)}`);
  return response.data;
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
