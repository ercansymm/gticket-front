import apiClient from './client';
import type {
  FlightSearchRequest, FlightSearchResponse,
  AllocateRequest, AllocateResponse,
  BookRequest, BookResponse
} from '@/types';

/**
 * Health check — API'nin çalışıp çalışmadığını kontrol et
 */
export const healthCheck = async (): Promise<string> => {
  const response = await apiClient.get('/auth/test');
  return response.data;
};

/**
 * Uçuş arama — POST /api/flight/search
 */
export const searchFlights = async (params: FlightSearchRequest): Promise<FlightSearchResponse> => {
  const response = await apiClient.post<FlightSearchResponse>('/api/flight/search', params);
  return response.data;
};

/**
 * Uçuş tahsis — POST /api/flight/allocate
 */
export const allocateFlight = async (params: AllocateRequest): Promise<AllocateResponse> => {
  const response = await apiClient.post<AllocateResponse>('/api/flight/allocate', params);
  return response.data;
};

/**
 * Rezervasyon — POST /api/flight/book
 * ⚠️ Şu an UpdatePassenger hatası var, backend düzeltecek
 */
export const bookFlight = async (params: BookRequest): Promise<BookResponse> => {
  const response = await apiClient.post<BookResponse>('/api/flight/book', params);
  return response.data;
};
