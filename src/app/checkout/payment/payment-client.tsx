"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentClient() {
  const router = useRouter();

  // Payment is now integrated into the checkout page
  useEffect(() => {
    router.replace('/checkout');
  }, [router]);

  return null;
}
