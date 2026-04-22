"use client";

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type CallbackStatus = 'loading' | 'success' | 'failed';

export default function PaymentCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pnr, setPnr] = useState<string | null>(null);
  const [finalized, setFinalized] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const callbackStatus = searchParams.get('status');
    const callbackError = searchParams.get('error');
    const callbackPnr = searchParams.get('pnr');
    const callbackFinalized = searchParams.get('finalized');
    const callbackBookingId = searchParams.get('bookingId');

    // Clean up saved 3DS session
    sessionStorage.removeItem('payment_3ds_session');

    if (callbackPnr) setPnr(callbackPnr);
    if (callbackFinalized === 'True' || callbackFinalized === 'true') setFinalized(true);

    if (callbackStatus === 'success' || callbackStatus === 'paid') {
      setStatus('success');

      // Build success redirect URL
      const params = new URLSearchParams();
      if (callbackPnr) params.set('pnr', callbackPnr);
      if (callbackBookingId) params.set('bookingId', callbackBookingId);
      if (callbackFinalized) params.set('finalized', callbackFinalized);
      const query = params.toString();

      setTimeout(() => {
        router.push(`/checkout/success${query ? `?${query}` : ''}`);
      }, 2500);
    } else if (callbackStatus === 'failed' || callbackStatus === 'error') {
      setStatus('failed');
      setErrorMessage(callbackError || '3D Secure doğrulaması başarısız oldu. Ödeme gerçekleşmedi.');

      // Dedike basarisiz odeme sayfasina yonlendir (header/footer'li tam sayfa)
      const params = new URLSearchParams();
      if (callbackError) params.set('error', callbackError);
      if (callbackBookingId) params.set('bookingId', callbackBookingId);
      const query = params.toString();

      setTimeout(() => {
        router.push(`/checkout/failed${query ? `?${query}` : ''}`);
      }, 1500);
    } else {
      setStatus('failed');
      setErrorMessage('Ödeme durumu belirlenemedi. Lütfen bilet sorgulama sayfasından kontrol ediniz.');
      setTimeout(() => {
        router.push('/checkout/failed?error=' + encodeURIComponent('Ödeme durumu belirlenemedi.'));
      }, 1500);
    }
  }, [searchParams, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Loading */}
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Ödeme sonucu kontrol ediliyor...</h2>
            <p className="text-slate-500">
              Lütfen bu sayfayı kapatmayın.
            </p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Ödeme Başarılı!</h2>
            {pnr && (
              <p className="text-lg font-mono font-bold text-emerald-700 mb-2">PNR: {pnr}</p>
            )}
            <p className="text-slate-500 mb-1">
              {finalized ? 'Biletiniz oluşturuldu.' : 'Ödemeniz alındı, biletleme işlemi devam ediyor.'}
            </p>
            <p className="text-slate-400 text-sm">Başarı sayfasına yönlendiriliyorsunuz...</p>
          </>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Ödeme Başarısız</h2>
            {errorMessage && (
              <p className="text-slate-500 mb-6">{errorMessage}</p>
            )}
            <div className="flex flex-col gap-3">
              <Link
                href="/checkout/payment"
                className="w-full py-3 px-4 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition-colors"
              >
                Tekrar Dene
              </Link>
              <Link
                href="/bilet-sorgula"
                className="w-full py-3 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Bilet Sorgula
              </Link>
              <Link
                href="/"
                className="w-full py-3 px-4 rounded-lg text-slate-500 font-medium hover:bg-slate-50 transition-colors"
              >
                Ana Sayfa
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
