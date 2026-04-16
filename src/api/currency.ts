import apiClient from './client';

export interface CurrencyRate {
  currency: string;
  rateTry: number;
  lastUpdatedUtc: string;
}

export const getCurrencyRates = async (): Promise<CurrencyRate[]> => {
  const response = await apiClient.get<CurrencyRate[]>('/currency/rates');
  return response.data;
};

export const getCurrencyRate = async (currency: string): Promise<CurrencyRate> => {
  const response = await apiClient.get<CurrencyRate>(`/currency/rates/${encodeURIComponent(currency)}`);
  return response.data;
};
