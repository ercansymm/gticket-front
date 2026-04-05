"use client";

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type CallbackStatus = 'loading' | 'success' | 'failed';

export default function PaymentCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pnr, setPnr] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const callbackStatus = searchParams.get('status');
    const callbackError = searchParams.get('error');
    const callbackPnr = searchParams.get('pnr');

    // Clean up saved 3DS session
    sessionStorage.removeItem('payment_3ds_session');

    if (callbackPnr) setPnr(callbackPnr);

    if (callbackStatus === 'success' || callbackStatus === 'paid') {
      // Backend already called FinalizeShopping and returned PNR
      setStatus('success');
      // Redirect to success page
      setTimeout(() => {
        const successUrl = callbackPnr
          ? `/checkout/success?pnr=${encodeURIComponent(callbackPnr)}`
          : '/checkout/success';
        router.push(successUrl);
      }, 2500);
    } else if (callbackStatus === 'failed' || callbackStatus === 'error') {
      setStatus('failed');
      setErrorMessage(callbackError || '3D Secure doğrulaması başarısız oldu. Ödeme gerçekleşmedi.');
    } else {
      // Unknown status
      setStatus('failed');
      setErrorMessage('Ödeme durumu belirlenemedi. Lütfen bilet sorgulama sayfasından kontrol ediniz.');
    }
  }, [searchParams, router]);

  return (
    <main className="bb-3ds-callback">
      <div className="bb-3ds-callback__card">
        {/* Loading */}
        {status === 'loading' && (
          <>
            <div className="bb-3ds-callback__icon bb-3ds-callback__icon--loading">
              <div className="bb-spinner bb-spinner--large"></div>
            </div>
            <h2 className="bb-3ds-callback__title">Ödeme sonucu kontrol ediliyor...</h2>
            <p className="bb-3ds-callback__text">
              Lütfen bu sayfayı kapatmayın.
            </p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div className="bb-3ds-callback__icon bb-3ds-callback__icon--success">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h2 className="bb-3ds-callback__title">Ödeme Başarılı!</h2>
            {pnr && (
              <p className="bb-3ds-callback__pnr">PNR: <strong>{pnr}</strong></p>
            )}
            <p className="bb-3ds-callback__text">
              Biletiniz oluşturuldu. Başarı sayfasına yönlendiriliyorsunuz...
            </p>
          </>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <>
            <div className="bb-3ds-callback__icon bb-3ds-callback__icon--failed">
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
            <h2 className="bb-3ds-callback__title">Ödeme Başarısız</h2>
            {errorMessage && (
              <p className="bb-3ds-callback__text">{errorMessage}</p>
            )}
            <div className="bb-3ds-callback__actions">
              <button
                className="bb-3ds-callback__btn bb-3ds-callback__btn--primary"
                onClick={() => router.push('/checkout/payment')}
              >
                Tekrar Dene
              </button>
              <button
                className="bb-3ds-callback__btn bb-3ds-callback__btn--secondary"
                onClick={() => router.push('/bilet-sorgula')}
              >
                Bilet Sorgula
              </button>
              <button
                className="bb-3ds-callback__btn bb-3ds-callback__btn--ghost"
                onClick={() => router.push('/')}
              >
                Ana Sayfa
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
