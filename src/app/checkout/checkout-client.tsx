"use client";

import { useEffect, useCallback, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import PassengerForm from '@/components/booking/PassengerForm';
import { updatePassengersThunk, makePreBookingThunk } from '@/redux/features/bookingSlice';
import { setStep, setPassengers, setContactInfo } from '@/redux/features/bookingSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import type { PassengerItem, ContactInfo } from '@/types/booking';
import { useSessionTimeout } from '@/hooks/UseSessionTimeout';

const AIRLINE_COLORS: Record<string, { bg: string; color: string }> = {
  TK: { bg: '#E30A17', color: '#fff' },
  PC: { bg: '#FFB800', color: '#1a1a1a' },
  VF: { bg: '#1A56DB', color: '#fff' },
  XQ: { bg: '#E30A17', color: '#fff' },
  KK: { bg: '#00529B', color: '#fff' },
};
const FALLBACK_STYLE = { bg: '#6b7280', color: '#fff' };

export default function CheckoutClient() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const { showWarning: sessionWarning, dismissWarning: dismissSessionWarning } = useSessionTimeout();

  const { allocateResult, selectedFlight, searchId: allocateSearchId, searchResults, selectedBrandedFareItemId } = useSelector(
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

  /* ── Submit handler — chain: updatePassengers → makePreBooking → navigate ── */
  const submitRef = useRef(false);
  const handlePassengerSubmit = useCallback(
    async (passengerItems: PassengerItem[], contact: ContactInfo) => {
      if (submitRef.current) return; // double-submit guard
      if (!searchId || !productId || !productItemId) {
        console.error('Missing booking data:', { searchId: !!searchId, productId: !!productId, productItemId: !!productItemId });
        return;
      }
      submitRef.current = true;

      // Save to redux
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
        await dispatch(makePreBookingThunk({
          searchId,
          productId,
          brandedFareItemId,
          passengers: passengerItems,
          contact,
        })).unwrap();

        // 3. Başarılı → ödeme sayfasına yönlendir
        dispatch(setStep('payment'));
        router.push('/checkout/payment');
      } catch (err) {
        console.error('[Checkout] Passenger/PreBooking chain failed:', err);
        // Hata mesajını kullanıcıya göster — scroll to error
        setTimeout(() => {
          const errorEl = document.querySelector('.bb-checkout__price-warning');
          if (errorEl) errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      } finally {
        submitRef.current = false;
      }
    },
    [dispatch, searchId, productId, productItemId, brandedFareItemId, router]
  );

  // Guard: render nothing until allocate data is ready
  if (!allocateResult || !selectedFlight) return null;

  const airlineCode = selectedFlight.airlineCode;
  const logoPath = airlineCode ? `/images/airlines/${airlineCode}.svg` : null;
  const brandStyle = (airlineCode && AIRLINE_COLORS[airlineCode]) || FALLBACK_STYLE;

  return (
    <>
      <HeaderOne />
      <main className="bb-checkout">
        {/* Session timeout warning */}
        {sessionWarning && (
          <div className="bb-countdown">
            <span className="bb-countdown__icon">⏱</span>
            <span className="bb-countdown__text">Oturumunuz sona ermek üzere. Lütfen işleminizi tamamlayın.</span>
            <button type="button" onClick={dismissSessionWarning} style={{ background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', color: '#92400e', fontSize: 16 }}>✕</button>
          </div>
        )}

        <div className="bb-checkout__layout">
          {/* ──── LEFT: Main content ──── */}
          <div className="bb-checkout__main">
            {/* Auth banner — automatic guest/member detection */}
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

            {/* Price changed warning */}
            {isPriceChanged && (
              <div className="bb-checkout__price-warning">
                ⚠ Fiyat güncellenmiştir. Lütfen yeni fiyatı kontrol ediniz.
              </div>
            )}

            {/* Missing data guard */}
            {(!productId || !productItemId || !searchId) && (
              <div className="bb-checkout__price-warning">
                Uçuş tahsis bilgileri eksik. Lütfen geri dönüp tekrar uçuş seçiniz.
              </div>
            )}

            {/* API Error — updatePassengers */}
            {updatePassengersError && (
              <div className="bb-checkout__price-warning">
                {updatePassengersError}
              </div>
            )}

            {/* PreBooking loading */}
            {preBookingLoading && (
              <div className="bb-spinner-overlay" style={{ position: 'relative', minHeight: 120, borderRadius: 12 }}>
                <div className="bb-spinner-wrapper">
                  <div className="bb-spinner bb-spinner--large"></div>
                  <p className="bb-spinner-text">Ön rezervasyon oluşturuluyor...</p>
                </div>
              </div>
            )}

            {/* PreBooking error */}
            {preBookingError && (
              <div className="bb-checkout__price-warning">
                {preBookingError}
              </div>
            )}

            {/* Passenger Form */}
            <PassengerForm
              passengers={passengers}
              onSubmit={handlePassengerSubmit}
              loading={updatePassengersLoading}
            />

            {/* Action buttons */}
            <div className="bb-checkout__actions">
              <button
                type="button"
                className="bb-checkout__btn bb-checkout__btn--back"
                onClick={() => router.push('/search-results')}
              >
                ← Geri Dön
              </button>
              <button
                type="button"
                className="bb-checkout__btn bb-checkout__btn--next"
                disabled={updatePassengersLoading || preBookingLoading || !productId || !productItemId || !searchId}
                onClick={() => {
                  const form = document.querySelector('.bb-passenger-form') as HTMLFormElement;
                  if (form) {
                    form.requestSubmit();
                  }
                }}
              >
                {updatePassengersLoading ? 'Kaydediliyor...' : preBookingLoading ? 'Rezervasyon oluşturuluyor...' : 'Devam Et →'}
              </button>
            </div>
          </div>

          {/* ──── RIGHT: Sidebar ──── */}
          <aside className="bb-checkout__sidebar">
            {/* Flight summary card */}
            <div className="bb-checkout__card">
              <h3 className="bb-checkout__card-title">Uçuş Özeti</h3>
              <div className="bb-checkout__flight-mini">
                <div className="bb-checkout__flight-mini-logo"
                  style={!logoPath ? { background: brandStyle.bg, color: brandStyle.color, border: 'none' } : undefined}
                >
                  {logoPath ? (
                    <Image
                      src={logoPath}
                      alt={selectedFlight.airlineName ?? 'airline'}
                      width={36}
                      height={36}
                      onError={(e) => {
                        const target = e.currentTarget.parentElement;
                        if (target) {
                          target.style.background = brandStyle.bg;
                          target.style.color = brandStyle.color;
                          target.style.border = 'none';
                        }
                        e.currentTarget.style.display = 'none';
                        const fallback = document.createElement('span');
                        fallback.style.fontWeight = '700';
                        fallback.style.fontSize = '13px';
                        fallback.style.letterSpacing = '1px';
                        fallback.textContent = airlineCode ?? '??';
                        target?.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
                      {airlineCode ?? '??'}
                    </span>
                  )}
                </div>
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
                    {selectedFlight.durationFormatted && (
                      <span style={{ marginLeft: 12 }}>{selectedFlight.durationFormatted}</span>
                    )}
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
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>
                {paxSummaryText}
              </div>
            </div>

            {/* Price summary card */}
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
          </aside>
        </div>

        {/* Mobile bottom sticky bar */}
        <div className="bb-checkout__bottom-bar">
          <div>
            <div className="bb-checkout__bottom-bar-info">{paxSummaryText} toplam tutar</div>
            <div className="bb-checkout__bottom-bar-price">
              {priceSummary.grandTotal.toFixed(2)} {priceSummary.currency}
            </div>
          </div>
          <button
            type="button"
            className="bb-checkout__bottom-bar-btn"
            disabled={updatePassengersLoading || preBookingLoading || !productId || !productItemId || !searchId}
            onClick={() => {
              const form = document.querySelector('.bb-passenger-form') as HTMLFormElement;
              if (form) {
                form.requestSubmit();
              }
            }}
          >
            {updatePassengersLoading ? 'Kaydediliyor...' : preBookingLoading ? 'Rezervasyon...' : 'Devam'}
          </button>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
