"use client";

import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import PassengerForm from '@/components/booking/PassengerForm';
import { updatePassengersThunk, makePreBookingThunk } from '@/redux/features/bookingSlice';
import { setStep, setPassengers, setContactInfo, resetBooking } from '@/redux/features/bookingSlice';
import { makePaymentThunk, finalizeShoppingThunk, clearFinalizeError } from '@/redux/features/paymentSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import type { PassengerItem, ContactInfo, MakePreBookingResponse } from '@/types/booking';
import { useSessionTimeout } from '@/hooks/UseSessionTimeout';
import { airports } from '@/data/AirportData';
import { AIRLINE_COLORS, getAirlineLogoUrl, getAirlineBrandStyle } from '@/utils/airlineUtils';

const FALLBACK_STYLE = { bg: '#6b7280', color: '#fff' };

export default function CheckoutClient() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const { showWarning: sessionWarning, dismissWarning: dismissSessionWarning } = useSessionTimeout();
  const [priceChangedResult, setPriceChangedResult] = useState<MakePreBookingResponse | null>(null);

  /* ── Payment state ── */
  const [paymentMethod, setPaymentMethod] = useState<'running_account' | 'credit_card'>('running_account');
  const [agreed, setAgreed] = useState(false);
  const [agreementError, setAgreementError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [threeDSRedirecting, setThreeDSRedirecting] = useState(false);
  const [threeDSError, setThreeDSError] = useState<string | null>(null);
  const hasFinalized = useRef(false);
  const finalizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { allocateResult, selectedFlight, selectedReturnFlight, selectedLegFlights, searchId: allocateSearchId, searchResults, selectedBrandedFareItemId, searchParams } = useSelector(
    (state: RootState) => state.flight
  );
  // searchId fallback: allocate response → search results
  const searchId = allocateSearchId || searchResults?.searchId || null;
  const {
    updatePassengersLoading,
    updatePassengersError,
    preBookingLoading,
    preBookingError,
  } = useSelector((state: RootState) => state.booking);

  const {
    paymentResult, paymentLoading, paymentError,
    finalizeResult, finalizeLoading, finalizeError,
    is3DSecureRequired, threeDSecureUrl, threeDSecureHtml,
  } = useSelector((state: RootState) => state.payment);

  const finalizeResultRef = useRef(finalizeResult);
  finalizeResultRef.current = finalizeResult;

  // No allocate → back to home
  useEffect(() => {
    if (!allocateResult) {
      router.push('/');
    }
  }, [allocateResult, router]);

  // Set booking step
  useEffect(() => {
    dispatch(setStep('passenger'));
  }, [dispatch]);

  // Derive values from allocateResult (safe — returns defaults if null)
  const airBookings = allocateResult?.airBookings ?? [];
  const passengers = allocateResult?.passengers ?? [];
  const isPriceChanged = allocateResult?.isPriceChanged ?? false;
  const firstBooking = airBookings[0];
  const productId = firstBooking?.productId ?? '';
  const productItemId = firstBooking?.bookingItems?.[0]?.productItemId ?? '';

  // brandedFareItemId: tercihli sıralama — Redux seçimi → segment seçimi → fare items → boş
  const brandedFareItemId =
    selectedBrandedFareItemId
    ?? firstBooking?.segments?.[0]?.selectedBrandedFareItemId
    ?? firstBooking?.brandedFareItems?.[0]?.brandedFareItemId
    ?? '';

  // Fiyat hesaplaması — priceSummary 0 gelirse airBookings'ten hesapla
  const priceSummary = (() => {
    const ps = allocateResult?.priceSummary;
    if (ps && ps.totalBaseFare > 0) return ps;

    const totals = airBookings.reduce(
      (acc, ab) => ({
        baseFare: acc.baseFare + (ab.baseFare ?? 0),
        taxes: acc.taxes + (ab.taxes ?? 0),
        serviceFee: acc.serviceFee + (ab.serviceFee ?? 0),
        totalFare: acc.totalFare + (ab.totalFare ?? 0),
      }),
      { baseFare: 0, taxes: 0, serviceFee: 0, totalFare: 0 }
    );

    return {
      grandTotal: ps?.grandTotal ?? totals.totalFare,
      totalBaseFare: totals.baseFare,
      totalTaxes: totals.taxes,
      totalServiceFee: totals.serviceFee,
      currency: ps?.currency ?? firstBooking?.currency ?? 'TRY',
      priceItems: ps?.priceItems ?? [],
    };
  })();

  const paxCounts = passengers.reduce((acc, p) => {
    const t = (p.type ?? 'ADT').toUpperCase();
    if (t === 'CHD' || t === 'CHILD') acc.child++;
    else if (t === 'INF' || t === 'INFANT') acc.infant++;
    else acc.adult++;
    return acc;
  }, { adult: 0, child: 0, infant: 0 });

  const paxSummaryText = [
    paxCounts.adult > 0 ? `${paxCounts.adult} Yetişkin` : '',
    paxCounts.child > 0 ? `${paxCounts.child} Çocuk` : '',
    paxCounts.infant > 0 ? `${paxCounts.infant} Bebek` : '',
  ].filter(Boolean).join(', ');

  // Detect international flight
  // Priority: searchParams country codes (most reliable) → airport lookup → BiletBank flightType
  const isInternational = useMemo(() => {
    // 1. Primary: Search params have explicit country codes set at search time
    if (searchParams?.originCountryCode && searchParams?.destinationCountryCode) {
      return searchParams.originCountryCode !== searchParams.destinationCountryCode;
    }

    // 2. Airport country code lookup from segments
    const segments = airBookings.flatMap(ab => ab.segments ?? []);
    const codes = segments.length > 0
      ? segments.map(seg => ({ origin: seg.originCode, dest: seg.destinationCode }))
      : selectedFlight
        ? [{ origin: selectedFlight.originCode, dest: selectedFlight.destinationCode }]
        : [];

    const resolvedPairs = codes.filter(({ origin, dest }) =>
      origin !== null && dest !== null &&
      airports.some(a => a.code === origin) && airports.some(a => a.code === dest)
    );

    if (resolvedPairs.length > 0) {
      return resolvedPairs.some(({ origin, dest }) => {
        const o = airports.find(a => a.code === origin);
        const d = airports.find(a => a.code === dest);
        return !!o && !!d && o.countryCode !== d.countryCode;
      });
    }

    // 3. Fallback: BiletBank flightType from allocate response ("I" = international, "D" = domestic)
    const flightTypes = airBookings.map(ab => ab.flightType?.toUpperCase() ?? '');
    if (flightTypes.some(ft => ft === 'I' || ft === 'INTERNATIONAL')) return true;
    if (flightTypes.some(ft => ft === 'D' || ft === 'DOMESTIC')) return false;

    // 4. Belirlenemedi → yurt içi kabul et
    return false;
  }, [searchParams, airBookings, selectedFlight]);

  /* ── Card validation ── */
  const validateCard = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!cardForm.cardHolderName.trim() || cardForm.cardHolderName.trim().length < 3) errs.cardHolderName = 'Kart sahibi adı gereklidir';
    if (!/^\d{15,16}$/.test(cardForm.cardNumber.replace(/\s/g, ''))) errs.cardNumber = 'Geçerli bir kart numarası giriniz';
    if (!/^(0[1-9]|1[0-2])$/.test(cardForm.expiryMonth)) errs.expiryMonth = 'Geçersiz ay';
    if (!/^\d{4}$/.test(cardForm.expiryYear) || parseInt(cardForm.expiryYear) < new Date().getFullYear()) errs.expiryYear = 'Geçersiz yıl';
    if (!/^\d{3,4}$/.test(cardForm.cvv)) errs.cvv = 'Geçersiz CVV';
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  }, [cardForm]);

  /* ── 3D Secure flow ── */
  useEffect(() => {
    if (is3DSecureRequired && (threeDSecureUrl || threeDSecureHtml)) {
      setThreeDSRedirecting(true);
      setThreeDSError(null);

      const paymentSession = {
        searchId,
        shoppingFileId: paymentResult?.shoppingFileId ?? null,
        paymentReferenceId: paymentResult?.paymentReferenceId ?? null,
        amount: paymentResult?.grandTotal ?? paymentResult?.paymentAmount ?? 0,
        currency: paymentResult?.currency ?? 'TRY',
        pnr: paymentResult?.pnr ?? null,
      };
      sessionStorage.setItem('payment_3ds_session', JSON.stringify(paymentSession));

      if (threeDSecureUrl) {
        const timer = setTimeout(() => { window.location.href = threeDSecureUrl; }, 1500);
        return () => clearTimeout(timer);
      } else if (threeDSecureHtml) {
        const win = window.open('', '_blank', 'width=500,height=700,scrollbars=yes');
        if (win) {
          win.document.open();
          win.document.write(threeDSecureHtml);
          win.document.close();
        } else {
          setThreeDSRedirecting(false);
          setIsProcessing(false);
          setThreeDSError('Tarayıcınız popup penceresini engelledi. Lütfen popup engelleyiciyi devre dışı bırakıp tekrar deneyin.');
        }
      }
    }
  }, [is3DSecureRequired, threeDSecureUrl, threeDSecureHtml, searchId, paymentResult]);

  /* ── Auto-finalize after successful payment ── */
  const isPaymentSuccessful = paymentResult && paymentResult.hasError === false &&
    paymentResult.isPaymentSuccessful === true && !paymentResult.is3DSecureRequired;

  useEffect(() => {
    if (isPaymentSuccessful && searchId && !hasFinalized.current && !finalizeResult && !finalizeError) {
      hasFinalized.current = true;
      if (finalizeTimeoutRef.current) clearTimeout(finalizeTimeoutRef.current);
      finalizeTimeoutRef.current = setTimeout(() => {
        if (!finalizeResultRef.current) dispatch({ type: 'payment/finalizeTimeout' });
      }, 60_000);
      const timer = setTimeout(() => {
        dispatch(finalizeShoppingThunk({ searchId }));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPaymentSuccessful, searchId, dispatch, finalizeResult, finalizeError]);

  useEffect(() => {
    return () => { if (finalizeTimeoutRef.current) clearTimeout(finalizeTimeoutRef.current); };
  }, []);

  /* ── After finalize → success page ── */
  useEffect(() => {
    if (!hasFinalized.current) return;
    
    const successStatuses = ['Booking', 'Ticketed', 'Reservation'];
    const isFinalized = finalizeResult && finalizeResult.hasError === false &&
      (finalizeResult.isFinalized === true || successStatuses.includes(finalizeResult.status ?? ''));
    if (isFinalized) {
      if (finalizeTimeoutRef.current) { clearTimeout(finalizeTimeoutRef.current); finalizeTimeoutRef.current = null; }
      setIsProcessing(false);
      dispatch(setStep('confirmation'));
      router.push('/checkout/success');
    }
  }, [finalizeResult, dispatch, router]);

  /* ── Handle "Duplicate call" as potential success ── */
  useEffect(() => {
    if (finalizeError && /duplicate|zaten biletlen/i.test(finalizeError) && searchId) {
      if (finalizeTimeoutRef.current) { clearTimeout(finalizeTimeoutRef.current); finalizeTimeoutRef.current = null; }
      setIsProcessing(false);
      const timer = setTimeout(() => { router.push('/bilet-sorgula'); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [finalizeError, searchId, router]);

  /* ── Clear processing on errors ── */
  useEffect(() => {
    if (paymentError || (finalizeError && !/duplicate|zaten biletlen/i.test(finalizeError))) {
      setIsProcessing(false);
    }
  }, [paymentError, finalizeError]);

  /* ── Submit handler — full chain: updatePassengers → preBooking → payment ── */
  const submitRef = useRef(false);
  const handlePassengerSubmit = useCallback(
    async (passengerItems: PassengerItem[], contact: ContactInfo) => {
      if (submitRef.current) return;
      if (!searchId || !productId || !productItemId) {
        console.error('Missing booking data:', { searchId: !!searchId, productId: !!productId, productItemId: !!productItemId });
        return;
      }

      // Validate payment form first
      if (!agreed) {
        setAgreementError(true);
        setTimeout(() => {
          const el = document.querySelector('.bb-agreement');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
      if (paymentMethod === 'credit_card' && !validateCard()) {
        setTimeout(() => {
          const el = document.querySelector('.bb-card-form__field--error');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }

      submitRef.current = true;
      setIsProcessing(true);

      dispatch(setPassengers(passengerItems));
      dispatch(setContactInfo(contact));

      try {
        // 1. Yolcu bilgilerini backend'e gönder
        await dispatch(updatePassengersThunk({
          searchId,
          productId,
          productItemId,
          passengers: passengerItems,
          contact,
        })).unwrap();

        // 2. Ön rezervasyon oluştur
        const prebookingResult = await dispatch(makePreBookingThunk({
          searchId,
          productId,
          brandedFareItemId,
          passengers: passengerItems,
          contact,
        })).unwrap();

        // 3. Fiyat değişikliği kontrolü
        if (prebookingResult?.isPriceChanged) {
          setIsProcessing(false);
          setPriceChangedResult(prebookingResult);
          return;
        }

        // 4. Ödeme yap
        if (paymentMethod === 'credit_card') {
          dispatch(makePaymentThunk({
            searchId,
            paymentType: 'CreditCard',
            cardHolderName: cardForm.cardHolderName.trim().toUpperCase(),
            cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
            expiryMonth: cardForm.expiryMonth,
            expiryYear: cardForm.expiryYear,
            cvv: cardForm.cvv,
          }));
        } else {
          dispatch(makePaymentThunk({
            searchId,
            paymentType: 'RunningAccount',
          }));
        }
        // Auto-finalize handled by effects above
      } catch (err) {
        console.error('[Checkout] Submit chain failed:', err);
        setIsProcessing(false);
        setTimeout(() => {
          const errorEl = document.querySelector('.bb-checkout__price-warning');
          if (errorEl) errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      } finally {
        submitRef.current = false;
      }
    },
    [dispatch, searchId, productId, productItemId, brandedFareItemId, router, paymentMethod, cardForm, agreed, validateCard]
  );

  const handleAcceptPriceChange = useCallback(() => {
    setPriceChangedResult(null);
    // Re-trigger payment with accepted price
    setIsProcessing(true);
    if (paymentMethod === 'credit_card') {
      dispatch(makePaymentThunk({
        searchId: searchId!,
        paymentType: 'CreditCard',
        cardHolderName: cardForm.cardHolderName.trim().toUpperCase(),
        cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
        expiryMonth: cardForm.expiryMonth,
        expiryYear: cardForm.expiryYear,
        cvv: cardForm.cvv,
      }));
    } else {
      dispatch(makePaymentThunk({
        searchId: searchId!,
        paymentType: 'RunningAccount',
      }));
    }
  }, [dispatch, searchId, paymentMethod, cardForm]);

  const handleRejectPriceChange = useCallback(() => {
    setPriceChangedResult(null);
    dispatch(resetBooking());
    router.push('/search-results');
  }, [dispatch, router]);

  // Guard: render nothing until allocate data is ready
  if (!allocateResult || !selectedFlight) return null;

  const airlineCode = selectedFlight.airlineCode;
  const logoPath = getAirlineLogoUrl(airlineCode);
  const brandStyle = getAirlineBrandStyle(airlineCode);

  // Multi-city: ordered list of leg flights
  const isMultiCity = searchParams?.flightType === 'MP';
  const legFlightsList = isMultiCity
    ? Object.keys(selectedLegFlights)
        .map(Number)
        .sort((a, b) => a - b)
        .map(idx => selectedLegFlights[idx])
        .filter(Boolean)
    : [];

  return (
    <>
      <HeaderOne />
      <main className="bb-checkout bb-checkout--full">
        {/* Session timeout warning */}
        {sessionWarning && (
          <div className="bb-countdown">
            <span className="bb-countdown__icon">&#9201;</span>
            <span className="bb-countdown__text">Oturumunuz sona ermek üzere. Lütfen işleminizi tamamlayın.</span>
            <button type="button" onClick={dismissSessionWarning} style={{ background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', color: '#92400e', fontSize: 16 }}>&#10005;</button>
          </div>
        )}

        {/* Auth banner */}
        {session?.user ? (
          <div className="bb-checkout__auth-banner bb-checkout__auth-banner--member">
            Hoş geldiniz, <strong>{session.user.name || session.user.email}</strong>
          </div>
        ) : (
          <div className="bb-checkout__auth-banner bb-checkout__auth-banner--guest">
            Misafir olarak devam ediyorsunuz. Biletlerinizi takip etmek için
            <a href={`/login?callbackUrl=/checkout`} style={{ fontWeight: 600, marginLeft: 4, color: 'inherit', textDecoration: 'underline' }}>
              giriş yapabilirsiniz
            </a>.
          </div>
        )}

        {/* Warnings */}
        {isPriceChanged && (
          <div className="bb-checkout__price-warning">
            Fiyat güncellenmiştir. Lütfen yeni fiyatı kontrol ediniz.
          </div>
        )}
        {(!productId || !productItemId || !searchId) && (
          <div className="bb-checkout__price-warning">
            Uçuş tahsis bilgileri eksik. Lütfen geri dönüp tekrar uçuş seçiniz.
          </div>
        )}
        {updatePassengersError && (
          <div className="bb-checkout__price-warning">{updatePassengersError}</div>
        )}
        {preBookingError && !isProcessing && (
          <div className="bb-checkout__price-warning">
            <p>{preBookingError}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="bb-checkout__btn bb-checkout__btn--next"
                disabled={preBookingLoading}
                onClick={() => {
                  const form = document.querySelector('.bb-passenger-form') as HTMLFormElement;
                  if (form) form.requestSubmit();
                }}
              >Tekrar Dene</button>
              <button type="button" className="bb-checkout__btn bb-checkout__btn--back" onClick={() => router.push('/search-results')}>Farklı Uçuş Seç</button>
            </div>
          </div>
        )}
        {paymentError && !isProcessing && (
          <div className="bb-checkout__price-warning">
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />{paymentError}
          </div>
        )}
        {threeDSError && (
          <div className="bb-checkout__price-warning">
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />{threeDSError}
          </div>
        )}
        {finalizeError && !isProcessing && (
          <div className="bb-checkout__price-warning">
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />
            {/duplicate|zaten biletlen/i.test(finalizeError)
              ? 'Biletleme işlemi zaten tamamlanmış görünüyor. Bilet sorgulama sayfasına yönlendiriliyorsunuz...'
              : finalizeError}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button type="button" className="bb-checkout__btn bb-checkout__btn--next" style={{ fontSize: 13, padding: '6px 16px' }} onClick={() => router.push('/bilet-sorgula')}>Bilet Sorgula</button>
              {!/duplicate|zaten biletlen/i.test(finalizeError) && (
                <button
                  type="button"
                  className="bb-checkout__btn bb-checkout__btn--back"
                  style={{ fontSize: 13, padding: '6px 16px' }}
                  onClick={() => {
                    if (finalizeTimeoutRef.current) { clearTimeout(finalizeTimeoutRef.current); finalizeTimeoutRef.current = null; }
                    dispatch(clearFinalizeError());
                    hasFinalized.current = false;
                  }}
                >Tekrar Dene</button>
              )}
            </div>
          </div>
        )}

        {/* ═════ TWO-COLUMN PRO LAYOUT ═════ */}
        <div className="bb-checkout__pro-grid">
          {/* ── Main Column ── */}
          <div className="bb-checkout__col-main">

          {/* Flight Summary */}
          <div className="bb-checkout__card">
            <h3 className="bb-checkout__card-title">
              <i className="fa-solid fa-plane" />
              Uçuş Özeti
            </h3>

            {/* Multi-city: show all leg flights */}
            {isMultiCity && legFlightsList.length > 0 ? (
              legFlightsList.map((legFlight, idx) => {
                const legAirlineCode = legFlight.airlineCode;
                const legLogo = getAirlineLogoUrl(legAirlineCode);
                const legBrand = getAirlineBrandStyle(legAirlineCode);
                return (
                  <div key={idx}>
                    <div className="bb-checkout__leg-label">{idx + 1}. Uçuş</div>
                    <div className="bb-checkout__flight-mini">
                      <div className="bb-checkout__flight-mini-logo"
                        style={!legLogo ? { background: legBrand.bg, color: legBrand.color, border: 'none' } : undefined}
                      >
                        {legLogo ? (
                          <Image src={legLogo} alt={legFlight.airlineName ?? 'airline'} width={36} height={36}
                            onError={(e) => {
                              const target = e.currentTarget.parentElement;
                              if (target) { target.style.background = legBrand.bg; target.style.color = legBrand.color; target.style.border = 'none'; }
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>{legAirlineCode ?? '??'}</span>
                        )}
                      </div>
                      <div className="bb-checkout__flight-mini-body">
                        <div className="bb-checkout__flight-mini-airline">
                          {legFlight.airlineName}
                          <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 8, fontSize: 13 }}>{legFlight.flightNumber}</span>
                        </div>
                        <div className="bb-checkout__flight-mini-route">
                          {legFlight.departureTime}<span className="bb-checkout__flight-mini-arrow">&rarr;</span>{legFlight.arrivalTime}
                        </div>
                        <div className="bb-checkout__flight-timeline-codes">
                          <span className="bb-checkout__flight-timeline-code">{legFlight.originCode}</span>
                          <span className="bb-checkout__flight-timeline-code">{legFlight.destinationCode}</span>
                        </div>
                        <div className="bb-checkout__flight-timeline">
                          <span className="bb-checkout__flight-timeline-dot" />
                          <div className="bb-checkout__flight-timeline-line">
                            <span className="bb-checkout__flight-timeline-plane"><i className="fa-solid fa-plane" /></span>
                          </div>
                          <span className="bb-checkout__flight-timeline-dot" />
                        </div>
                        <div className="bb-checkout__flight-mini-meta">
                          <span className="bb-checkout__flight-mini-detail">{legFlight.departureDate}</span>
                          {legFlight.durationFormatted && <span className="bb-checkout__flight-mini-duration">{legFlight.durationFormatted}</span>}
                          {legFlight.isDirect ? (
                            <span className="bb-checkout__flight-badge bb-checkout__flight-badge--direct">Direkt</span>
                          ) : (
                            <span className="bb-checkout__flight-badge bb-checkout__flight-badge--stop">{legFlight.stopText}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Single / Round-trip flights */
              <>
                <div className="bb-checkout__flight-mini">
                  <div className="bb-checkout__flight-mini-logo"
                    style={!logoPath ? { background: brandStyle.bg, color: brandStyle.color, border: 'none' } : undefined}
                  >
                    {logoPath ? (
                      <Image src={logoPath} alt={selectedFlight.airlineName ?? 'airline'} width={36} height={36}
                        onError={(e) => {
                          const target = e.currentTarget.parentElement;
                          if (target) { target.style.background = brandStyle.bg; target.style.color = brandStyle.color; target.style.border = 'none'; }
                          e.currentTarget.style.display = 'none';
                          const fallback = document.createElement('span');
                          fallback.style.fontWeight = '700'; fallback.style.fontSize = '13px'; fallback.style.letterSpacing = '1px';
                          fallback.textContent = airlineCode ?? '??';
                          target?.appendChild(fallback);
                        }}
                      />
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>{airlineCode ?? '??'}</span>
                    )}
                  </div>
                  <div className="bb-checkout__flight-mini-body">
                    <div className="bb-checkout__flight-mini-airline">
                      {selectedFlight.airlineName}
                      <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 8, fontSize: 13 }}>{selectedFlight.flightNumber}</span>
                    </div>
                    <div className="bb-checkout__flight-mini-route">
                      {selectedFlight.departureTime}<span className="bb-checkout__flight-mini-arrow">&rarr;</span>{selectedFlight.arrivalTime}
                    </div>
                    <div className="bb-checkout__flight-timeline-codes">
                      <span className="bb-checkout__flight-timeline-code">{selectedFlight.originCode}</span>
                      <span className="bb-checkout__flight-timeline-code">{selectedFlight.destinationCode}</span>
                    </div>
                    <div className="bb-checkout__flight-timeline">
                      <span className="bb-checkout__flight-timeline-dot" />
                      <div className="bb-checkout__flight-timeline-line">
                        <span className="bb-checkout__flight-timeline-plane"><i className="fa-solid fa-plane" /></span>
                      </div>
                      <span className="bb-checkout__flight-timeline-dot" />
                    </div>
                    <div className="bb-checkout__flight-mini-meta">
                      <span className="bb-checkout__flight-mini-detail">{selectedFlight.departureDate}</span>
                      {selectedFlight.durationFormatted && <span className="bb-checkout__flight-mini-duration">{selectedFlight.durationFormatted}</span>}
                      {selectedFlight.isDirect ? (
                        <span className="bb-checkout__flight-badge bb-checkout__flight-badge--direct">Direkt</span>
                      ) : (
                        <span className="bb-checkout__flight-badge bb-checkout__flight-badge--stop">{selectedFlight.stopText}</span>
                      )}
                    </div>
                  </div>
                  <div className="bb-checkout__flight-mini-right">
                    <span className="bb-checkout__flight-mini-date">{selectedFlight.departureDate}</span>
                    {selectedFlight.durationFormatted && <span className="bb-checkout__flight-mini-duration">{selectedFlight.durationFormatted}</span>}
                  </div>
                </div>
                {selectedReturnFlight && (
                  <>
                    <div className="bb-checkout__flight-mini">
                      <div className="bb-checkout__flight-mini-logo"
                        style={{ background: getAirlineBrandStyle(selectedReturnFlight.airlineCode).bg, color: getAirlineBrandStyle(selectedReturnFlight.airlineCode).color, border: 'none' }}
                      >
                        <img src={getAirlineLogoUrl(selectedReturnFlight.airlineCode) ?? ''} alt={selectedReturnFlight.airlineName ?? ''} width={36} height={36} style={{ display: 'block' }}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div className="bb-checkout__flight-mini-body">
                        <div className="bb-checkout__flight-mini-airline">
                          {selectedReturnFlight.airlineName}
                          <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 8, fontSize: 13 }}>{selectedReturnFlight.flightNumber}</span>
                        </div>
                        <div className="bb-checkout__flight-mini-route">
                          {selectedReturnFlight.departureTime}<span className="bb-checkout__flight-mini-arrow">&rarr;</span>{selectedReturnFlight.arrivalTime}
                        </div>
                        <div className="bb-checkout__flight-timeline-codes">
                          <span className="bb-checkout__flight-timeline-code">{selectedReturnFlight.originCode}</span>
                          <span className="bb-checkout__flight-timeline-code">{selectedReturnFlight.destinationCode}</span>
                        </div>
                        <div className="bb-checkout__flight-timeline">
                          <span className="bb-checkout__flight-timeline-dot" />
                          <div className="bb-checkout__flight-timeline-line">
                            <span className="bb-checkout__flight-timeline-plane"><i className="fa-solid fa-plane" /></span>
                          </div>
                          <span className="bb-checkout__flight-timeline-dot" />
                        </div>
                        <div className="bb-checkout__flight-mini-meta">
                          <span className="bb-checkout__flight-mini-detail">{selectedReturnFlight.departureDate}</span>
                          {selectedReturnFlight.durationFormatted && <span className="bb-checkout__flight-mini-duration">{selectedReturnFlight.durationFormatted}</span>}
                          {selectedReturnFlight.isDirect ? (
                            <span className="bb-checkout__flight-badge bb-checkout__flight-badge--direct">Direkt</span>
                          ) : (
                            <span className="bb-checkout__flight-badge bb-checkout__flight-badge--stop">{selectedReturnFlight.stopText}</span>
                          )}
                        </div>
                      </div>
                      <div className="bb-checkout__flight-mini-right">
                        <span className="bb-checkout__flight-mini-date">{selectedReturnFlight.departureDate}</span>
                        {selectedReturnFlight.durationFormatted && <span className="bb-checkout__flight-mini-duration">{selectedReturnFlight.durationFormatted}</span>}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            <div className="bb-checkout__price-pax">{paxSummaryText}</div>
          </div>

          {/* ──── Passenger Form ──── */}
          <PassengerForm
            passengers={passengers}
            onSubmit={handlePassengerSubmit}
            loading={updatePassengersLoading}
            isInternational={isInternational}
          />

          {/* ── Payment Method Selection ── */}
          <div className="bb-pay-methods">
            <div className="bb-pay-methods__header">
              <i className="fa-solid fa-credit-card" />
              <span>Ödeme Yöntemi Seçin</span>
            </div>
            <div className="bb-pay-methods__body">
              {/* Running Account */}
              <div
                className={`bb-payment-method ${paymentMethod === 'running_account' ? 'bb-payment-method--active' : ''}`}
                onClick={() => setPaymentMethod('running_account')}
              >
                <div className="bb-payment-method__radio" />
                <div className="bb-payment-method__icon"><i className="fa-solid fa-building-columns" /></div>
                <div className="bb-payment-method__info">
                  <p className="bb-payment-method__name">Cari Hesap ile Ödeme</p>
                  <p className="bb-payment-method__desc">Acente cari hesabınızdan tahsil edilir</p>
                </div>
              </div>

              {/* Credit Card */}
              <div
                className={`bb-payment-method ${paymentMethod === 'credit_card' ? 'bb-payment-method--active' : ''}`}
                onClick={() => setPaymentMethod('credit_card')}
              >
                <div className="bb-payment-method__radio" />
                <div className="bb-payment-method__icon"><i className="fa-regular fa-credit-card" /></div>
                <div className="bb-payment-method__info">
                  <p className="bb-payment-method__name">Kredi Kartı ile Ödeme</p>
                  <p className="bb-payment-method__desc">Visa, Mastercard, Amex</p>
                </div>
              </div>

              {/* Credit Card Form */}
              {paymentMethod === 'credit_card' && (
                <div className="bb-card-form">
                  <div className="bb-card-form__row">
                    <div className={`bb-card-form__field ${cardErrors.cardHolderName ? 'bb-card-form__field--error' : ''}`}>
                      <label className="bb-card-form__label">Kart Üzerindeki İsim</label>
                      <input type="text" className="bb-card-form__input" placeholder="AD SOYAD"
                        value={cardForm.cardHolderName}
                        onChange={e => { setCardForm(prev => ({ ...prev, cardHolderName: e.target.value })); setCardErrors(prev => ({ ...prev, cardHolderName: '' })); }}
                        maxLength={100} autoComplete="cc-name"
                      />
                      {cardErrors.cardHolderName && <span className="bb-card-form__error">{cardErrors.cardHolderName}</span>}
                    </div>
                  </div>
                  <div className="bb-card-form__row">
                    <div className={`bb-card-form__field ${cardErrors.cardNumber ? 'bb-card-form__field--error' : ''}`}>
                      <label className="bb-card-form__label">Kart Numarası</label>
                      <div className="bb-card-form__input-wrap">
                        <input type="text" inputMode="numeric" className="bb-card-form__input" placeholder="0000 0000 0000 0000"
                          value={cardForm.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                          onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 16); setCardForm(prev => ({ ...prev, cardNumber: v })); setCardErrors(prev => ({ ...prev, cardNumber: '' })); }}
                          maxLength={19} autoComplete="cc-number"
                        />
                        <i className="fa-regular fa-credit-card bb-card-form__card-icon" />
                      </div>
                      {cardErrors.cardNumber && <span className="bb-card-form__error">{cardErrors.cardNumber}</span>}
                    </div>
                  </div>
                  <div className="bb-card-form__row bb-card-form__row--triple">
                    <div className={`bb-card-form__field ${cardErrors.expiryMonth ? 'bb-card-form__field--error' : ''}`}>
                      <label className="bb-card-form__label">Ay</label>
                      <select className="bb-card-form__input bb-card-form__select" value={cardForm.expiryMonth}
                        onChange={e => { setCardForm(prev => ({ ...prev, expiryMonth: e.target.value })); setCardErrors(prev => ({ ...prev, expiryMonth: '' })); }}
                        autoComplete="cc-exp-month"
                      >
                        <option value="">Ay</option>
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      {cardErrors.expiryMonth && <span className="bb-card-form__error">{cardErrors.expiryMonth}</span>}
                    </div>
                    <div className={`bb-card-form__field ${cardErrors.expiryYear ? 'bb-card-form__field--error' : ''}`}>
                      <label className="bb-card-form__label">Yıl</label>
                      <select className="bb-card-form__input bb-card-form__select" value={cardForm.expiryYear}
                        onChange={e => { setCardForm(prev => ({ ...prev, expiryYear: e.target.value })); setCardErrors(prev => ({ ...prev, expiryYear: '' })); }}
                        autoComplete="cc-exp-year"
                      >
                        <option value="">Yıl</option>
                        {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i)).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      {cardErrors.expiryYear && <span className="bb-card-form__error">{cardErrors.expiryYear}</span>}
                    </div>
                    <div className={`bb-card-form__field ${cardErrors.cvv ? 'bb-card-form__field--error' : ''}`}>
                      <label className="bb-card-form__label">CVV</label>
                      <input type="password" inputMode="numeric" className="bb-card-form__input" placeholder="•••"
                        value={cardForm.cvv}
                        onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setCardForm(prev => ({ ...prev, cvv: v })); setCardErrors(prev => ({ ...prev, cvv: '' })); }}
                        maxLength={4} autoComplete="cc-csc"
                      />
                      {cardErrors.cvv && <span className="bb-card-form__error">{cardErrors.cvv}</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Agreement */}
          <div className={`bb-agreement ${agreementError && !agreed ? 'bb-agreement--error' : ''}`}>
            <input type="checkbox" className="bb-agreement__checkbox" id="paymentAgreement" checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); if (e.target.checked) setAgreementError(false); }}
            />
            <label htmlFor="paymentAgreement" className="bb-agreement__text">
              Satış koşullarını ve <span className="bb-agreement__link">mesafeli satış sözleşmesini</span> okudum, kabul ediyorum.
              Yolcu bilgilerinin doğruluğunu onaylıyorum.
            </label>
          </div>

          {/* Action buttons */}
          <div className="bb-checkout__actions">
            <button
              type="button"
              className="bb-checkout__btn bb-checkout__btn--next"
              disabled={isProcessing || !productId || !productItemId || !searchId}
              onClick={() => {
                const form = document.querySelector('.bb-passenger-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
            >
              {isProcessing ? 'İşlem Yapılıyor...' : <><i className="fa-solid fa-lock" />Ödemeyi Tamamla</>}
            </button>
            <button type="button" className="bb-checkout__btn bb-checkout__btn--back" onClick={() => router.push('/search-results')}
              disabled={isProcessing}>
              &larr; Geri Dön
            </button>
          </div>

          </div>

          {/* ── Sidebar: Price Summary ── */}
          <div className="bb-checkout__col-aside">
            <div className="bb-checkout__card">
              <h3 className="bb-checkout__card-title">
                <i className="fa-solid fa-receipt" />
                Fiyat Detayı
              </h3>
              <div className="bb-checkout__price-row"><span>Bilet Ücreti</span><span>{priceSummary.totalBaseFare.toFixed(2)} {priceSummary.currency}</span></div>
              <div className="bb-checkout__price-row"><span>Vergiler &amp; Harçlar</span><span>{priceSummary.totalTaxes.toFixed(2)} {priceSummary.currency}</span></div>
              {priceSummary.totalServiceFee > 0 && (
                <div className="bb-checkout__price-row"><span>Hizmet Bedeli</span><span>{priceSummary.totalServiceFee.toFixed(2)} {priceSummary.currency}</span></div>
              )}
              <div className="bb-checkout__price-row bb-checkout__price-row--total"><span>Genel Toplam</span><span>{priceSummary.grandTotal.toFixed(2)} {priceSummary.currency}</span></div>
              <div className="bb-checkout__price-pax">{paxSummaryText}</div>
            </div>

            {/* Secure badge */}
            <div className="bb-pay-price__secure">
              <i className="fa-solid fa-shield-halved" />
              <span>256-bit SSL ile güvenli ödeme</span>
            </div>
          </div>
        </div>

        {/* Mobile bottom sticky bar */}
        <div className="bb-checkout__bottom-bar">
          <div>
            <div className="bb-checkout__bottom-bar-info">{paxSummaryText} toplam tutar</div>
            <div className="bb-checkout__bottom-bar-price">{priceSummary.grandTotal.toFixed(2)} {priceSummary.currency}</div>
          </div>
          <button
            type="button"
            className="bb-checkout__bottom-bar-btn"
            disabled={isProcessing || !productId || !productItemId || !searchId}
            onClick={() => {
              const form = document.querySelector('.bb-passenger-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
          >
            {isProcessing ? 'İşlem...' : 'Öde'}
          </button>
        </div>
      </main>
      <FooterOne />

      {/* ── Loading Overlay — same design as flight search ── */}
      {isProcessing && (
        <div className="bb-flight-loading-overlay">
          <div className="bb-flight-loading__card">
            <div className="bb-flight-loading__logo">
              <span style={{ color: '#DC2626' }}>Ata</span>
              <span style={{ color: '#0F172A' }}>Bilet</span>
            </div>
            <div className="bb-flight-loading__bar">
              <div className="bb-flight-loading__bar-fill"></div>
            </div>
            <p className="bb-flight-loading__text">
              Uçuşunuz rezerve ediliyor, Lütfen bekleyiniz<span className="bb-flight-loading__dots"></span>
            </p>
          </div>
        </div>
      )}

      {/* Fiyat Değişikliği Modalı */}
      {priceChangedResult && (
        <div className="bb-modal-overlay" role="dialog" aria-modal="true" aria-label="Fiyat degisikligi bildirimi">
          <div className="bb-modal bb-modal--price-change">
            <div className="bb-modal__header">
              <h3 className="bb-modal__title">Fiyat Guncellemesi</h3>
            </div>
            <div className="bb-modal__body">
              <p>Sectiginiz ucusun fiyati havayolu tarafindan guncellenmistir.</p>
              <div className="bb-modal__price-compare">
                {priceChangedResult.oldPrice > 0 && (
                  <div className="bb-modal__price-old">
                    <span className="bb-modal__price-label">Onceki Fiyat</span>
                    <span className="bb-modal__price-amount bb-modal__price-amount--old">
                      {priceChangedResult.oldPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {priceChangedResult.currency ?? 'TRY'}
                    </span>
                  </div>
                )}
                <div className="bb-modal__price-new">
                  <span className="bb-modal__price-label">Yeni Fiyat</span>
                  <span className="bb-modal__price-amount bb-modal__price-amount--new">
                    {priceChangedResult.totalFare?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {priceChangedResult.currency ?? 'TRY'}
                  </span>
                </div>
              </div>
              <p className="bb-modal__price-note">Devam etmek istiyor musunuz?</p>
            </div>
            <div className="bb-modal__footer">
              <button className="bb-modal__btn bb-modal__btn--secondary" onClick={handleRejectPriceChange}>
                Vazgec, Aramaya Don
              </button>
              <button className="bb-modal__btn bb-modal__btn--primary" onClick={handleAcceptPriceChange}>
                Yeni Fiyatla Devam Et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
