import RetryPaymentClient from './retry-payment-client';

export const metadata = {
  title: 'Ödemeyi Tekrar Dene | GBilet',
  description: 'Mevcut rezervasyonunuz için ödemenizi tekrar deneyin.',
};

export default function RetryPaymentPage() {
  return <RetryPaymentClient />;
}
