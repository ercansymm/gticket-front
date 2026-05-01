"use client";

import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import PassengerForm from '@/components/booking/PassengerForm';
import { prepareBookingThunk, setStep, setPassengers, setContactInfo, resetBooking } from '@/redux/features/bookingSlice';
import { makePaymentThunk, finalizeShoppingThunk, clearFinalizeError } from '@/redux/features/paymentSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import type { PassengerItem, ContactInfo, MakePreBookingResponse } from '@/types/booking';
import { useSessionTimeout } from '@/hooks/UseSessionTimeout';
import { airports } from '@/data/AirportData';
import { useCurrency } from '@/context/CurrencyContext';
import AirlineLogo from '@/components/common/AirlineLogo';
import './checkout.css';

/* ─────────── Icons ─────────── */
const IconArrow = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconAlert = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconPlane = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(90 12 12)" />
  </svg>
);
const IconClose = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);
const IconShield = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
  </svg>
);
const IconLock = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

function formatDateDDMMYYYY(input?: string | null): string {
  if (!input) return '';
  const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(input)) return input;
  const d = new Date(input);
  if (!isNaN(d.getTime())) {
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  }
  return input;
}

/* ─────────── Kart Önizleme ─────────── */
function CardPreview({ cardNumber, cardHolder, expiryMonth, expiryYear, cvv, showBack }: {
  cardNumber: string; cardHolder: string;
  expiryMonth: string; expiryYear: string;
  cvv: string; showBack: boolean;
}) {
  const digits = cardNumber.replace(/\s/g, '');

  // Kart tipini belirle
  const getCardType = () => {
    if (/^4/.test(digits)) return 'VISA';
    if (/^5[1-5]|^2[2-7]/.test(digits)) return 'MC';
    if (/^9/.test(digits)) return 'TROY';
    return '';
  };

  // Numarayı 4'lü gruplara böl, eksikleri nokta ile doldur
  const formatPreviewNumber = () => {
    const groups = [];
    for (let i = 0; i < 4; i++) {
      const chunk = digits.slice(i * 4, i * 4 + 4);
      groups.push(chunk.padEnd(4, '•'));
    }
    return groups.join('  ');
  };

  const cardType = getCardType();
  const expiry = expiryMonth && expiryYear
    ? `${expiryMonth}/${expiryYear.slice(-2)}`
    : 'AA/YY';

  return (
    <div className="chk-card-preview">
      <div className={`chk-card-preview__inner ${showBack ? 'chk-card-preview__inner--flipped' : ''}`}>
        {/* Ön yüz */}
        <div className="chk-card-preview__front">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="chk-card-preview__chip" />
            <div className="chk-card-preview__type">{cardType}</div>
          </div>
          <div className="chk-card-preview__number">
            {formatPreviewNumber()}
          </div>
          <div className="chk-card-preview__bottom">
            <div>
              <div className="chk-card-preview__label">Kart Sahibi</div>
              <div className="chk-card-preview__holder">
                {cardHolder.trim() || 'AD SOYAD'}
              </div>
            </div>
            <div>
              <div className="chk-card-preview__label">Son Kullanma</div>
              <div className="chk-card-preview__expiry">{expiry}</div>
            </div>
          </div>
        </div>

        {/* Arka yüz */}
        <div className="chk-card-preview__back">
          <div className="chk-card-preview__stripe" />
          <div className="chk-card-preview__cvv-row">
            <span className="chk-card-preview__cvv-label">CVV</span>
            <div className="chk-card-preview__cvv-box">
              {cvv || '•••'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Main ─────────── */
export default function CheckoutClient() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const { showWarning: sessionWarning, dismissWarning: dismissSessionWarning } = useSessionTimeout();
  const { formatPrice, currency: displayCurrency } = useCurrency();
  const [priceChangedResult, setPriceChangedResult] = useState<MakePreBookingResponse | null>(null);

  const [agreed, setAgreed] = useState(false);
  const [agreementError, setAgreementError] = useState(false);
  const [kvkkAgreed, setKvkkAgreed] = useState(false);
  const [kvkkError, setKvkkError] = useState(false);
  const [showKvkkModal, setShowKvkkModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Rezervasyon oluşturuluyor...');
  const [cvvFocused, setCvvFocused] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardHolderName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '',
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
    updatePassengersLoading, updatePassengersError, preBookingLoading, preBookingError,
  } = useSelector((state: RootState) => state.booking);
  const { paymentResult, paymentError, finalizeResult, finalizeError,
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
    ?? firstBooking?.brandedFareItems?.[0]?.brandedFareItemId ?? '';

  const priceSummary = (() => {
    const ps = allocateResult?.priceSummary;
    if (ps && ps.totalBaseFare > 0) return ps;
    const totals = airBookings.reduce((acc, ab) => ({
      baseFare: acc.baseFare + (ab.baseFare ?? 0),
      taxes: acc.taxes + (ab.taxes ?? 0),
      serviceFee: acc.serviceFee + (ab.serviceFee ?? 0),
      totalFare: acc.totalFare + (ab.totalFare ?? 0),
    }), { baseFare: 0, taxes: 0, serviceFee: 0, totalFare: 0 });
    return {
      grandTotal: ps?.grandTotal ?? totals.totalFare,
      totalBaseFare: totals.baseFare, totalTaxes: totals.taxes,
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
    if (searchParams?.originCountryCode && searchParams?.destinationCountryCode)
      return searchParams.originCountryCode !== searchParams.destinationCountryCode;
    const segments = airBookings.flatMap(ab => ab.segments ?? []);
    const codes = segments.length > 0
      ? segments.map(seg => ({ origin: seg.originCode, dest: seg.destinationCode }))
      : selectedFlight ? [{ origin: selectedFlight.originCode, dest: selectedFlight.destinationCode }] : [];
    const resolvedPairs = codes.filter(({ origin, dest }) =>
      origin !== null && dest !== null &&
      airports.some(a => a.code === origin) && airports.some(a => a.code === dest));
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

  /* 3D Secure */
  useEffect(() => {
    if (is3DSecureRequired && (threeDSecureUrl || threeDSecureHtml)) {
      setThreeDSError(null);
      const paymentSession = {
        searchId, shoppingFileId: paymentResult?.shoppingFileId ?? null,
        paymentReferenceId: paymentResult?.paymentReferenceId ?? null,
        amount: paymentResult?.grandTotal ?? paymentResult?.paymentAmount ?? 0,
        currency: paymentResult?.currency ?? 'TRY', pnr: paymentResult?.pnr ?? null,
      };
      sessionStorage.setItem('payment_3ds_session', JSON.stringify(paymentSession));
      if (threeDSecureUrl) {
        const timer = setTimeout(() => { window.location.href = threeDSecureUrl; }, 300);
        return () => clearTimeout(timer);
      } else if (threeDSecureHtml) {
        const win = window.open('', '_blank', 'width=500,height=700,scrollbars=yes');
        if (win) { win.document.open(); win.document.write(threeDSecureHtml); win.document.close(); }
        else { setIsProcessing(false); setThreeDSError('Tarayıcınız popup penceresini engelledi.'); }
      }
    }
  }, [is3DSecureRequired, threeDSecureUrl, threeDSecureHtml, searchId, paymentResult]);

  const isPaymentSuccessful = paymentResult && paymentResult.hasError === false &&
    paymentResult.isPaymentSuccessful === true && !paymentResult.is3DSecureRequired;

  useEffect(() => {
    if (isPaymentSuccessful && paymentResult?.autoFinalized) {
      hasFinalized.current = true; setIsProcessing(false);
      dispatch(setStep('confirmation')); router.push('/checkout/success');
    }
  }, [isPaymentSuccessful, paymentResult?.autoFinalized, dispatch, router]);

  useEffect(() => {
    if (isPaymentSuccessful && !paymentResult?.autoFinalized && searchId && !hasFinalized.current && !finalizeResult && !finalizeError) {
      hasFinalized.current = true;
      setLoadingStep('Biletiniz oluşturuluyor...');
      if (finalizeTimeoutRef.current) clearTimeout(finalizeTimeoutRef.current);
      finalizeTimeoutRef.current = setTimeout(() => {
        if (!finalizeResultRef.current) dispatch({ type: 'payment/finalizeTimeout' });
      }, 60_000);
      const timer = setTimeout(() => { dispatch(finalizeShoppingThunk({ searchId })); }, 300);
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
      setIsProcessing(false); dispatch(setStep('confirmation')); router.push('/checkout/success');
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
    if (paymentError || (finalizeError && !/duplicate|zaten biletlen/i.test(finalizeError)))
      setIsProcessing(false);
  }, [paymentError, finalizeError]);

  const submitRef = useRef(false);
  const handlePassengerSubmit = useCallback(
    async (passengerItems: PassengerItem[], contact: ContactInfo) => {
      console.log('[Checkout] handlePassengerSubmit invoked', {
        passengersCount: passengerItems.length, hasContact: !!contact, agreed,
        searchId, productId, productItemId,
      });
      if (submitRef.current) { console.warn('[Checkout] Already submitting, ignored'); return; }
      if (!searchId || !productId || !productItemId) { console.warn('[Checkout] Missing IDs', { searchId, productId, productItemId }); return; }
      if (!agreed || !kvkkAgreed) {
        console.warn('[Checkout] Agreements not accepted', { agreed, kvkkAgreed });
        if (!agreed) setAgreementError(true);
        if (!kvkkAgreed) setKvkkError(true);
        setTimeout(() => {
          const el = document.querySelector('.chk-agree--error');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
      if (!validateCard()) {
        console.warn('[Checkout] Card validation failed');
        setTimeout(() => {
          const el = document.querySelector('.chk-input--error');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
      submitRef.current = true;
      setIsProcessing(true);
      setLoadingStep('Rezervasyon oluşturuluyor...');
      dispatch(setPassengers(passengerItems));
      dispatch(setContactInfo(contact));
      try {
        const prebookingResult = await dispatch(prepareBookingThunk({
          searchId, productId, productItemId, brandedFareItemId, passengers: passengerItems, contact,
        })).unwrap();
        if (prebookingResult?.isPriceChanged) {
          setIsProcessing(false); setPriceChangedResult(prebookingResult); return;
        }
        setLoadingStep('Ödeme işleniyor...');
        dispatch(makePaymentThunk({
          searchId, paymentType: 'CreditCard',
          cardHolderName: cardForm.cardHolderName.trim().toUpperCase(),
          cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
          expiryMonth: cardForm.expiryMonth, expiryYear: cardForm.expiryYear, cvv: cardForm.cvv,
        }));
      } catch (err) {
        console.error('[Checkout] Submit chain failed:', err);
        setIsProcessing(false);
      } finally { submitRef.current = false; }
    },
    [dispatch, searchId, productId, productItemId, brandedFareItemId, cardForm, agreed, kvkkAgreed, validateCard]
  );

  const handleAcceptPriceChange = useCallback(() => {
    setPriceChangedResult(null); setIsProcessing(true); setLoadingStep('Ödeme işleniyor...');
    dispatch(makePaymentThunk({
      searchId: searchId!, paymentType: 'CreditCard',
      cardHolderName: cardForm.cardHolderName.trim().toUpperCase(),
      cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
      expiryMonth: cardForm.expiryMonth, expiryYear: cardForm.expiryYear, cvv: cardForm.cvv,
    }));
  }, [dispatch, searchId, cardForm]);

  const handleRejectPriceChange = useCallback(() => {
    setPriceChangedResult(null); dispatch(resetBooking()); router.push('/search-results');
  }, [dispatch, router]);

  if (!allocateResult || !selectedFlight) return null;

  const isMultiCity = searchParams?.flightType === 'MP';
  const legFlightsList = isMultiCity
    ? Object.keys(selectedLegFlights).map(Number).sort((a,b)=>a-b)
        .map(idx => selectedLegFlights[idx]).filter(Boolean)
    : [];

  const triggerPassengerSubmit = () => {
    console.log('[Checkout] Pay button clicked', {
      payDisabled, isProcessing, productId, productItemId, searchId, agreed, kvkkAgreed,
    });
    const form = document.querySelector('.bb-passenger-form') as HTMLFormElement | null;
    if (!form) { console.warn('[Checkout] PassengerForm not found in DOM'); return; }
    form.requestSubmit();
  };

  const tripTypeLabel = searchParams?.flightType === 'RT' ? 'Gidiş-Dönüş'
    : searchParams?.flightType === 'MP' ? 'Çoklu Rota' : 'Tek Yön';
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
          <div className="chk-flight__airline"><AirlineLogo code={airCode} size={32} /></div>
          <div className="chk-flight__time-block">
            <div className="chk-flight__time">{flight.departureTime}</div>
            <div className="chk-flight__code">{flight.originCode}{originCity ? ` · ${originCity}` : ''}</div>
          </div>
          <div className="chk-flight__route">
            <div className="chk-flight__duration">{flight.durationFormatted ?? ''}</div>
            <div className="chk-flight__track">
              <span className="chk-flight__track-dot" />
              <span className="chk-flight__plane"><IconPlane size={14} /></span>
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

  const payDisabled = isProcessing || !productId || !productItemId || !searchId || !agreed || !kvkkAgreed;
  const hasAnyError = updatePassengersError || (preBookingError && !isProcessing) ||
    (paymentError && !isProcessing) || threeDSError ||
    (finalizeError && !isProcessing) || (!productId || !productItemId || !searchId);

  return (
    <>
      <HeaderOne />
      <main className="chk-page">
        {/* Trust bar */}
        <div className="chk-trust-bar">
          <div className="chk-trust-bar__inner">
            <span className="chk-trust-bar__item">256-bit SSL güvenliği</span>
            <span className="chk-trust-bar__item">3D Secure ödeme</span>
            <span className="chk-trust-bar__item">TÜRSAB üyesi</span>
          </div>
        </div>

        {/* Route header */}
        <div className="chk-route">
          <div className="chk-route__inner">
            <div className="chk-route__path">
              <span>{headerOriginCity}</span>
              <span className="chk-route__arrow"><IconArrow size={18} /></span>
              <span>{headerDestCity}</span>
            </div>
            <div className="chk-route__meta">
              {tripTypeLabel}{headerDateText ? ` · ${headerDateText}` : ''}{paxSummaryText ? ` · ${paxSummaryText}` : ''}
            </div>
          </div>
        </div>

        <div className="chk-container">
          {sessionWarning && (
            <div className="chk-session-warn">
              <IconAlert size={14} />
              <span style={{ flex: 1 }}>Oturumunuz sona ermek üzere. Lütfen işleminizi tamamlayın.</span>
              <button type="button" onClick={dismissSessionWarning}><IconClose size={14} /></button>
            </div>
          )}

          <div className="chk-grid">
            {/* ── Sol kolon ── */}
            <div className="chk-main">
              {/* Alerts */}
              {(hasAnyError || isPriceChanged) && (
                <div className="chk-alerts">
                  {isPriceChanged && (
                    <div className="chk-alert chk-alert--warn"><IconAlert />
                      <div className="chk-alert__body">Fiyat güncellenmiştir.</div>
                    </div>
                  )}
                  {(!productId || !productItemId || !searchId) && (
                    <div className="chk-alert chk-alert--error"><IconAlert />
                      <div className="chk-alert__body">Uçuş tahsis bilgileri eksik. Lütfen geri dönüp tekrar seçiniz.</div>
                    </div>
                  )}
                  {updatePassengersError && (
                    <div className="chk-alert chk-alert--error"><IconAlert />
                      <div className="chk-alert__body">{updatePassengersError}</div>
                    </div>
                  )}
                  {preBookingError && !isProcessing && (
                    <div className="chk-alert chk-alert--error"><IconAlert />
                      <div className="chk-alert__body">
                        <div>{preBookingError}</div>
                        <div className="chk-alert__actions">
                          <button type="button" disabled={preBookingLoading} onClick={triggerPassengerSubmit} className="chk-alert__btn chk-alert__btn--primary">Tekrar dene</button>
                          <button type="button" onClick={() => router.push('/search-results')} className="chk-alert__btn chk-alert__btn--ghost">Farklı uçuş seç</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {paymentError && !isProcessing && (
                    <div className="chk-alert chk-alert--error"><IconAlert />
                      <div className="chk-alert__body">{paymentError}</div>
                    </div>
                  )}
                  {threeDSError && (
                    <div className="chk-alert chk-alert--error"><IconAlert />
                      <div className="chk-alert__body">{threeDSError}</div>
                    </div>
                  )}
                  {finalizeError && !isProcessing && (
                    <div className="chk-alert chk-alert--error"><IconAlert />
                      <div className="chk-alert__body">
                        <div>{/duplicate|zaten biletlen/i.test(finalizeError)
                          ? 'Biletleme işlemi zaten tamamlanmış. Bilet sorgulama sayfasına yönlendiriliyorsunuz...'
                          : finalizeError}</div>
                        <div className="chk-alert__actions">
                          <button type="button" onClick={() => router.push('/bilet-sorgula')} className="chk-alert__btn chk-alert__btn--primary">Bilet sorgula</button>
                          {!/duplicate|zaten biletlen/i.test(finalizeError) && (
                            <button type="button" className="chk-alert__btn chk-alert__btn--ghost"
                              onClick={() => {
                                if (finalizeTimeoutRef.current) { clearTimeout(finalizeTimeoutRef.current); finalizeTimeoutRef.current = null; }
                                dispatch(clearFinalizeError()); hasFinalized.current = false;
                              }}>Tekrar dene</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 1 — UÇUŞ BİLGİLERİ */}
              <div className="chk-section">
                <div className="chk-section__head">
                  <div className="chk-section__title">Uçuş Bilgileri</div>
                </div>
                <div className="chk-section__body">
                  {isMultiCity && legFlightsList.length > 0
                    ? legFlightsList.map((lf, idx) => <div key={idx}>{renderFlightRow(lf, `${idx + 1}. Uçuş`)}</div>)
                    : <>
                        {renderFlightRow(selectedFlight, selectedReturnFlight ? 'Gidiş' : undefined)}
                        {selectedReturnFlight && renderFlightRow(selectedReturnFlight, 'Dönüş')}
                      </>
                  }
                </div>
              </div>

              {/* 2 — YOLCU + İLETİŞİM */}
              <PassengerForm
                passengers={passengers}
                onSubmit={handlePassengerSubmit}
                loading={updatePassengersLoading}
                isInternational={isInternational}
              />

              {/* 3 — SÖZLEŞMELER */}
              <div className="chk-section">
                <div className="chk-section__head">
                  <div className="chk-section__title">Sözleşmeler</div>
                </div>
                <div className="chk-section__body">
                  <label htmlFor="paymentAgreement"
                    className={`chk-agree ${agreementError && !agreed ? 'chk-agree--error' : ''}`}>
                    <input type="checkbox" id="paymentAgreement" checked={agreed}
                      onChange={e => { setAgreed(e.target.checked); if (e.target.checked) setAgreementError(false); }} />
                    <span className="chk-agree__text">
                      Satış koşullarını ve <button type="button" className="chk-agree__link" onClick={e => { e.preventDefault(); setShowSalesModal(true); }}>mesafeli satış sözleşmesini</button> okudum, kabul ediyorum. Yolcu bilgilerinin doğruluğunu onaylıyorum.
                    </span>
                  </label>
                  <label htmlFor="kvkkConsent" className={`chk-agree ${kvkkError && !kvkkAgreed ? 'chk-agree--error' : ''}`}>
                    <input type="checkbox" id="kvkkConsent" checked={kvkkAgreed}
                      onChange={e => { setKvkkAgreed(e.target.checked); if (e.target.checked) setKvkkError(false); }} />
                    <span className="chk-agree__text">
                      <button type="button" className="chk-agree__link" onClick={e => { e.preventDefault(); setShowKvkkModal(true); }}>
                        KVKK Aydınlatma Metni
                      </button>&apos;ni okudum ve kabul ediyorum.
                    </span>
                  </label>
                  {((agreementError && !agreed) || (kvkkError && !kvkkAgreed)) && (
                    <div className="chk-agree__error-msg" role="alert" style={{
                      marginTop: 8, padding: '10px 12px', background: '#fef2f2',
                      border: '1px solid #fecaca', color: '#991b1b', borderRadius: 6, fontSize: 13,
                    }}>
                      Ödemeye devam etmek için {!agreed && 'satış sözleşmesini'}{!agreed && !kvkkAgreed && ' ve '}{!kvkkAgreed && 'KVKK aydınlatma metnini'} onaylamanız gerekmektedir.
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* /chk-main */}

            {/* ── Sidebar (Sipariş Özeti + Ödeme) ── */}
            <aside className="chk-summary chk-summary--with-payment" aria-label="Sipariş özeti ve ödeme">
              <div className="chk-summary__head">
                <h3 className="chk-summary__title">Bilet Özetiniz</h3>
                <span className="chk-summary__sub">{tripTypeLabel}{paxSummaryText ? ` · ${paxSummaryText}` : ''}</span>
              </div>
              <div className="chk-summary__body">
                {isMultiCity && legFlightsList.length > 0
                  ? legFlightsList.map((lf, idx) => lf ? (
                      <div key={idx} className="chk-summary__leg">
                        <span className="chk-summary__leg-label">{idx + 1}.</span>
                        <span className="chk-summary__leg-route">{lf.originCode} → {lf.destinationCode}</span>
                        <span className="chk-summary__leg-date">{formatDateDDMMYYYY(lf.departureDate)}</span>
                      </div>
                    ) : null)
                  : <>
                      <div className="chk-summary__leg">
                        <span className="chk-summary__leg-label">{selectedReturnFlight ? 'GİDİŞ' : 'TY'}</span>
                        <span className="chk-summary__leg-route">{selectedFlight.originCode} → {selectedFlight.destinationCode}</span>
                        <span className="chk-summary__leg-date">{formatDateDDMMYYYY(selectedFlight.departureDate)}</span>
                      </div>
                      {selectedReturnFlight && (
                        <div className="chk-summary__leg">
                          <span className="chk-summary__leg-label">DÖNÜŞ</span>
                          <span className="chk-summary__leg-route">{selectedReturnFlight.originCode} → {selectedReturnFlight.destinationCode}</span>
                          <span className="chk-summary__leg-date">{formatDateDDMMYYYY(selectedReturnFlight.departureDate)}</span>
                        </div>
                      )}
                    </>
                }
                <div className="chk-summary__divider" />
                {priceSummary.totalBaseFare > 0 && (
                  <div className="chk-summary__row"><span>Esas ücret</span><span>{formatPrice(priceSummary.totalBaseFare)}</span></div>
                )}
                {priceSummary.totalTaxes > 0 && (
                  <div className="chk-summary__row"><span>Vergi ve ücretler</span><span>{formatPrice(priceSummary.totalTaxes)}</span></div>
                )}
                {priceSummary.totalServiceFee > 0 && (
                  <div className="chk-summary__row"><span>Hizmet bedeli</span><span>{formatPrice(priceSummary.totalServiceFee)}</span></div>
                )}
                <div className="chk-summary__total">
                  <div>
                    <div className="chk-summary__total-label">Toplam</div>
                    {displayCurrency !== 'TRY' && (
                      <span className="chk-summary__fx" style={{ textAlign: 'left', marginTop: 2 }}>
                        {priceSummary.grandTotal.toFixed(2)} TRY Ödenecek edilecek
                      </span>
                    )}
                  </div>
                  <div className="chk-summary__total-amount">{formatPrice(priceSummary.grandTotal)}</div>
                </div>
              </div>

              {/* ── Ödeme Bilgileri ── */}
              <div className="chk-summary__pay-head">
                <span>Ödeme Bilgileri</span>
                <span className="chk-card-brands">
                  <span>VISA</span><span>MASTER CARD</span>
                </span>
              </div>
              <div className="chk-summary__pay-body">
                <CardPreview
                  cardNumber={cardForm.cardNumber}
                  cardHolder={cardForm.cardHolderName}
                  expiryMonth={cardForm.expiryMonth}
                  expiryYear={cardForm.expiryYear}
                  cvv={cardForm.cvv}
                  showBack={cvvFocused}
                />
                <div className="chk-field">
                  <label className="chk-field__label">Kart Üzerindeki İsim</label>
                  <input type="text" placeholder="Ad Soyad"
                    value={cardForm.cardHolderName}
                    onChange={e => {
                      // Allow only letters (incl. Turkish) and spaces; collapse multiple spaces to one;
                      // capitalize first letter of every word.
                      const raw = e.target.value
                        .replace(/[^A-Za-z\u00C0-\u017F\u0130\u0131\u011E\u011F\u015E\u015F\u00DC\u00FC\u00D6\u00F6\u00C7\u00E7 ]/g, '')
                        .replace(/ {2,}/g, ' ')
                        .replace(/^ +/, '');
                      const formatted = raw
                        .split(' ')
                        .map(w => w ? w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR') : '')
                        .join(' ');
                      setCardForm(p => ({ ...p, cardHolderName: formatted }));
                      setCardErrors(p => ({ ...p, cardHolderName: '' }));
                    }}
                    maxLength={100} autoComplete="cc-name"
                    className={`chk-input ${cardErrors.cardHolderName ? 'chk-input--error' : ''}`} />
                  {cardErrors.cardHolderName && <div className="chk-field__error">{cardErrors.cardHolderName}</div>}
                </div>
                <div className="chk-field">
                  <label className="chk-field__label">Kart Numarası</label>
                  <input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000"
                    value={cardForm.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setCardForm(p => ({ ...p, cardNumber: v }));
                      setCardErrors(p => ({ ...p, cardNumber: '' }));
                    }}
                    maxLength={19} autoComplete="cc-number"
                    className={`chk-input chk-input--card ${cardErrors.cardNumber ? 'chk-input--error' : ''}`} />
                  {cardErrors.cardNumber && <div className="chk-field__error">{cardErrors.cardNumber}</div>}
                </div>
                <div className="chk-field-row chk-field-row--exp">
                  <div className="chk-field">
                    <label className="chk-field__label">Son Kullanma</label>
                    <div className="chk-exp-row">
                      <select value={cardForm.expiryMonth}
                        onChange={e => { setCardForm(p => ({ ...p, expiryMonth: e.target.value })); setCardErrors(p => ({ ...p, expiryMonth: '' })); }}
                        autoComplete="cc-exp-month"
                        className={`chk-select ${cardErrors.expiryMonth ? 'chk-select--error' : ''}`}>
                        <option value="">AA</option>
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select value={cardForm.expiryYear}
                        onChange={e => { setCardForm(p => ({ ...p, expiryYear: e.target.value })); setCardErrors(p => ({ ...p, expiryYear: '' })); }}
                        autoComplete="cc-exp-year"
                        className={`chk-select ${cardErrors.expiryYear ? 'chk-select--error' : ''}`}>
                        <option value="">YYYY</option>
                        {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i)).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    {(cardErrors.expiryMonth || cardErrors.expiryYear) && (
                      <div className="chk-field__error">{cardErrors.expiryMonth || cardErrors.expiryYear}</div>
                    )}
                  </div>
                  <div className="chk-field">
                    <label className="chk-field__label">CVV</label>
                    <input type="text" inputMode="numeric" placeholder="•••"
                      value={cardForm.cvv}
                      onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setCardForm(p => ({ ...p, cvv: v })); setCardErrors(p => ({ ...p, cvv: '' })); }}
                      onFocus={() => setCvvFocused(true)}
                      onBlur={() => setCvvFocused(false)}
                      maxLength={4} autoComplete="cc-csc"
                      className={`chk-input ${cardErrors.cvv ? 'chk-input--error' : ''}`} />
                    {cardErrors.cvv && <div className="chk-field__error">{cardErrors.cvv}</div>}
                  </div>
                </div>

                <button type="button" className="chk-summary__pay-btn"
                  disabled={payDisabled} onClick={triggerPassengerSubmit}>
                  {isProcessing ? 'İşleniyor...' : (
                    <>
                      <IconLock size={15} />
                      <span>{formatPrice(priceSummary.grandTotal)} · Güvenli Ödeme Yap</span>
                    </>
                  )}
                </button>
                <div className="chk-summary__secure">
                  <IconShield size={13} /><span>3D Secure ile güvenli ödeme</span>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Sticky bottom bar (mobile) */}
        <div className="chk-sticky-bar">
          <div className="chk-sticky-bar__inner">
            <div className="chk-sticky-bar__total-wrap">
              <div className="chk-sticky-bar__total-block">
                <div className="chk-sticky-bar__label">Toplam</div>
                <div className="chk-sticky-bar__amount">{formatPrice(priceSummary.grandTotal)}</div>
              </div>
              <div className="chk-sticky-bar__note">{paxSummaryText || '1 Yolcu'} · Tüm vergiler dahil</div>
            </div>
            <button type="button" className="chk-sticky-bar__btn"
              disabled={payDisabled} onClick={triggerPassengerSubmit}>
              {isProcessing ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
            </button>
          </div>
        </div>
      </main>
      <FooterOne />

      {/* Loading overlay */}
      {isProcessing && (
        <div className="chk-loading" role="status" aria-live="polite">
          <div className="chk-loading__card">
            <div className="chk-loading__logo"><span className="accent">Ata</span><span className="dark">Bilet</span></div>
            <div className="chk-loading__bar"><div className="chk-loading__bar-fill" /></div>
            <p className="chk-loading__text">{loadingStep}<span className="chk-loading__dots" /></p>
          </div>
        </div>
      )}

      {/* KVKK Modal */}
      {showKvkkModal && (
        <div className="chk-modal-overlay" role="dialog" aria-modal="true">
          <div className="chk-modal">
            <div className="chk-modal__header">
              <h3 className="chk-modal__title">KVKK Aydınlatma Metni</h3>
              <button type="button" className="chk-modal__close" onClick={() => setShowKvkkModal(false)}>×</button>
            </div>
            <div className="chk-modal__body">
              <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca, kişisel verileriniz veri sorumlusu olarak ATABİLET tarafından işlenebilecektir.</p>
              <h4>İşlenme Amacı</h4>
              <p>Uçak bileti satış işlemleri, yasal yükümlülükler, müşteri ilişkileri yönetimi.</p>
              <h4>İşlenen Veriler</h4>
              <p>Ad, soyad, T.C. kimlik numarası, pasaport numarası, doğum tarihi, cinsiyet, e-posta, telefon, ödeme bilgileri.</p>
              <h4>Aktarım</h4>
              <p>Havayolu şirketleri, ödeme kuruluşları ve yasal zorunluluk halinde yetkili kamu kurumları.</p>
              <h4>Haklarınız</h4>
              <p>KVKK&apos;nın 11. maddesi gereği; verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme ve itiraz haklarına sahipsiniz.</p>
            </div>
            <div className="chk-modal__footer">
              <button type="button" className="chk-modal__btn chk-modal__btn--primary" onClick={() => setShowKvkkModal(false)}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Mesafeli Satış Sözleşmesi Modal */}
      {showSalesModal && (
        <div className="chk-modal-overlay" role="dialog" aria-modal="true">
          <div className="chk-modal">
            <div className="chk-modal__header">
              <h3 className="chk-modal__title">Mesafeli Satış Sözleşmesi</h3>
              <button type="button" className="chk-modal__close" onClick={() => setShowSalesModal(false)}>×</button>
            </div>
            <div className="chk-modal__body">
              <h4>1. Taraflar</h4>
              <p><strong>SATICI:</strong> ATABİLET (“Şirket”). <br /><strong>ALICI:</strong> İşbu sözleşmeyi onaylayarak bilet satın alan gerçek/tüzel kişi.</p>
              <h4>2. Konu</h4>
              <p>İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait internet sitesinden elektronik ortamda siparişini yaptığı uçak bileti satışı ve teslimi ile ilgili 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>
              <h4>3. Ürün / Hizmet ve Bedeli</h4>
              <p>Satın alınan uçak biletinin güzergah, yolcu, tarih, havayolu ve fiyat bilgileri sipariş özetinde belirtilmiş olup, tüm vergiler dahildir. Ödeme kredi/banka kartı ile güvenli ortamda alınır.</p>
              <h4>4. Cayma Hakkı</h4>
              <p>Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi (g) bendi uyarınca, belirli bir tarihte veya dönemde ifa edilmesi gereken yolcu taşıma hizmetlerine ilişkin sözleşmelerde ALICI&apos;nın cayma hakkı bulunmamaktadır. İade ve değişiklik talepleri ilgili havayolunun bilet kuralına (fare rules) tabidir.</p>
              <h4>5. İptal / Değişiklik</h4>
              <p>Bilet iptal ve değişiklik işlemleri havayolunun belirlediği cezai şartlar ve servis ücretleri ile birlikte uygulanır. Promosyonlu/indirimli biletler iade edilmeyebilir.</p>
              <h4>6. Teslim</h4>
              <p>Elektronik bilet (e-ticket), ödeme onayının alınmasının ardından ALICI&apos;nın bildirdiği e-posta adresine gönderilir.</p>
              <h4>7. Yetkili Mahkeme</h4>
              <p>Uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.</p>
              <p>ALICI, işbu sözleşmenin tüm hükümlerini okuyup anladığını ve kabul ettiğini beyan eder.</p>
            </div>
            <div className="chk-modal__footer">
              <button type="button" className="chk-modal__btn chk-modal__btn--primary" onClick={() => setShowSalesModal(false)}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Price change modal */}
      {priceChangedResult && (
        <div className="chk-modal-overlay" role="dialog" aria-modal="true">
          <div className="chk-modal chk-modal--price">
            <div className="chk-modal__header">
              <h3 className="chk-modal__title">Fiyat Güncellemesi</h3>
            </div>
            <div className="chk-modal__body">
              <p>Seçtiğiniz uçuşun fiyatı havayolu tarafından güncellenmiştir.</p>
              <div className="chk-modal__price-compare">
                {priceChangedResult.oldPrice > 0 && (
                  <div className="chk-modal__price-col chk-modal__price-col--old">
                    <span className="chk-modal__price-col-label">Önceki</span>
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
              <button className="chk-modal__btn chk-modal__btn--secondary" onClick={handleRejectPriceChange}>Vazgeç</button>
              <button className="chk-modal__btn chk-modal__btn--primary" onClick={handleAcceptPriceChange}>Devam et</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}