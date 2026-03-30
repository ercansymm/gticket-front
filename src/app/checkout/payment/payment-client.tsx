"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import CountdownTimer from '@/components/booking/CountdownTimer';
import { makePaymentThunk, finalizeShoppingThunk } from '@/redux/features/paymentSlice';
import { setStep } from '@/redux/features/bookingSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import { useSessionTimeout } from '@/hooks/UseSessionTimeout';

const BOOKING_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PreBooked: { label: 'Ön Rezervasyon', color: '#eab308' },
  Reserved: { label: 'Rezerve Edildi', color: '#f59e0b' },
  Confirmed: { label: 'Onaylandı', color: '#10b981' },
  Paid: { label: 'Ödendi', color: '#3b82f6' },
  Ticketed: { label: 'Biletlendi', color: '#22c55e' },
  Cancelled: { label: 'İptal Edildi', color: '#ef4444' },
  Failed: { label: 'Hata Oluştu', color: '#6b7280' },
};

export default function PaymentClient() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { searchId, allocateResult, selectedFlight } = useSelector((state: RootState) => state.flight);
  const { preBookingResult, passengers } = useSelector((state: RootState) => state.booking);
  const {
    paymentResult, paymentLoading, paymentError,
    finalizeResult, finalizeLoading, finalizeError,
  } = useSelector((state: RootState) => state.payment);

  const [paymentMethod, setPaymentMethod] = useState<'running_account' | 'credit_card'>('running_account');
  const [agreed, setAgreed] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const hasFinalized = useRef(false);
  const { showWarning: sessionWarning, dismissWarning: dismissSessionWarning } = useSessionTimeout();

  // Guard: no prebooking → back
  useEffect(() => {
    if (!preBookingResult || !allocateResult) {
      router.push('/');
    }
  }, [preBookingResult, allocateResult, router]);

  useEffect(() => {
    dispatch(setStep('payment'));
  }, [dispatch]);

  // Auto-finalize after successful payment
  useEffect(() => {
    if (paymentResult?.isPaymentSuccess && searchId && !hasFinalized.current) {
      hasFinalized.current = true;
      dispatch(finalizeShoppingThunk({ searchId }));
    }
  }, [paymentResult, searchId, dispatch]);

  // After finalize → success page
  useEffect(() => {
    if (finalizeResult?.isFinalized) {
      dispatch(setStep('confirmation'));
      router.push('/checkout/success');
    }
  }, [finalizeResult, dispatch, router]);

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

  const handlePayment = useCallback(() => {
    if (!searchId || paymentLoading || !agreed) return;

    if (paymentMethod === 'credit_card') {
      if (!validateCard()) return;
      dispatch(makePaymentThunk({
        searchId,
        paymentType: 'CreditCardDirect',
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
  }, [dispatch, searchId, paymentLoading, agreed, paymentMethod, cardForm, validateCard]);

  const handleCountdownExpired = useCallback(() => {
    router.push('/');
  }, [router]);

  if (!preBookingResult || !allocateResult) return null;

  const airBookings = allocateResult.airBookings;
  const firstBooking = airBookings?.[0];

  // Fiyat hesaplaması — priceSummary 0 gelirse airBookings'ten hesapla
  const priceSummary = (() => {
    const ps = allocateResult.priceSummary;
    if (ps && ps.totalBaseFare > 0) return ps;

    const totals = (airBookings ?? []).reduce(
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

  const statusInfo = BOOKING_STATUS_LABELS[preBookingResult.status ?? ''];

  /* Yolcu özeti */
  const paxCounts = (allocateResult.passengers ?? []).reduce((acc, p) => {
    const t = (p.type ?? 'ADT').toUpperCase();
    if (t === 'CHD' || t === 'CHILD') acc.child++;
    else if (t === 'INF' || t === 'INFANT') acc.infant++;
    else acc.adult++;
    return acc;
  }, { adult: 0, child: 0, infant: 0 });

  return (
    <>
      <HeaderOne />
      <main className="bb-checkout">
        {/* Stepper */}
        <div className="bb-stepper">
          <div className="bb-stepper__step bb-stepper__step--done">
            <span className="bb-stepper__icon">✓</span>
            <span className="bb-stepper__text">Uçuş Seçimi</span>
          </div>
          <div className="bb-stepper__connector bb-stepper__connector--done" />
          <div className="bb-stepper__step bb-stepper__step--done">
            <span className="bb-stepper__icon">✓</span>
            <span className="bb-stepper__text">Yolcu Bilgileri</span>
          </div>
          <div className="bb-stepper__connector bb-stepper__connector--done" />
          <div className="bb-stepper__step bb-stepper__step--done">
            <span className="bb-stepper__icon">✓</span>
            <span className="bb-stepper__text">Ön Rezervasyon</span>
          </div>
          <div className="bb-stepper__connector bb-stepper__connector--done" />
          <div className="bb-stepper__step bb-stepper__step--active">
            <span className="bb-stepper__icon">4</span>
            <span className="bb-stepper__text">Ödeme</span>
          </div>
        </div>

        {/* Session timeout warning */}
        {sessionWarning && (
          <div className="bb-countdown bb-countdown--urgent">
            <span className="bb-countdown__icon">⏱</span>
            <span className="bb-countdown__text">Oturumunuz sona ermek üzere. Lütfen ödemeyi tamamlayın.</span>
            <button type="button" onClick={dismissSessionWarning} style={{ background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', color: '#991b1b', fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* Prebooking countdown timer */}
        <CountdownTimer
          expiresAt={preBookingResult.prebookingExpiresAt}
          onExpired={handleCountdownExpired}
        />

        <div className="bb-payment-layout">
          {/* LEFT: Payment form */}
          <div className="bb-payment-main">

            {/* ── Flight Detail Card ── */}
            {selectedFlight && (
              <div className="bb-pay-flight">
                <div className="bb-pay-flight__header">
                  <i className="fa-solid fa-plane" />
                  <span>Uçuş Detayı</span>
                </div>
                <div className="bb-pay-flight__body">
                  <div className="bb-pay-flight__airline">
                    <div className="bb-pay-flight__airline-logo">
                      {selectedFlight.airlineCode && (
                        <img
                          src={`/images/airlines/${selectedFlight.airlineCode}.png`}
                          alt={selectedFlight.airlineName ?? ''}
                          width={32}
                          height={32}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                    </div>
                    <div>
                      <span className="bb-pay-flight__airline-name">{selectedFlight.airlineName}</span>
                      <span className="bb-pay-flight__flight-no">{selectedFlight.flightNumber}</span>
                    </div>
                  </div>
                  <div className="bb-pay-flight__route">
                    <div className="bb-pay-flight__point">
                      <span className="bb-pay-flight__time">{selectedFlight.departureTime}</span>
                      <span className="bb-pay-flight__code">{selectedFlight.originCode}</span>
                      <span className="bb-pay-flight__city">{selectedFlight.originName}</span>
                    </div>
                    <div className="bb-pay-flight__line">
                      <span className="bb-pay-flight__duration">{selectedFlight.durationFormatted}</span>
                      <div className="bb-pay-flight__line-bar">
                        <span className="bb-pay-flight__line-dot" />
                        <span className="bb-pay-flight__line-dash" />
                        <i className="fa-solid fa-plane bb-pay-flight__line-plane" />
                        <span className="bb-pay-flight__line-dash" />
                        <span className="bb-pay-flight__line-dot" />
                      </div>
                      <span className="bb-pay-flight__stop">
                        {selectedFlight.isDirect
                          ? <><i className="fa-solid fa-check" style={{ color: '#10b981', marginRight: 4 }} />Direkt Uçuş</>
                          : selectedFlight.stopText
                        }
                      </span>
                    </div>
                    <div className="bb-pay-flight__point">
                      <span className="bb-pay-flight__time">{selectedFlight.arrivalTime}</span>
                      <span className="bb-pay-flight__code">{selectedFlight.destinationCode}</span>
                      <span className="bb-pay-flight__city">{selectedFlight.destinationName}</span>
                    </div>
                  </div>
                  <div className="bb-pay-flight__meta">
                    <span><i className="fa-regular fa-calendar" /> {selectedFlight.departureDate}</span>
                    {selectedFlight.cabinClassName && (
                      <span><i className="fa-solid fa-chair" /> {selectedFlight.cabinClassName}</span>
                    )}
                    {selectedFlight.baggageInfo?.displayText && (
                      <span><i className="fa-solid fa-suitcase-rolling" /> {selectedFlight.baggageInfo.displayText}</span>
                    )}
                    <span>
                      <i className="fa-solid fa-rotate-left" />{' '}
                      {selectedFlight.isRefundable ? 'İade Edilebilir' : 'İade Edilemez'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Reservation Info Card ── */}
            <div className="bb-pay-reservation">
              <div className="bb-pay-reservation__header">
                <i className="fa-solid fa-bookmark" />
                <span>Rezervasyon Bilgileri</span>
              </div>
              <div className="bb-pay-reservation__body">
                <div className="bb-pay-reservation__row">
                  <div className="bb-pay-reservation__item">
                    <span className="bb-pay-reservation__label">PNR Kodu</span>
                    <span className="bb-pay-reservation__pnr">{preBookingResult.bookingCode}</span>
                  </div>
                  {statusInfo && (
                    <div className="bb-pay-reservation__item">
                      <span className="bb-pay-reservation__label">Durum</span>
                      <span className="bb-pay-reservation__status" style={{ background: statusInfo.color + '18', color: statusInfo.color }}>
                        <span className="bb-pay-reservation__status-dot" style={{ background: statusInfo.color }} />
                        {statusInfo.label}
                      </span>
                    </div>
                  )}
                </div>
                {/* Passenger list in reservation */}
                <div className="bb-pay-reservation__passengers">
                  <span className="bb-pay-reservation__label">Yolcular</span>
                  <div className="bb-pay-reservation__pax-list">
                    {passengers.map((pax, idx) => (
                      <div key={idx} className="bb-pay-reservation__pax">
                        <i className="fa-solid fa-user" />
                        <span>{pax.firstName} {pax.lastName}</span>
                        <span className="bb-pay-reservation__pax-type">
                          {pax.paxType === 'ADT' ? 'Yetişkin' : pax.paxType === 'CHD' ? 'Çocuk' : 'Bebek'}
                        </span>
                      </div>
                    ))}
                    {passengers.length === 0 && (
                      <div className="bb-pay-reservation__pax">
                        <i className="fa-solid fa-users" />
                        <span>
                          {paxCounts.adult > 0 && `${paxCounts.adult} Yetişkin`}
                          {paxCounts.child > 0 && `, ${paxCounts.child} Çocuk`}
                          {paxCounts.infant > 0 && `, ${paxCounts.infant} Bebek`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {preBookingResult.isPriceChanged && (
                <div className="bb-pay-reservation__warning">
                  <i className="fa-solid fa-triangle-exclamation" /> Fiyat güncellenmiştir. Lütfen yeni tutarı kontrol ediniz.
                </div>
              )}
            </div>

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
                  <div className="bb-payment-method__icon">
                    <i className="fa-solid fa-building-columns" />
                  </div>
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
                  <div className="bb-payment-method__icon">
                    <i className="fa-regular fa-credit-card" />
                  </div>
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
                        <input
                          type="text"
                          className="bb-card-form__input"
                          placeholder="AD SOYAD"
                          value={cardForm.cardHolderName}
                          onChange={e => {
                            setCardForm(prev => ({ ...prev, cardHolderName: e.target.value }));
                            setCardErrors(prev => ({ ...prev, cardHolderName: '' }));
                          }}
                          maxLength={100}
                          autoComplete="cc-name"
                        />
                        {cardErrors.cardHolderName && <span className="bb-card-form__error">{cardErrors.cardHolderName}</span>}
                      </div>
                    </div>
                    <div className="bb-card-form__row">
                      <div className={`bb-card-form__field ${cardErrors.cardNumber ? 'bb-card-form__field--error' : ''}`}>
                        <label className="bb-card-form__label">Kart Numarası</label>
                        <div className="bb-card-form__input-wrap">
                          <input
                            type="text"
                            inputMode="numeric"
                            className="bb-card-form__input"
                            placeholder="0000 0000 0000 0000"
                            value={cardForm.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                            onChange={e => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                              setCardForm(prev => ({ ...prev, cardNumber: v }));
                              setCardErrors(prev => ({ ...prev, cardNumber: '' }));
                            }}
                            maxLength={19}
                            autoComplete="cc-number"
                          />
                          <i className="fa-regular fa-credit-card bb-card-form__card-icon" />
                        </div>
                        {cardErrors.cardNumber && <span className="bb-card-form__error">{cardErrors.cardNumber}</span>}
                      </div>
                    </div>
                    <div className="bb-card-form__row bb-card-form__row--triple">
                      <div className={`bb-card-form__field ${cardErrors.expiryMonth ? 'bb-card-form__field--error' : ''}`}>
                        <label className="bb-card-form__label">Ay</label>
                        <select
                          className="bb-card-form__input bb-card-form__select"
                          value={cardForm.expiryMonth}
                          onChange={e => {
                            setCardForm(prev => ({ ...prev, expiryMonth: e.target.value }));
                            setCardErrors(prev => ({ ...prev, expiryMonth: '' }));
                          }}
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
                        <select
                          className="bb-card-form__input bb-card-form__select"
                          value={cardForm.expiryYear}
                          onChange={e => {
                            setCardForm(prev => ({ ...prev, expiryYear: e.target.value }));
                            setCardErrors(prev => ({ ...prev, expiryYear: '' }));
                          }}
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
                        <input
                          type="password"
                          inputMode="numeric"
                          className="bb-card-form__input"
                          placeholder="•••"
                          value={cardForm.cvv}
                          onChange={e => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setCardForm(prev => ({ ...prev, cvv: v }));
                            setCardErrors(prev => ({ ...prev, cvv: '' }));
                          }}
                          maxLength={4}
                          autoComplete="cc-csc"
                        />
                        {cardErrors.cvv && <span className="bb-card-form__error">{cardErrors.cvv}</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Agreement */}
            <div className="bb-agreement">
              <input
                type="checkbox"
                className="bb-agreement__checkbox"
                id="paymentAgreement"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="paymentAgreement" className="bb-agreement__text">
                Satış koşullarını ve <span className="bb-agreement__link">mesafeli satış sözleşmesini</span> okudum, kabul ediyorum.
                Yolcu bilgilerinin doğruluğunu onaylıyorum.
              </label>
            </div>

            {/* Errors */}
            {paymentError && (
              <div className="bb-checkout__price-warning" style={{ marginBottom: 16 }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />{paymentError}
              </div>
            )}
            {finalizeError && (
              <div className="bb-checkout__price-warning" style={{ marginBottom: 16 }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />{finalizeError}
              </div>
            )}

            {/* Loading states */}
            {(paymentLoading || finalizeLoading) && (
              <div className="bb-spinner-overlay" style={{ position: 'relative', minHeight: 120, borderRadius: 12 }}>
                <div className="bb-spinner-wrapper">
                  <div className="bb-spinner bb-spinner--large"></div>
                  <p className="bb-spinner-text">
                    {paymentLoading ? 'Ödeme işleniyor...' : 'Biletleme yapılıyor...'}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bb-checkout__actions">
              <button
                type="button"
                className="bb-checkout__btn bb-checkout__btn--back"
                onClick={() => router.push('/checkout')}
                disabled={paymentLoading || finalizeLoading}
              >
                ← Geri Dön
              </button>
              <button
                type="button"
                className="bb-checkout__btn bb-checkout__btn--next"
                onClick={handlePayment}
                disabled={paymentLoading || finalizeLoading || !agreed}
              >
                {paymentLoading ? 'Ödeme Yapılıyor...' : finalizeLoading ? 'Biletleniyor...' : (
                  <><i className="fa-solid fa-lock" style={{ marginRight: 6 }} />Ödemeyi Tamamla</>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Sidebar — Price Summary */}
          <aside className="bb-payment-sidebar">
            <div className="bb-pay-price">
              <div className="bb-pay-price__header">
                <i className="fa-solid fa-receipt" />
                <span>Fiyat Özeti</span>
              </div>
              <div className="bb-pay-price__body">
                <div className="bb-pay-price__row">
                  <span>Bilet Ücreti</span>
                  <span>{priceSummary.totalBaseFare.toFixed(2)} {priceSummary.currency}</span>
                </div>
                <div className="bb-pay-price__row">
                  <span>Vergiler & Harçlar</span>
                  <span>{priceSummary.totalTaxes.toFixed(2)} {priceSummary.currency}</span>
                </div>
                {priceSummary.totalServiceFee > 0 && (
                  <div className="bb-pay-price__row">
                    <span>Hizmet Bedeli</span>
                    <span>{priceSummary.totalServiceFee.toFixed(2)} {priceSummary.currency}</span>
                  </div>
                )}
                <div className="bb-pay-price__divider" />
                <div className="bb-pay-price__row bb-pay-price__row--total">
                  <span>Genel Toplam</span>
                  <span>{priceSummary.grandTotal.toFixed(2)} {priceSummary.currency}</span>
                </div>
              </div>
              {/* Secure payment badge */}
              <div className="bb-pay-price__secure">
                <i className="fa-solid fa-shield-halved" />
                <span>256-bit SSL ile güvenli ödeme</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
