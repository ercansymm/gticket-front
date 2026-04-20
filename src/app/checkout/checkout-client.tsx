"use client";

import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import { useCurrency } from '@/context/CurrencyContext';
import AirlineLogo from '@/components/common/AirlineLogo';

export default function CheckoutClient() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const { showWarning: sessionWarning, dismissWarning: dismissSessionWarning } = useSessionTimeout();
  const { formatPrice, currency: displayCurrency } = useCurrency();
  const [priceChangedResult, setPriceChangedResult] = useState<MakePreBookingResponse | null>(null);

  /* ── Payment state ── */
  const [paymentMethod, setPaymentMethod] = useState<'running_account' | 'credit_card'>('running_account');
  const [agreed, setAgreed] = useState(false);
  const [agreementError, setAgreementError] = useState(false);
  const [kvkkAgreed, setKvkkAgreed] = useState(false);
  const [showKvkkModal, setShowKvkkModal] = useState(false);
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

  /* ── Backend auto-finalized: skip separate finalize call ── */
  useEffect(() => {
    if (isPaymentSuccessful && paymentResult?.autoFinalized) {
      hasFinalized.current = true;
      setIsProcessing(false);
      dispatch(setStep('confirmation'));
      router.push('/checkout/success');
    }
  }, [isPaymentSuccessful, paymentResult?.autoFinalized, dispatch, router]);

  useEffect(() => {
    if (isPaymentSuccessful && !paymentResult?.autoFinalized && searchId && !hasFinalized.current && !finalizeResult && !finalizeError) {
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
  }, [isPaymentSuccessful, paymentResult?.autoFinalized, searchId, dispatch, finalizeResult, finalizeError]);

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

  // Multi-city: ordered list of leg flights
  const isMultiCity = searchParams?.flightType === 'MP';
  const legFlightsList = isMultiCity
    ? Object.keys(selectedLegFlights)
        .map(Number)
        .sort((a, b) => a - b)
        .map(idx => selectedLegFlights[idx])
        .filter(Boolean)
    : [];

  /* ── Helpers ── */
  const triggerPassengerSubmit = () => {
    const form = document.querySelector('.bb-passenger-form') as HTMLFormElement | null;
    if (form) form.requestSubmit();
  };

  /* ═══════════════════════════════════════════════════
     DESIGN — clean, minimal, single-accent
     ═══════════════════════════════════════════════════ */
  const F = `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

  const T = {
    bg: '#f8f9fa',
    surface: '#ffffff',
    border: '#dadce0',
    borderLight: '#e8eaed',
    text: '#202124',
    textSec: '#5f6368',
    textMuted: '#80868b',
    accent: '#1a73e8',
    accentLight: '#e8f0fe',
    accentDark: '#1557b0',
    error: '#d93025',
    errorBg: '#fce8e6',
    warnBg: '#fef7e0',
    warnText: '#b06000',
    warnBorder: '#f5e6b8',
  };

  /* ── Computed ── */
  const tripTypeLabel =
    searchParams?.flightType === 'RT' ? 'Gidiş-Dönüş'
    : searchParams?.flightType === 'MP' ? 'Çoklu Rota'
    : 'Tek Yön';
  const headerOriginCity = airports.find(a => a.code === selectedFlight.originCode)?.cityTr ?? selectedFlight.originCode;
  const headerDestCity = (() => {
    if (isMultiCity && legFlightsList.length > 0) {
      const last = legFlightsList[legFlightsList.length - 1];
      return airports.find(a => a.code === last?.destinationCode)?.cityTr ?? last?.destinationCode ?? '';
    }
    return airports.find(a => a.code === selectedFlight.destinationCode)?.cityTr ?? selectedFlight.destinationCode;
  })();
  const headerDateText = selectedFlight.departureDate ?? '';

  /* ── Flight row ── */
  const renderFlightRow = (flight: typeof selectedFlight, legLabel?: string, isFirst?: boolean) => {
    if (!flight) return null;
    const airCode = flight.airlineCode ?? '??';
    const originCity = airports.find(a => a.code === flight.originCode)?.cityTr ?? '';
    const destCity = airports.find(a => a.code === flight.destinationCode)?.cityTr ?? '';
    return (
      <div style={{
        paddingTop: isFirst ? 0 : 16,
        marginTop: isFirst ? 0 : 16,
        borderTop: isFirst ? 'none' : `1px solid ${T.borderLight}`,
      }}>
        {legLabel && (
          <div style={{
            fontSize: 11, fontWeight: 600, color: T.accent,
            letterSpacing: '0.04em', textTransform: 'uppercase' as const,
            marginBottom: 12, fontFamily: F,
          }}>
            {legLabel}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <AirlineLogo code={airCode} size={36} />
          <div style={{ minWidth: 70 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: T.text, lineHeight: 1, fontFamily: F }}>{flight.departureTime}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3, fontFamily: F }}>{flight.originCode}{originCity ? ` · ${originCity}` : ''}</div>
          </div>
          <div style={{ flex: 1, minWidth: 100, textAlign: 'center', padding: '0 8px' }}>
            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6, fontFamily: F }}>{flight.durationFormatted ?? ''}</div>
            <div style={{ position: 'relative', height: 1, background: T.border }}>
              <div style={{ position: 'absolute', right: -3, top: -3, width: 7, height: 7, borderRadius: '50%', background: T.accent }} />
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6, fontFamily: F }}>
              {flight.flightNumber}{flight.cabinClass ? ` · ${flight.cabinClass}` : ''}
            </div>
            {flight.departureDate && (
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, fontFamily: F }}>{flight.departureDate}</div>
            )}
          </div>
          <div style={{ minWidth: 70, textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: T.text, lineHeight: 1, fontFamily: F }}>{flight.arrivalTime}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3, fontFamily: F }}>{flight.destinationCode}{destCity ? ` · ${destCity}` : ''}</div>
          </div>
        </div>
      </div>
    );
  };

  const payDisabled = isProcessing || !productId || !productItemId || !searchId || !kvkkAgreed;

  /* ═══════════ RENDER ═══════════ */
  return (
    <>
      <HeaderOne />
      <main style={{ minHeight: '100vh', background: T.bg, fontFamily: F, color: T.textSec }}>

        {/* ── Top strip ── */}
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.borderLight}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: F }}>
                {headerOriginCity} &#8594; {headerDestCity}
              </span>
              <span style={{ fontSize: 13, color: T.textMuted, marginLeft: 12, fontFamily: F }}>
                {tripTypeLabel}{headerDateText ? ` · ${headerDateText}` : ''}{paxSummaryText ? ` · ${paxSummaryText}` : ''}
              </span>
            </div>
            {!session?.user && (
              <a href="/login?callbackUrl=/checkout"
                style={{ fontSize: 13, color: T.accent, fontWeight: 500, textDecoration: 'none', fontFamily: F }}>
                Giriş yap
              </a>
            )}
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 120px 20px' }}>

          {/* ── Alerts ── */}
          {sessionWarning && (
            <div style={{
              background: T.warnBg, border: `1px solid ${T.warnBorder}`,
              color: T.warnText, padding: '10px 16px', borderRadius: 8,
              fontSize: 13, fontFamily: F, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ flex: 1 }}>Oturumunuz sona ermek üzere. Lütfen işleminizi tamamlayın.</span>
              <button type="button" onClick={dismissSessionWarning}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.warnText, fontSize: 16, lineHeight: 1, padding: 2 }}
                aria-label="Kapat">&#10005;</button>
            </div>
          )}

          {(isPriceChanged || (!productId || !productItemId || !searchId) || updatePassengersError || (preBookingError && !isProcessing) || (paymentError && !isProcessing) || threeDSError || (finalizeError && !isProcessing)) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {isPriceChanged && (
                <div style={{ background: T.warnBg, border: `1px solid ${T.warnBorder}`, color: T.warnText, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontFamily: F }}>
                  Fiyat güncellenmiştir. Lütfen yeni fiyatı kontrol ediniz.
                </div>
              )}
              {(!productId || !productItemId || !searchId) && (
                <div style={{ background: T.errorBg, border: `1px solid #f5c6c2`, color: '#c5221f', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontFamily: F }}>
                  Uçuş tahsis bilgileri eksik. Lütfen geri dönüp tekrar uçuş seçiniz.
                </div>
              )}
              {updatePassengersError && (
                <div style={{ background: T.errorBg, border: `1px solid #f5c6c2`, color: '#c5221f', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontFamily: F }}>{updatePassengersError}</div>
              )}
              {preBookingError && !isProcessing && (
                <div style={{ background: T.errorBg, border: `1px solid #f5c6c2`, color: '#c5221f', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontFamily: F }}>
                  <div>{preBookingError}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button type="button" disabled={preBookingLoading} onClick={triggerPassengerSubmit}
                      style={{ background: T.accent, color: '#fff', border: 'none', padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer', fontFamily: F }}>
                      Tekrar dene
                    </button>
                    <button type="button" onClick={() => router.push('/search-results')}
                      style={{ background: T.surface, color: T.textSec, border: `1px solid ${T.border}`, padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer', fontFamily: F }}>
                      Farklı uçuş seç
                    </button>
                  </div>
                </div>
              )}
              {paymentError && !isProcessing && (
                <div style={{ background: T.errorBg, border: `1px solid #f5c6c2`, color: '#c5221f', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontFamily: F }}>{paymentError}</div>
              )}
              {threeDSError && (
                <div style={{ background: T.errorBg, border: `1px solid #f5c6c2`, color: '#c5221f', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontFamily: F }}>{threeDSError}</div>
              )}
              {finalizeError && !isProcessing && (
                <div style={{ background: T.errorBg, border: `1px solid #f5c6c2`, color: '#c5221f', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontFamily: F }}>
                  <div>
                    {/duplicate|zaten biletlen/i.test(finalizeError)
                      ? 'Biletleme işlemi zaten tamamlanmış görünüyor. Bilet sorgulama sayfasına yönlendiriliyorsunuz...'
                      : finalizeError}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button type="button" onClick={() => router.push('/bilet-sorgula')}
                      style={{ background: T.accent, color: '#fff', border: 'none', padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer', fontFamily: F }}>
                      Bilet sorgula
                    </button>
                    {!/duplicate|zaten biletlen/i.test(finalizeError) && (
                      <button type="button"
                        style={{ background: T.surface, color: T.textSec, border: `1px solid ${T.border}`, padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer', fontFamily: F }}
                        onClick={() => {
                          if (finalizeTimeoutRef.current) { clearTimeout(finalizeTimeoutRef.current); finalizeTimeoutRef.current = null; }
                          dispatch(clearFinalizeError());
                          hasFinalized.current = false;
                        }}>
                        Tekrar dene
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ Layout ═══ */}
          <div className="chk-layout" style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>

            {/* ─── LEFT ─── */}
            <div className="chk-left" style={{ flex: 1, minWidth: 0, width: '100%' }}>

              {/* Flight info */}
              <div style={{
                background: T.surface, border: `1px solid ${T.borderLight}`, borderRadius: 8,
                padding: '18px 20px', marginBottom: 16,
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14, fontFamily: F }}>Uçuş Bilgileri</div>
                {isMultiCity && legFlightsList.length > 0 ? (
                  legFlightsList.map((legFlight, idx) => (
                    <div key={idx}>{renderFlightRow(legFlight, `${idx + 1}. Uçuş`, idx === 0)}</div>
                  ))
                ) : (
                  <>
                    {renderFlightRow(selectedFlight, selectedReturnFlight ? 'Gidiş' : undefined, true)}
                    {selectedReturnFlight && renderFlightRow(selectedReturnFlight, 'Dönüş', false)}
                  </>
                )}
              </div>

              {/* Passenger form */}
              <div style={{
                background: T.surface, border: `1px solid ${T.borderLight}`, borderRadius: 8,
                padding: '18px 20px', marginBottom: 16,
              }}>
                <PassengerForm
                  passengers={passengers}
                  onSubmit={handlePassengerSubmit}
                  loading={updatePassengersLoading}
                  isInternational={isInternational}
                />
              </div>

              {/* Payment */}
              <div style={{
                background: T.surface, border: `1px solid ${T.borderLight}`, borderRadius: 8,
                padding: '18px 20px', marginBottom: 16,
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14, fontFamily: F }}>Ödeme Yöntemi</div>

                <div style={{ display: 'flex', gap: 10, marginBottom: paymentMethod === 'credit_card' ? 18 : 0 }}>
                  {([
                    { id: 'running_account' as const, label: 'Cari Hesap' },
                    { id: 'credit_card' as const, label: 'Kredi / Banka Kartı' },
                  ]).map(opt => {
                    const sel = paymentMethod === opt.id;
                    return (
                      <button key={opt.id} type="button" onClick={() => setPaymentMethod(opt.id)}
                        style={{
                          flex: 1, padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                          fontSize: 13, fontWeight: sel ? 500 : 400, fontFamily: F,
                          border: sel ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                          background: sel ? T.accentLight : T.surface,
                          color: sel ? T.accent : T.textSec,
                          transition: 'all .15s',
                        }}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'credit_card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSec, marginBottom: 5, fontFamily: F }}>Kart üzerindeki isim</label>
                      <input type="text" placeholder="Ad Soyad"
                        value={cardForm.cardHolderName}
                        onChange={e => { setCardForm(p => ({ ...p, cardHolderName: e.target.value })); setCardErrors(p => ({ ...p, cardHolderName: '' })); }}
                        maxLength={100} autoComplete="cc-name"
                        style={{
                          width: '100%', height: 44, fontSize: 14, padding: '0 12px',
                          border: `1px solid ${cardErrors.cardHolderName ? T.error : T.border}`,
                          borderRadius: 8, background: T.surface, color: T.text, outline: 'none',
                          fontFamily: F, boxSizing: 'border-box' as const,
                        }} />
                      {cardErrors.cardHolderName && <div style={{ fontSize: 12, color: T.error, marginTop: 4, fontFamily: F }}>{cardErrors.cardHolderName}</div>}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSec, marginBottom: 5, fontFamily: F }}>Kart numarası</label>
                      <input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000"
                        value={cardForm.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                        onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 16); setCardForm(p => ({ ...p, cardNumber: v })); setCardErrors(p => ({ ...p, cardNumber: '' })); }}
                        maxLength={19} autoComplete="cc-number"
                        style={{
                          width: '100%', height: 44, fontSize: 14, padding: '0 12px',
                          border: `1px solid ${cardErrors.cardNumber ? T.error : T.border}`,
                          borderRadius: 8, background: T.surface, color: T.text, outline: 'none',
                          fontFamily: F, boxSizing: 'border-box' as const, letterSpacing: '0.04em',
                        }} />
                      {cardErrors.cardNumber && <div style={{ fontSize: 12, color: T.error, marginTop: 4, fontFamily: F }}>{cardErrors.cardNumber}</div>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSec, marginBottom: 5, fontFamily: F }}>Ay</label>
                        <select value={cardForm.expiryMonth}
                          onChange={e => { setCardForm(p => ({ ...p, expiryMonth: e.target.value })); setCardErrors(p => ({ ...p, expiryMonth: '' })); }}
                          autoComplete="cc-exp-month" style={{
                            width: '100%', height: 44, fontSize: 14, padding: '0 10px',
                            border: `1px solid ${cardErrors.expiryMonth ? T.error : T.border}`,
                            borderRadius: 8, background: T.surface, color: T.text, fontFamily: F, boxSizing: 'border-box' as const,
                          }}>
                          <option value="">Ay</option>
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        {cardErrors.expiryMonth && <div style={{ fontSize: 12, color: T.error, marginTop: 4, fontFamily: F }}>{cardErrors.expiryMonth}</div>}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSec, marginBottom: 5, fontFamily: F }}>Yıl</label>
                        <select value={cardForm.expiryYear}
                          onChange={e => { setCardForm(p => ({ ...p, expiryYear: e.target.value })); setCardErrors(p => ({ ...p, expiryYear: '' })); }}
                          autoComplete="cc-exp-year" style={{
                            width: '100%', height: 44, fontSize: 14, padding: '0 10px',
                            border: `1px solid ${cardErrors.expiryYear ? T.error : T.border}`,
                            borderRadius: 8, background: T.surface, color: T.text, fontFamily: F, boxSizing: 'border-box' as const,
                          }}>
                          <option value="">Yıl</option>
                          {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i)).map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                        {cardErrors.expiryYear && <div style={{ fontSize: 12, color: T.error, marginTop: 4, fontFamily: F }}>{cardErrors.expiryYear}</div>}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: T.textSec, marginBottom: 5, fontFamily: F }}>CVC</label>
                        <input type="password" inputMode="numeric" placeholder="***"
                          value={cardForm.cvv}
                          onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setCardForm(p => ({ ...p, cvv: v })); setCardErrors(p => ({ ...p, cvv: '' })); }}
                          maxLength={4} autoComplete="cc-csc"
                          style={{
                            width: '100%', height: 44, fontSize: 14, padding: '0 12px',
                            border: `1px solid ${cardErrors.cvv ? T.error : T.border}`,
                            borderRadius: 8, background: T.surface, color: T.text, outline: 'none',
                            fontFamily: F, boxSizing: 'border-box' as const,
                          }} />
                        {cardErrors.cvv && <div style={{ fontSize: 12, color: T.error, marginTop: 4, fontFamily: F }}>{cardErrors.cvv}</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Agreements */}
              <div style={{
                background: T.surface, border: `1px solid ${T.borderLight}`, borderRadius: 8,
                padding: '18px 20px', marginBottom: 16,
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 12, fontFamily: F }}>Sözleşmeler</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label htmlFor="paymentAgreement" className="bb-agreement" style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                    borderRadius: 6, cursor: 'pointer',
                    border: agreementError && !agreed ? `1px solid #f5c6c2` : '1px solid transparent',
                    background: agreementError && !agreed ? T.errorBg : 'transparent',
                    transition: 'all .1s',
                  }}>
                    <input type="checkbox" id="paymentAgreement" checked={agreed}
                      onChange={(e) => { setAgreed(e.target.checked); if (e.target.checked) setAgreementError(false); }}
                      style={{ marginTop: 2, width: 16, height: 16, accentColor: T.accent, flexShrink: 0, cursor: 'pointer' }} />
                    <span style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6, fontFamily: F }}>
                      Satış koşullarını ve{' '}
                      <span style={{ color: T.accent, fontWeight: 500, cursor: 'pointer' }}>mesafeli satış sözleşmesini</span>{' '}
                      okudum, kabul ediyorum. Yolcu bilgilerinin doğruluğunu onaylıyorum.
                    </span>
                  </label>
                  <label htmlFor="kvkkConsent" style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                    borderRadius: 6, cursor: 'pointer',
                  }}>
                    <input type="checkbox" id="kvkkConsent" checked={kvkkAgreed}
                      onChange={(e) => setKvkkAgreed(e.target.checked)}
                      style={{ marginTop: 2, width: 16, height: 16, accentColor: T.accent, flexShrink: 0, cursor: 'pointer' }} />
                    <span style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6, fontFamily: F }}>
                      <button type="button" onClick={(e) => { e.preventDefault(); setShowKvkkModal(true); }}
                        style={{ background: 'none', border: 'none', padding: 0, color: T.accent, cursor: 'pointer', fontWeight: 500, fontSize: 'inherit', fontFamily: 'inherit' }}>
                        KVKK Aydınlatma Metni
                      </button>
                      &apos;ni okudum ve kabul ediyorum.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* ─── RIGHT ─── */}
            <aside className="chk-sidebar" style={{ width: '100%', minWidth: 0 }}>
              <div style={{
                background: T.surface, border: `1px solid ${T.borderLight}`, borderRadius: 8,
                padding: '18px 20px',
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14, fontFamily: F }}>Fiyat Özeti</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {paxCounts.adult > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, fontFamily: F, borderBottom: `1px solid ${T.borderLight}` }}>
                      <span style={{ color: T.textMuted }}>{paxCounts.adult} &#215; Yetişkin</span>
                      <span style={{ color: T.text, fontWeight: 500 }}>{formatPrice(priceSummary.totalBaseFare)}</span>
                    </div>
                  )}
                  {paxCounts.child > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, fontFamily: F, borderBottom: `1px solid ${T.borderLight}` }}>
                      <span style={{ color: T.textMuted }}>{paxCounts.child} &#215; Çocuk</span>
                      <span style={{ color: T.text, fontWeight: 500 }}>—</span>
                    </div>
                  )}
                  {paxCounts.infant > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, fontFamily: F, borderBottom: `1px solid ${T.borderLight}` }}>
                      <span style={{ color: T.textMuted }}>{paxCounts.infant} &#215; Bebek</span>
                      <span style={{ color: T.text, fontWeight: 500 }}>—</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, fontFamily: F, borderBottom: `1px solid ${T.borderLight}` }}>
                    <span style={{ color: T.textMuted }}>Vergiler ve harçlar</span>
                    <span style={{ color: T.text, fontWeight: 500 }}>{formatPrice(priceSummary.totalTaxes)}</span>
                  </div>
                  {priceSummary.totalServiceFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, fontFamily: F, borderBottom: `1px solid ${T.borderLight}` }}>
                      <span style={{ color: T.textMuted }}>Hizmet bedeli</span>
                      <span style={{ color: T.text, fontWeight: 500 }}>{formatPrice(priceSummary.totalServiceFee)}</span>
                    </div>
                  )}
                </div>

                <div style={{
                  marginTop: 14, paddingTop: 14,
                  borderTop: `1px solid ${T.border}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: F }}>Toplam</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: F, letterSpacing: '-0.02em' }}>
                    {formatPrice(priceSummary.grandTotal)}
                  </span>
                </div>

                {displayCurrency !== 'TRY' && (
                  <div style={{ marginTop: 6, fontSize: 11, color: T.textMuted, fontFamily: F }}>
                    Ödeme {priceSummary.grandTotal.toFixed(2)} TRY olarak tahsil edilecektir.
                  </div>
                )}
              </div>

              <button type="button" className="chk-desktop-pay"
                disabled={payDisabled}
                onClick={triggerPassengerSubmit}
                style={{
                  width: '100%', padding: '14px 20px', marginTop: 12,
                  background: payDisabled ? '#a8c7fa' : T.accent,
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontSize: 15, fontWeight: 600, cursor: payDisabled ? 'not-allowed' : 'pointer',
                  fontFamily: F, opacity: isProcessing ? 0.8 : 1,
                  transition: 'background .15s',
                }}>
                {isProcessing ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
              </button>

              <div style={{
                marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontSize: 11, color: T.textMuted, fontFamily: F,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                256-bit SSL ile güvenli ödeme
              </div>
            </aside>
          </div>
        </div>

        {/* Mobile bottom bar */}
        <div className="chk-mobile-bar" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: T.surface, borderTop: `1px solid ${T.border}`,
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 11, color: T.textMuted, fontFamily: F }}>Toplam</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: F }}>
              {formatPrice(priceSummary.grandTotal)}
            </div>
          </div>
          <button type="button"
            disabled={payDisabled}
            onClick={triggerPassengerSubmit}
            style={{
              background: payDisabled ? '#a8c7fa' : T.accent,
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '11px 24px', fontSize: 14, fontWeight: 600,
              cursor: payDisabled ? 'not-allowed' : 'pointer', fontFamily: F,
            }}>
            {isProcessing ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
          </button>
        </div>

        <style jsx>{`
          .chk-mobile-bar { display: flex; }
          .chk-desktop-pay { display: block; }
          @media (min-width: 1024px) {
            :global(.chk-layout) { flex-direction: row !important; }
            :global(.chk-sidebar) { width: 360px !important; flex-shrink: 0; position: sticky; top: 20px; align-self: flex-start; }
            .chk-mobile-bar { display: none !important; }
          }
          @media (max-width: 1023px) {
            :global(main) { padding-bottom: 80px !important; }
          }
        `}</style>
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
              Biletiniz en kısa sürede hazır olacak, Lütfen bekleyiniz<span className="bb-flight-loading__dots"></span>
            </p>
          </div>
        </div>
      )}

      {/* KVKK Modal */}
      {showKvkkModal && (
        <div className="bb-modal-overlay" role="dialog" aria-modal="true" aria-label="KVKK Aydinlatma Metni">
          <div className="bb-modal bb-kvkk-modal">
            <div className="bb-kvkk-modal__header">
              <h3 className="bb-kvkk-modal__title">KVKK Aydınlatma Metni</h3>
              <button type="button" className="bb-kvkk-modal__close" onClick={() => setShowKvkkModal(false)} aria-label="Kapat">&times;</button>
            </div>
            <div className="bb-kvkk-modal__body">
              <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca, kişisel verileriniz veri sorumlusu olarak ATABİLET tarafından aşağıda açıklanan kapsamda işlenebilecektir.</p>
              <h4>Kişisel Verilerin İşlenme Amacı</h4>
              <p>Toplanan kişisel verileriniz; uçak bileti satış işlemlerinin gerçekleştirilmesi, yasal yükümlülüklerin yerine getirilmesi, müşteri ilişkileri yönetimi ve hizmet kalitesinin artırılması amacıyla işlenmektedir.</p>
              <h4>İşlenen Kişisel Veriler</h4>
              <p>Ad, soyad, T.C. kimlik numarası, pasaport numarası, doğum tarihi, cinsiyet, e-posta adresi, telefon numarası, adres bilgileri ve ödeme bilgileri.</p>
              <h4>Kişisel Verilerin Aktarılması</h4>
              <p>Kişisel verileriniz; bilet satış işleminin tamamlanması amacıyla havayolu şirketleri, ödeme kuruluşları ve yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına aktarılabilecektir.</p>
              <h4>Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h4>
              <p>Kişisel verileriniz, internet sitemiz üzerinden elektronik ortamda toplanmakta olup, KVKK&apos;nın 5(2) maddesi kapsamında işlenmektedir.</p>
              <h4>Haklarınız</h4>
              <p>KVKK&apos;nın 11. maddesi gereği; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme haklarına sahipsiniz.</p>
            </div>
            <div className="bb-kvkk-modal__footer">
              <button type="button" className="bb-kvkk-modal__btn" onClick={() => setShowKvkkModal(false)}>Kapat</button>
            </div>
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
                      {formatPrice(priceChangedResult.oldPrice)}
                    </span>
                  </div>
                )}
                <div className="bb-modal__price-new">
                  <span className="bb-modal__price-label">Yeni Fiyat</span>
                  <span className="bb-modal__price-amount bb-modal__price-amount--new">
                    {formatPrice(priceChangedResult.totalFare ?? 0)}
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