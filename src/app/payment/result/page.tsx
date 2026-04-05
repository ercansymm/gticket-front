import type { Metadata } from 'next';
import PaymentCallbackClient from './callback-client';

export const metadata: Metadata = {
  title: '3D Secure Sonucu | AtaBilet',
  robots: { index: false, follow: false },
};

export default function PaymentCallbackPage() {
  return <PaymentCallbackClient />;
}
