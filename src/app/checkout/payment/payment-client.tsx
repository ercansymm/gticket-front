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

  const handlePayment = useCallback(() => {
    if (!searchId || paymentLoading || !agreed) return;

    dispatch(makePaymentThunk({
      searchId,
      paymentType: 'RunningAccount',
    }));
  }, [dispatch, searchId, paymentLoading, agreed]);

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
            {/* Prebooking info */}
            <div className="bb-checkout__card" style={{ marginBottom: 20 }}>
              <h3 className="bb-checkout__card-title">Rezervasyon Bilgileri</h3>
              <div className="bb-checkout__price-row">
                <span>PNR Kodu</span>
                <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>
                  {preBookingResult.bookingCode}
                </span>
              </div>
              {statusInfo && (
                <div className="bb-checkout__price-row">
                  <span>Durum</span>
                  <span style={{ color: statusInfo.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusInfo.color, display: 'inline-block' }} />
                    {statusInfo.label}
                  </span>
                </div>
              )}
              {preBookingResult.isPriceChanged && (
                <div className="bb-checkout__price-warning" style={{ marginTop: 12, marginBottom: 0 }}>
                  ⚠ Fiyat güncellenmiştir. Lütfen yeni tutarı kontrol ediniz.
                </div>
              )}
            </div>

            {/* Payment method selection */}
            <div className="bb-checkout__card" style={{ marginBottom: 20 }}>
              <h3 className="bb-checkout__card-title">Ödeme Yöntemi Seçin</h3>

              {/* Running Account */}
              <div
                className={`bb-payment-method ${paymentMethod === 'running_account' ? 'bb-payment-method--active' : ''}`}
                onClick={() => setPaymentMethod('running_account')}
              >
                <div className="bb-payment-method__radio" />
                <div className="bb-payment-method__icon">🏦</div>
                <div className="bb-payment-method__info">
                  <p className="bb-payment-method__name">Cari Hesap ile Ödeme</p>
                  <p className="bb-payment-method__desc">Acente cari hesabınızdan tahsil edilir</p>
                </div>
              </div>

              {/* Credit Card — Disabled */}
              <div className="bb-payment-method bb-payment-method--disabled">
                <div className="bb-payment-method__radio" />
                <div className="bb-payment-method__icon">💳</div>
                <div className="bb-payment-method__info">
                  <p className="bb-payment-method__name">Kredi Kartı ile Ödeme</p>
                  <p className="bb-payment-method__desc">Yakında aktif olacaktır</p>
                </div>
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
                ❌ {paymentError}
              </div>
            )}
            {finalizeError && (
              <div className="bb-checkout__price-warning" style={{ marginBottom: 16 }}>
                ❌ {finalizeError}
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
                disabled={paymentLoading || finalizeLoading || !agreed || paymentMethod !== 'running_account'}
              >
                {paymentLoading ? 'Ödeme Yapılıyor...' : finalizeLoading ? 'Biletleniyor...' : '🔒 Ödemeyi Tamamla'}
              </button>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="bb-payment-sidebar">
            {/* Flight summary */}
            {selectedFlight && (
              <div className="bb-checkout__card">
                <h3 className="bb-checkout__card-title">Uçuş Özeti</h3>
                <div className="bb-checkout__flight-mini">
                  <div>
                    <div className="bb-checkout__flight-mini-airline">
                      {selectedFlight.airlineName}
                      <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 8, fontSize: 13 }}>
                        {selectedFlight.flightNumber}
                      </span>
                    </div>
                    <div className="bb-checkout__flight-mini-route">
                      {selectedFlight.departureTime}
                      <span className="bb-checkout__flight-mini-arrow">→</span>
                      {selectedFlight.arrivalTime}
                    </div>
                    <div className="bb-checkout__flight-mini-detail">
                      {selectedFlight.originCode} — {selectedFlight.destinationCode}
                    </div>
                    <div className="bb-checkout__flight-mini-detail">
                      {selectedFlight.departureDate}
                    </div>
                    {selectedFlight.isDirect ? (
                      <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 500 }}>Direkt Uçuş</span>
                    ) : (
                      <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 500 }}>{selectedFlight.stopText}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Passenger summary */}
            <div className="bb-checkout__card">
              <h3 className="bb-checkout__card-title">Yolcular</h3>
              {passengers.map((pax, idx) => (
                <div key={idx} className="bb-checkout__price-row" style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>
                    {pax.firstName} {pax.lastName}
                  </span>
                  <span style={{ color: '#6b7280' }}>
                    {pax.paxType === 'ADT' ? 'Yetişkin' : pax.paxType === 'CHD' ? 'Çocuk' : pax.paxType === 'INF' ? 'Bebek' : pax.paxType}
                  </span>
                </div>
              ))}
              {passengers.length === 0 && (
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  {paxCounts.adult > 0 && `${paxCounts.adult} Yetişkin`}
                  {paxCounts.child > 0 && `, ${paxCounts.child} Çocuk`}
                  {paxCounts.infant > 0 && `, ${paxCounts.infant} Bebek`}
                </div>
              )}
            </div>

            {/* Price summary */}
            {priceSummary && (
              <div className="bb-checkout__card">
                <h3 className="bb-checkout__card-title">Fiyat Detayı</h3>
                <div className="bb-checkout__price-row">
                  <span>Bilet Ücreti</span>
                  <span>{priceSummary.totalBaseFare.toFixed(2)} {priceSummary.currency}</span>
                </div>
                <div className="bb-checkout__price-row">
                  <span>Vergiler &amp; Harçlar</span>
                  <span>{priceSummary.totalTaxes.toFixed(2)} {priceSummary.currency}</span>
                </div>
                {priceSummary.totalServiceFee > 0 && (
                  <div className="bb-checkout__price-row">
                    <span>Hizmet Bedeli</span>
                    <span>{priceSummary.totalServiceFee.toFixed(2)} {priceSummary.currency}</span>
                  </div>
                )}
                <div className="bb-checkout__price-row bb-checkout__price-row--total">
                  <span>Genel Toplam</span>
                  <span>{priceSummary.grandTotal.toFixed(2)} {priceSummary.currency}</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
