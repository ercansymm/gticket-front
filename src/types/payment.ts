// Payment types — ileride ödeme endpoint'leri gelince genişletilecek
export interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
}

export interface PaymentResponse {
  hasError: boolean;
  errorMessage: string | null;
  transactionId: string;
  status: string;
}
