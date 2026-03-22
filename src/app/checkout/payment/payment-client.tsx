"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
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
  const { preBookingResult } = useSelector((state: RootState) => state.booking);
  const {
    paymentResult, paymentLoading, paymentError,
    finalizeResult, finalizeLoading, finalizeError,
  } = useSelector((state: RootState) => state.payment);

  const [paymentMethod, setPaymentMethod] = useState<'running_account' | 'credit_card'>('running_account');
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
    if (!searchId || paymentLoading) return;

    // RunningAccount: Only send searchId and paymentType
    dispatch(makePaymentThunk({
      searchId,
      paymentType: 'RunningAccount',
    }));
  }, [dispatch, searchId, paymentLoading]);

  if (!preBookingResult || !allocateResult) return null;

  const priceSummary = allocateResult.priceSummary;
  const statusInfo = BOOKING_STATUS_LABELS[preBookingResult.status ?? ''];

  return (
    <>
      <HeaderOne />
      <main className="bb-checkout">
        <div className="bb-checkout__layout">
          {/* LEFT: Payment form */}
          <div className="bb-checkout__main">
            {/* Stepper */}
            <div className="bb-stepper">
              <div className="bb-stepper__step bb-stepper__step--done">
                <span className="bb-stepper__icon">✓</span>
                <span className="bb-stepper__text">Uçuş seçimi</span>
              </div>
              <div className="bb-stepper__connector bb-stepper__connector--done" />
              <div className="bb-stepper__step bb-stepper__step--done">
                <span className="bb-stepper__icon">✓</span>
                <span className="bb-stepper__text">Yolcu bilgileri</span>
              </div>
              <div className="bb-stepper__connector bb-stepper__connector--done" />
              <div className="bb-stepper__step bb-stepper__step--done">
                <span className="bb-stepper__icon">✓</span>
                <span className="bb-stepper__text">Ön rezervasyon</span>
              </div>
              <div className="bb-stepper__connector bb-stepper__connector--done" />
              <div className="bb-stepper__step bb-stepper__step--active">
                <span className="bb-stepper__icon">4</span>
                <span className="bb-stepper__text">Ödeme</span>
              </div>
            </div>

            {/* Session timeout warning */}
            {sessionWarning && (
              <div className="bb-checkout__price-warning" style={{ background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>⏱ Oturumunuz sona ermek üzere. Lütfen ödemeyi tamamlayın.</span>
                <button type="button" onClick={dismissSessionWarning} style={{ background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', color: '#92400e' }}>✕</button>
              </div>
            )}

            {/* Prebooking info */}
            <div className="bb-checkout__card" style={{ marginBottom: 24 }}>
              <h3 className="bb-checkout__card-title">Rezervasyon Bilgileri</h3>
              <div className="bb-checkout__price-row">
                <span>PNR Kodu</span>
                <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>
                  {preBookingResult.bookingCode}
                </span>
              </div>
              {statusInfo && (
                <div className="bb-checkout__price-row">
                  <span>Durum</span>
                  <span style={{ color: statusInfo.color, fontWeight: 600 }}>{statusInfo.label}</span>
                </div>
              )}
              {preBookingResult.isPriceChanged && (
                <div className="bb-checkout__price-warning">
                  ⚠ Fiyat güncellenmiştir. Lütfen yeni tutarı kontrol ediniz.
                </div>
              )}
            </div>

            {/* Payment method selection */}
            <div className="bb-checkout__card" style={{ marginBottom: 24 }}>
              <h3 className="bb-checkout__card-title">Ödeme Yöntemi</h3>

              {/* Running Account */}
              <label
                className={`bb-pax-panel__gender-btn ${paymentMethod === 'running_account' ? 'bb-pax-panel__gender-btn--active' : ''}`}
                style={{ display: 'block', marginBottom: 12, padding: '16px 20px', cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="running_account"
                  checked={paymentMethod === 'running_account'}
                  onChange={() => setPaymentMethod('running_account')}
                  style={{ marginRight: 12 }}
                />
                Cari Hesap ile Ödeme
              </label>

              {/* Credit Card — Disabled */}
              <label
                className="bb-pax-panel__gender-btn"
                style={{ display: 'block', padding: '16px 20px', opacity: 0.5, cursor: 'not-allowed' }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  disabled
                  style={{ marginRight: 12 }}
                />
                Kredi Kartı ile Ödeme
                <span style={{ display: 'block', fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  Kredi kartı ile ödeme yakında aktif olacaktır
                </span>
              </label>
            </div>

            {/* Credit card form placeholder — disabled */}
            {paymentMethod === 'credit_card' && (
              <div className="bb-checkout__card" style={{ marginBottom: 24, opacity: 0.4, pointerEvents: 'none' }}>
                <h3 className="bb-checkout__card-title">Kart Bilgileri</h3>
                <div className="bb-pax-panel__row">
                  <div className="bb-pax-panel__field">
                    <label className="bb-pax-panel__label">Kart Üzerindeki Ad</label>
                    <input type="text" className="bb-pax-panel__input" placeholder="Ad Soyad" disabled />
                  </div>
                </div>
                <div className="bb-pax-panel__row">
                  <div className="bb-pax-panel__field">
                    <label className="bb-pax-panel__label">Kart Numarası</label>
                    <input type="text" className="bb-pax-panel__input" placeholder="•••• •••• •••• ••••" disabled />
                  </div>
                </div>
                <div className="bb-pax-panel__row">
                  <div className="bb-pax-panel__field">
                    <label className="bb-pax-panel__label">Son Kullanma</label>
                    <input type="text" className="bb-pax-panel__input" placeholder="AA/YY" disabled />
                  </div>
                  <div className="bb-pax-panel__field">
                    <label className="bb-pax-panel__label">CVV</label>
                    <input type="text" className="bb-pax-panel__input" placeholder="•••" disabled />
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {paymentError && (
              <div className="bb-checkout__price-warning" style={{ marginBottom: 16 }}>
                {paymentError}
              </div>
            )}
            {finalizeError && (
              <div className="bb-checkout__price-warning" style={{ marginBottom: 16 }}>
                {finalizeError}
              </div>
            )}

            {/* Loading states */}
            {(paymentLoading || finalizeLoading) && (
              <div className="bb-spinner-overlay" style={{ position: 'relative', minHeight: 120 }}>
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
                Geri Dön
              </button>
              <button
                type="button"
                className="bb-checkout__btn bb-checkout__btn--next"
                onClick={handlePayment}
                disabled={paymentLoading || finalizeLoading || paymentMethod !== 'running_account'}
              >
                {paymentLoading ? 'Ödeme Yapılıyor...' : finalizeLoading ? 'Biletleniyor...' : 'Ödemeyi Tamamla'}
              </button>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="bb-checkout__sidebar">
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
                  </div>
                </div>
              </div>
            )}

            {/* Price summary */}
            {priceSummary && (
              <div className="bb-checkout__card">
                <h3 className="bb-checkout__card-title">Fiyat Özeti</h3>
                <div className="bb-checkout__price-row">
                  <span>Bilet Ücreti</span>
                  <span>{priceSummary.totalBaseFare.toFixed(2)} {priceSummary.currency}</span>
                </div>
                <div className="bb-checkout__price-row">
                  <span>Vergiler</span>
                  <span>{priceSummary.totalTaxes.toFixed(2)} {priceSummary.currency}</span>
                </div>
                <div className="bb-checkout__price-row">
                  <span>Hizmet Bedeli</span>
                  <span>{priceSummary.totalServiceFee.toFixed(2)} {priceSummary.currency}</span>
                </div>
                <div className="bb-checkout__price-row bb-checkout__price-row--total">
                  <span>Toplam</span>
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
