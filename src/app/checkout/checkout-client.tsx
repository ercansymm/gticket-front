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
import './checkout.css';

/* ─────────── Icons (inline SVG) ─────────── */
const IconArrow = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconAlert = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
/* Uçak — sağa bakıyor (gidiş yönü) */
const IconPlane = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16v-2l-8-5V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(90 12 12)" />
  </svg>
);

const IconClose = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const IconShield = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconLock = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/* Tarih: "2026-05-15" veya "15 May 2026" → "15.05.2026" */
function formatDateDDMMYYYY(input?: string | null): string {
  if (!input) return '';
  // ISO format 2026-05-15
  const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`;
  // Already dd.mm.yyyy
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(input)) return input;
  // Try native Date parse
  const d = new Date(input);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }
  return input;
}

export default function CheckoutClient() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const { showWarning: sessionWarning, dismissWarning: dismissSessionWarning } = useSessionTimeout();
  const { formatPrice, currency: displayCurrency } = useCurrency();
  const [priceChangedResult, setPriceChangedResult] = useState<MakePreBookingResponse | null>(null);

  /* ── Payment state ── */
  const [paymentMethod] = useState<'credit_card'>('credit_card');
  const [agreed, setAgreed] = useState(false);
  const [agreementError, setAgreementError] = useState(false);
  const [kvkkAgreed, setKvkkAgreed] = useState(false);
  const [showKvkkModal, setShowKvkkModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(2);
  const [cardForm, setCardForm] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [threeDSError, setThreeDSError] = useState<string | null>(null);
  const hasFinalized = useRef(false);
  const finalizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    allocateResult, selectedFlight, selectedReturnFlight, selectedLegFlights,
    searchId: allocateSearchId, searchResults, selectedBrandedFareItemId, searchParams,
  } = useSelector((state: RootState) => state.flight);
  const searchId = allocateSearchId || searchResults?.searchId || null;

  const {
    updatePassengersLoading, updatePassengersError,
    preBookingLoading, preBookingError,
  } = useSelector((state: RootState) => state.booking);

  const {
    paymentResult, paymentError,
    finalizeResult, finalizeError,
    is3DSecureRequired, threeDSecureUrl, threeDSecureHtml,
  } = useSelector((state: RootState) => state.payment);

  const finalizeResultRef = useRef(finalizeResult);
  finalizeResultRef.current = finalizeResult;

  useEffect(() => { if (!allocateResult) router.push('/'); }, [allocateResult, router]);
  useEffect(() => { dispatch(setStep('passenger')); }, [dispatch]);

  const airBookings = allocateResult?.airBookings ?? [];
  const passengers = allocateResult?.passengers ?? [];
  const isPriceChanged = allocateResult?.isPriceChanged ?? false;
  const firstBooking = airBookings[0];
  const productId = firstBooking?.productId ?? '';
  const productItemId = firstBooking?.bookingItems?.[0]?.productItemId ?? '';

  const brandedFareItemId =
    selectedBrandedFareItemId
    ?? firstBooking?.segments?.[0]?.selectedBrandedFareItemId
    ?? firstBooking?.brandedFareItems?.[0]?.brandedFareItemId
    ?? '';

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
  ].filter(Boolean).join(' · ');

  const isInternational = useMemo(() => {
    if (searchParams?.originCountryCode && searchParams?.destinationCountryCode) {
      return searchParams.originCountryCode !== searchParams.destinationCountryCode;
    }
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
    const flightTypes = airBookings.map(ab => ab.flightType?.toUpperCase() ?? '');
    if (flightTypes.some(ft => ft === 'I' || ft === 'INTERNATIONAL')) return true;
    if (flightTypes.some(ft => ft === 'D' || ft === 'DOMESTIC')) return false;
    return false;
  }, [searchParams, airBookings, selectedFlight]);

  const validateCard = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!cardForm.cardHolderName.trim() || cardForm.cardHolderName.trim().length < 3)
      errs.cardHolderName = 'Kart sahibi adı gereklidir';
    if (!/^\d{15,16}$/.test(cardForm.cardNumber.replace(/\s/g, '')))
      errs.cardNumber = 'Geçerli bir kart numarası giriniz';
    if (!/^(0[1-9]|1[0-2])$/.test(cardForm.expiryMonth)) errs.expiryMonth = 'Geçersiz ay';
    if (!/^\d{4}$/.test(cardForm.expiryYear) || parseInt(cardForm.expiryYear) < new Date().getFullYear())
      errs.expiryYear = 'Geçersiz yıl';
    if (!/^\d{3,4}$/.test(cardForm.cvv)) errs.cvv = 'Geçersiz CVV';
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  }, [cardForm]);

  /* Aktif adım otomatik takibi */
  useEffect(() => {
    const cardFilled = cardForm.cardHolderName && cardForm.cardNumber && cardForm.expiryMonth && cardForm.expiryYear && cardForm.cvv;
    if (!agreed || !kvkkAgreed) {
      if (cardFilled) setActiveStep(4);
      else setActiveStep(3);
    } else {
      setActiveStep(4);
    }
  }, [cardForm, agreed, kvkkAgreed]);

  /* 3D Secure flow */
  useEffect(() => {
    if (is3DSecureRequired && (threeDSecureUrl || threeDSecureHtml)) {
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
          setIsProcessing(false);
          setThreeDSError('Tarayıcınız popup penceresini engelledi. Lütfen popup engelleyiciyi devre dışı bırakıp tekrar deneyin.');
        }
      }
    }
  }, [is3DSecureRequired, threeDSecureUrl, threeDSecureHtml, searchId, paymentResult]);

  const isPaymentSuccessful = paymentResult && paymentResult.hasError === false &&
    paymentResult.isPaymentSuccessful === true && !paymentResult.is3DSecureRequired;

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

  useEffect(() => { return () => { if (finalizeTimeoutRef.current) clearTimeout(finalizeTimeoutRef.current); }; }, []);

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

  useEffect(() => {
    if (finalizeError && /duplicate|zaten biletlen/i.test(finalizeError) && searchId) {
      if (finalizeTimeoutRef.current) { clearTimeout(finalizeTimeoutRef.current); finalizeTimeoutRef.current = null; }
      setIsProcessing(false);
      const timer = setTimeout(() => { router.push('/bilet-sorgula'); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [finalizeError, searchId, router]);

  useEffect(() => {
    if (paymentError || (finalizeError && !/duplicate|zaten biletlen/i.test(finalizeError))) {
      setIsProcessing(false);
    }
  }, [paymentError, finalizeError]);

  const submitRef = useRef(false);
  const handlePassengerSubmit = useCallback(
    async (passengerItems: PassengerItem[], contact: ContactInfo) => {
      if (submitRef.current) return;
      if (!searchId || !productId || !productItemId) {
        console.error('Missing booking data:', { searchId: !!searchId, productId: !!productId, productItemId: !!productItemId });
        return;
      }
      if (!agreed) {
        setAgreementError(true);
        setTimeout(() => {
          const el = document.querySelector('.chk-agree');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
      if (paymentMethod === 'credit_card' && !validateCard()) {
        setTimeout(() => {
          const el = document.querySelector('.chk-input--error');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }

      submitRef.current = true;
      setIsProcessing(true);
      dispatch(setPassengers(passengerItems));
      dispatch(setContactInfo(contact));

      try {
        await dispatch(updatePassengersThunk({
          searchId, productId, productItemId,
          passengers: passengerItems, contact,
        })).unwrap();

        const prebookingResult = await dispatch(makePreBookingThunk({
          searchId, productId, brandedFareItemId,
          passengers: passengerItems, contact,
        })).unwrap();

        if (prebookingResult?.isPriceChanged) {
          setIsProcessing(false);
          setPriceChangedResult(prebookingResult);
          return;
        }

        dispatch(makePaymentThunk({
          searchId,
          paymentType: 'CreditCard',
          cardHolderName: cardForm.cardHolderName.trim().toUpperCase(),
          cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
          expiryMonth: cardForm.expiryMonth,
          expiryYear: cardForm.expiryYear,
          cvv: cardForm.cvv,
        }));
      } catch (err) {
        console.error('[Checkout] Submit chain failed:', err);
        setIsProcessing(false);
      } finally {
        submitRef.current = false;
      }
    },
    [dispatch, searchId, productId, productItemId, brandedFareItemId, paymentMethod, cardForm, agreed, validateCard]
  );

  const handleAcceptPriceChange = useCallback(() => {
    setPriceChangedResult(null);
    setIsProcessing(true);
    dispatch(makePaymentThunk({
      searchId: searchId!,
      paymentType: 'CreditCard',
      cardHolderName: cardForm.cardHolderName.trim().toUpperCase(),
      cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
      expiryMonth: cardForm.expiryMonth,
      expiryYear: cardForm.expiryYear,
      cvv: cardForm.cvv,
    }));
  }, [dispatch, searchId, cardForm]);

  const handleRejectPriceChange = useCallback(() => {
    setPriceChangedResult(null);
    dispatch(resetBooking());
    router.push('/search-results');
  }, [dispatch, router]);

  if (!allocateResult || !selectedFlight) return null;

  const isMultiCity = searchParams?.flightType === 'MP';
  const legFlightsList = isMultiCity
    ? Object.keys(selectedLegFlights)
        .map(Number)
        .sort((a, b) => a - b)
        .map(idx => selectedLegFlights[idx])
        .filter(Boolean)
    : [];

  const triggerPassengerSubmit = () => {
    const form = document.querySelector('.bb-passenger-form') as HTMLFormElement | null;
    if (form) form.requestSubmit();
  };

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
  const headerDateText = formatDateDDMMYYYY(selectedFlight.departureDate);

  const renderFlightRow = (flight: typeof selectedFlight, legLabel?: string) => {
    if (!flight) return null;
    const airCode = flight.airlineCode ?? '??';
    const originCity = airports.find(a => a.code === flight.originCode)?.cityTr ?? '';
    const destCity = airports.find(a => a.code === flight.destinationCode)?.cityTr ?? '';
    return (
      <div className="chk-flight">
        {legLabel && <div className="chk-flight__leg">{legLabel}</div>}
        <div className="chk-flight__row">
          <div className="chk-flight__airline">
            <AirlineLogo code={airCode} size={32} />
          </div>
          <div className="chk-flight__time-block">
            <div className="chk-flight__time">{flight.departureTime}</div>
            <div className="chk-flight__code">{flight.originCode}{originCity ? ` · ${originCity}` : ''}</div>
          </div>
          <div className="chk-flight__route">
            <div className="chk-flight__duration">{flight.durationFormatted ?? ''}</div>
            <div className="chk-flight__track">
              <span className="chk-flight__track-dot" />
              <span className="chk-flight__plane"><IconPlane size={16} /></span>
              <span className="chk-flight__track-dot chk-flight__track-dot--right" />
            </div>
            <div className="chk-flight__flightno">
              {flight.flightNumber}{flight.cabinClass ? ` · ${flight.cabinClass}` : ''}
              {flight.departureDate ? ` · ${formatDateDDMMYYYY(flight.departureDate)}` : ''}
            </div>
          </div>
          <div className="chk-flight__time-block chk-flight__time-block--right">
            <div className="chk-flight__time">{flight.arrivalTime}</div>
            <div className="chk-flight__code">{flight.destinationCode}{destCity ? ` · ${destCity}` : ''}</div>
          </div>
        </div>
      </div>
    );
  };

  const payDisabled = isProcessing || !productId || !productItemId || !searchId || !kvkkAgreed;

  const hasAnyError = updatePassengersError
    || (preBookingError && !isProcessing)
    || (paymentError && !isProcessing)
    || threeDSError
    || (finalizeError && !isProcessing)
    || (!productId || !productItemId || !searchId);

  /* ═══════════ RENDER ═══════════ */
  return (
    <>
      <HeaderOne />

      <main className="chk-page">
        {/* Trust bar — text only */}
        <div className="chk-trust-bar">
          <div className="chk-trust-bar__inner">
            <span className="chk-trust-bar__item">256-bit SSL güvenliği</span>
            <span className="chk-trust-bar__item">3D Secure ödeme</span>
            <span className="chk-trust-bar__item">TÜRSAB üyesi</span>
          </div>
        </div>

        {/* Route header — big city names, dd.mm.yyyy date */}
        <div className="chk-route">
          <div className="chk-route__inner">
            <div className="chk-route__path">
              <span>{headerOriginCity}</span>
              <span className="chk-route__arrow"><IconArrow size={20} /></span>
              <span>{headerDestCity}</span>
            </div>
            <div className="chk-route__meta">
              {tripTypeLabel}{headerDateText ? ` · ${headerDateText}` : ''}{paxSummaryText ? ` · ${paxSummaryText}` : ''}
            </div>
          </div>
        </div>

        <div className="chk-container">
          {/* Session warning */}
          {sessionWarning && (
            <div className="chk-session-warn">
              <IconAlert size={14} />
              <span style={{ flex: 1 }}>Oturumunuz sona ermek üzere. Lütfen işleminizi tamamlayın.</span>
              <button type="button" onClick={dismissSessionWarning} aria-label="Kapat">
                <IconClose size={14} />
              </button>
            </div>
          )}

          <div className="chk-grid">
            <div className="chk-main">
              {/* Alerts */}
              {hasAnyError || isPriceChanged ? (
            <div className="chk-alerts">
              {isPriceChanged && (
                <div className="chk-alert chk-alert--warn">
                  <IconAlert />
                  <div className="chk-alert__body">Fiyat güncellenmiştir. Lütfen yeni fiyatı kontrol ediniz.</div>
                </div>
              )}
              {(!productId || !productItemId || !searchId) && (
                <div className="chk-alert chk-alert--error">
                  <IconAlert />
                  <div className="chk-alert__body">Uçuş tahsis bilgileri eksik. Lütfen geri dönüp tekrar uçuş seçiniz.</div>
                </div>
              )}
              {updatePassengersError && (
                <div className="chk-alert chk-alert--error">
                  <IconAlert />
                  <div className="chk-alert__body">{updatePassengersError}</div>
                </div>
              )}
              {preBookingError && !isProcessing && (
                <div className="chk-alert chk-alert--error">
                  <IconAlert />
                  <div className="chk-alert__body">
                    <div>{preBookingError}</div>
                    <div className="chk-alert__actions">
                      <button type="button" disabled={preBookingLoading} onClick={triggerPassengerSubmit}
                        className="chk-alert__btn chk-alert__btn--primary">
                        Tekrar dene
                      </button>
                      <button type="button" onClick={() => router.push('/search-results')}
                        className="chk-alert__btn chk-alert__btn--ghost">
                        Farklı uçuş seç
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {paymentError && !isProcessing && (
                <div className="chk-alert chk-alert--error">
                  <IconAlert />
                  <div className="chk-alert__body">{paymentError}</div>
                </div>
              )}
              {threeDSError && (
                <div className="chk-alert chk-alert--error">
                  <IconAlert />
                  <div className="chk-alert__body">{threeDSError}</div>
                </div>
              )}
              {finalizeError && !isProcessing && (
                <div className="chk-alert chk-alert--error">
                  <IconAlert />
                  <div className="chk-alert__body">
                    <div>
                      {/duplicate|zaten biletlen/i.test(finalizeError)
                        ? 'Biletleme işlemi zaten tamamlanmış görünüyor. Bilet sorgulama sayfasına yönlendiriliyorsunuz...'
                        : finalizeError}
                    </div>
                    <div className="chk-alert__actions">
                      <button type="button" onClick={() => router.push('/bilet-sorgula')}
                        className="chk-alert__btn chk-alert__btn--primary">
                        Bilet sorgula
                      </button>
                      {!/duplicate|zaten biletlen/i.test(finalizeError) && (
                        <button type="button" className="chk-alert__btn chk-alert__btn--ghost"
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
                </div>
              )}
            </div>
          ) : null}

          {/* Timeline */}
          <div className="chk-timeline">
            <div className="chk-timeline__line" />

            {/* STEP 1 — Flight */}
            <div className={`chk-step ${activeStep === 1 ? 'chk-step--active' : ''}`}>
              <div className="chk-step__node">1</div>
              <div className="chk-step__body">
                <div className="chk-step__header">
                  <h2 className="chk-step__title">Uçuş Bilgileri</h2>
                </div>
                {isMultiCity && legFlightsList.length > 0 ? (
                  legFlightsList.map((legFlight, idx) => (
                    <div key={idx}>{renderFlightRow(legFlight, `${idx + 1}. Uçuş`)}</div>
                  ))
                ) : (
                  <>
                    {renderFlightRow(selectedFlight, selectedReturnFlight ? 'Gidiş' : undefined)}
                    {selectedReturnFlight && renderFlightRow(selectedReturnFlight, 'Dönüş')}
                  </>
                )}
              </div>
            </div>

            {/* STEP 2 — Passengers */}
            <div className={`chk-step ${activeStep === 2 ? 'chk-step--active' : ''}`}>
              <div className="chk-step__node">2</div>
              <div className="chk-step__body">
                <div className="chk-step__header">
                  <h2 className="chk-step__title">Yolcu Bilgileri</h2>
                </div>
                <PassengerForm
                  passengers={passengers}
                  onSubmit={handlePassengerSubmit}
                  loading={updatePassengersLoading}
                  isInternational={isInternational}
                />
              </div>
            </div>

            {/* STEP 3 — Payment */}
            <div className={`chk-step ${activeStep === 3 ? 'chk-step--active' : ''}`}>
              <div className="chk-step__node">3</div>
              <div className="chk-step__body">
                <div className="chk-step__header">
                  <h2 className="chk-step__title">Ödeme Bilgileri</h2>
                  <span className="chk-step__subtitle">Güvenli Ödeme</span>
                </div>

                <div className="chk-field">
                  <label className="chk-field__label">Kart üzerindeki isim</label>
                  <input type="text" placeholder="Ad Soyad"
                    value={cardForm.cardHolderName}
                    onChange={e => { setCardForm(p => ({ ...p, cardHolderName: e.target.value })); setCardErrors(p => ({ ...p, cardHolderName: '' })); }}
                    maxLength={100} autoComplete="cc-name"
                    className={`chk-input ${cardErrors.cardHolderName ? 'chk-input--error' : ''}`} />
                  {cardErrors.cardHolderName && <div className="chk-field__error">{cardErrors.cardHolderName}</div>}
                </div>

                <div className="chk-field">
                  <label className="chk-field__label">Kart numarası</label>
                  <input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000"
                    value={cardForm.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                    onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 16); setCardForm(p => ({ ...p, cardNumber: v })); setCardErrors(p => ({ ...p, cardNumber: '' })); }}
                    maxLength={19} autoComplete="cc-number"
                    className={`chk-input chk-input--card ${cardErrors.cardNumber ? 'chk-input--error' : ''}`} />
                  {cardErrors.cardNumber && <div className="chk-field__error">{cardErrors.cardNumber}</div>}
                  <div className="chk-card-brands">
                    <span>VISA</span>
                    <span>MC</span>
                    <span>TROY</span>
                  </div>
                </div>

                <div className="chk-field-row">
                  <div className="chk-field">
                    <label className="chk-field__label">Ay</label>
                    <select value={cardForm.expiryMonth}
                      onChange={e => { setCardForm(p => ({ ...p, expiryMonth: e.target.value })); setCardErrors(p => ({ ...p, expiryMonth: '' })); }}
                      autoComplete="cc-exp-month"
                      className={`chk-select ${cardErrors.expiryMonth ? 'chk-select--error' : ''}`}>
                      <option value="">Ay</option>
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    {cardErrors.expiryMonth && <div className="chk-field__error">{cardErrors.expiryMonth}</div>}
                  </div>
                  <div className="chk-field">
                    <label className="chk-field__label">Yıl</label>
                    <select value={cardForm.expiryYear}
                      onChange={e => { setCardForm(p => ({ ...p, expiryYear: e.target.value })); setCardErrors(p => ({ ...p, expiryYear: '' })); }}
                      autoComplete="cc-exp-year"
                      className={`chk-select ${cardErrors.expiryYear ? 'chk-select--error' : ''}`}>
                      <option value="">Yıl</option>
                      {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i)).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    {cardErrors.expiryYear && <div className="chk-field__error">{cardErrors.expiryYear}</div>}
                  </div>
                  <div className="chk-field">
                    <label className="chk-field__label">CVC</label>
                    <input type="password" inputMode="numeric" placeholder="***"
                      value={cardForm.cvv}
                      onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setCardForm(p => ({ ...p, cvv: v })); setCardErrors(p => ({ ...p, cvv: '' })); }}
                      maxLength={4} autoComplete="cc-csc"
                      className={`chk-input ${cardErrors.cvv ? 'chk-input--error' : ''}`} />
                    {cardErrors.cvv && <div className="chk-field__error">{cardErrors.cvv}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4 — Agreements */}
            <div className={`chk-step ${activeStep === 4 ? 'chk-step--active' : ''}`}>
              <div className="chk-step__node">4</div>
              <div className="chk-step__body">
                <div className="chk-step__header">
                  <h2 className="chk-step__title">Sözleşmeler</h2>
                </div>
                <label htmlFor="paymentAgreement"
                  className={`chk-agree ${agreementError && !agreed ? 'chk-agree--error' : ''}`}>
                  <input type="checkbox" id="paymentAgreement" checked={agreed}
                    onChange={(e) => { setAgreed(e.target.checked); if (e.target.checked) setAgreementError(false); }} />
                  <span className="chk-agree__text">
                    Satış koşullarını ve <button type="button" className="chk-agree__link">mesafeli satış sözleşmesini</button> okudum, kabul ediyorum. Yolcu bilgilerinin doğruluğunu onaylıyorum.
                  </span>
                </label>
                <label htmlFor="kvkkConsent" className="chk-agree">
                  <input type="checkbox" id="kvkkConsent" checked={kvkkAgreed}
                    onChange={(e) => setKvkkAgreed(e.target.checked)} />
                  <span className="chk-agree__text">
                    <button type="button" className="chk-agree__link"
                      onClick={(e) => { e.preventDefault(); setShowKvkkModal(true); }}>
                      KVKK Aydınlatma Metni
                    </button>&apos;ni okudum ve kabul ediyorum.
                  </span>
                </label>
              </div>
            </div>
          </div>
            </div>
            {/* /chk-main */}

            {/* Summary sidebar (desktop only — mobile uses sticky bottom bar) */}
            <aside className="chk-summary" aria-label="Sipariş özeti">
              <div className="chk-summary__head">
                <h3 className="chk-summary__title">Sipariş Özeti</h3>
                <span className="chk-summary__sub">{tripTypeLabel}{paxSummaryText ? ` · ${paxSummaryText}` : ''}</span>
              </div>
              <div className="chk-summary__body">
                {/* Flight legs */}
                {isMultiCity && legFlightsList.length > 0 ? (
                  legFlightsList.map((legFlight, idx) => legFlight ? (
                    <div key={idx} className="chk-summary__leg">
                      <span className="chk-summary__leg-label">{idx + 1}.</span>
                      <span className="chk-summary__leg-route">
                        {legFlight.originCode} → {legFlight.destinationCode}
                      </span>
                      <span className="chk-summary__leg-date">{formatDateDDMMYYYY(legFlight.departureDate)}</span>
                    </div>
                  ) : null)
                ) : (
                  <>
                    <div className="chk-summary__leg">
                      <span className="chk-summary__leg-label">{selectedReturnFlight ? 'GİD' : 'TY'}</span>
                      <span className="chk-summary__leg-route">
                        {selectedFlight.originCode} → {selectedFlight.destinationCode}
                      </span>
                      <span className="chk-summary__leg-date">{formatDateDDMMYYYY(selectedFlight.departureDate)}</span>
                    </div>
                    {selectedReturnFlight && (
                      <div className="chk-summary__leg">
                        <span className="chk-summary__leg-label">DÖN</span>
                        <span className="chk-summary__leg-route">
                          {selectedReturnFlight.originCode} → {selectedReturnFlight.destinationCode}
                        </span>
                        <span className="chk-summary__leg-date">{formatDateDDMMYYYY(selectedReturnFlight.departureDate)}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="chk-summary__divider" />

                {/* Price breakdown */}
                {priceSummary.totalBaseFare > 0 && (
                  <div className="chk-summary__row">
                    <span>Esas ücret</span>
                    <span>{formatPrice(priceSummary.totalBaseFare)}</span>
                  </div>
                )}
                {priceSummary.totalTaxes > 0 && (
                  <div className="chk-summary__row">
                    <span>Vergi ve ücretler</span>
                    <span>{formatPrice(priceSummary.totalTaxes)}</span>
                  </div>
                )}
                {priceSummary.totalServiceFee > 0 && (
                  <div className="chk-summary__row">
                    <span>Hizmet bedeli</span>
                    <span>{formatPrice(priceSummary.totalServiceFee)}</span>
                  </div>
                )}

                <div className="chk-summary__total">
                  <div>
                    <div className="chk-summary__total-label">Toplam</div>
                    {displayCurrency !== 'TRY' && (
                      <span className="chk-summary__fx" style={{ textAlign: 'left', marginTop: 2 }}>
                        {priceSummary.grandTotal.toFixed(2)} TRY tahsil edilecek
                      </span>
                    )}
                  </div>
                  <div className="chk-summary__total-amount">{formatPrice(priceSummary.grandTotal)}</div>
                </div>

                <button type="button" className="chk-summary__pay-btn"
                  disabled={payDisabled}
                  onClick={triggerPassengerSubmit}>
                  {isProcessing ? (
                    'İşleniyor...'
                  ) : (
                    <>
                      <IconLock size={16} />
                      <span>Ödemeyi Tamamla</span>
                    </>
                  )}
                </button>

                <div className="chk-summary__secure">
                  <IconShield size={14} />
                  <span>3D Secure ile güvenli ödeme</span>
                </div>
              </div>
            </aside>
          </div>
          {/* /chk-grid */}
        </div>

        {/* Sticky bottom bar — navy, full width */}
        <div className="chk-sticky-bar">
          <div className="chk-sticky-bar__inner">
            <div className="chk-sticky-bar__total-wrap">
              <div className="chk-sticky-bar__total-block">
                <div className="chk-sticky-bar__label">Toplam Tutar</div>
                <div className="chk-sticky-bar__amount">{formatPrice(priceSummary.grandTotal)}</div>
                {displayCurrency !== 'TRY' && (
                  <span className="chk-sticky-bar__fx">
                    {priceSummary.grandTotal.toFixed(2)} TRY olarak tahsil edilecek
                  </span>
                )}
              </div>
              <div className="chk-sticky-bar__note">
                {paxSummaryText || '1 Yolcu'} · Tüm vergiler dahil
              </div>
            </div>
            <button type="button" className="chk-sticky-bar__btn"
              disabled={payDisabled}
              onClick={triggerPassengerSubmit}>
              {isProcessing ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
            </button>
          </div>
        </div>
      </main>

      <FooterOne />

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="chk-loading" role="status" aria-live="polite">
          <div className="chk-loading__card">
            <div className="chk-loading__logo">
              <span className="accent">Ata</span><span className="dark">Bilet</span>
            </div>
            <div className="chk-loading__bar">
              <div className="chk-loading__bar-fill" />
            </div>
            <p className="chk-loading__text">
              Biletiniz hazırlanıyor, lütfen bekleyiniz<span className="chk-loading__dots" />
            </p>
          </div>
        </div>
      )}

      {/* KVKK Modal */}
      {showKvkkModal && (
        <div className="chk-modal-overlay" role="dialog" aria-modal="true" aria-label="KVKK Aydınlatma Metni">
          <div className="chk-modal">
            <div className="chk-modal__header">
              <h3 className="chk-modal__title">KVKK Aydınlatma Metni</h3>
              <button type="button" className="chk-modal__close" onClick={() => setShowKvkkModal(false)} aria-label="Kapat">×</button>
            </div>
            <div className="chk-modal__body">
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
            <div className="chk-modal__footer">
              <button type="button" className="chk-modal__btn chk-modal__btn--primary" onClick={() => setShowKvkkModal(false)}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Price change Modal */}
      {priceChangedResult && (
        <div className="chk-modal-overlay" role="dialog" aria-modal="true" aria-label="Fiyat değişikliği bildirimi">
          <div className="chk-modal chk-modal--price">
            <div className="chk-modal__header">
              <h3 className="chk-modal__title">Fiyat Güncellemesi</h3>
            </div>
            <div className="chk-modal__body">
              <p>Seçtiğiniz uçuşun fiyatı havayolu tarafından güncellenmiştir.</p>
              <div className="chk-modal__price-compare">
                {priceChangedResult.oldPrice > 0 && (
                  <div className="chk-modal__price-col chk-modal__price-col--old">
                    <span className="chk-modal__price-col-label">Önceki Fiyat</span>
                    <span className="chk-modal__price-col-value">{formatPrice(priceChangedResult.oldPrice)}</span>
                  </div>
                )}
                <div className="chk-modal__price-col chk-modal__price-col--new">
                  <span className="chk-modal__price-col-label">Yeni Fiyat</span>
                  <span className="chk-modal__price-col-value">{formatPrice(priceChangedResult.totalFare ?? 0)}</span>
                </div>
              </div>
              <p>Devam etmek istiyor musunuz?</p>
            </div>
            <div className="chk-modal__footer">
              <button className="chk-modal__btn chk-modal__btn--secondary" onClick={handleRejectPriceChange}>
                Vazgeç, aramaya dön
              </button>
              <button className="chk-modal__btn chk-modal__btn--primary" onClick={handleAcceptPriceChange}>
                Yeni fiyatla devam et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}