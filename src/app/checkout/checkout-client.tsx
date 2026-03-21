"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import PassengerForm from '@/components/booking/PassengerForm';
import { updatePassengersThunk } from '@/redux/features/bookingSlice';
import { setStep, setPassengers, setContactInfo } from '@/redux/features/bookingSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import type { PassengerItem, ContactInfo } from '@/types/booking';

export default function CheckoutClient() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement | null>(null);

  const { allocateResult, selectedFlight, searchId } = useSelector(
    (state: RootState) => state.flight
  );
  const {
    updatePassengersLoading,
    updatePassengersError,
    updatePassengersDone,
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

  if (!allocateResult || !selectedFlight) return null;

  const { priceSummary, passengers, isPriceChanged } = allocateResult;
  if (!priceSummary) return null;

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

  /* ── Submit handler ── */
  const handlePassengerSubmit = useCallback(
    (passengerItems: PassengerItem[], contact: ContactInfo) => {
      if (!searchId) return;

      // Save to redux
      dispatch(setPassengers(passengerItems));
      dispatch(setContactInfo(contact));

      // Send to API
      dispatch(updatePassengersThunk({
        searchId,
        passengers: passengerItems,
        contact,
      }));
    },
    [dispatch, searchId]
  );

  /* ── After successful update, navigate to next step ── */
  useEffect(() => {
    if (updatePassengersDone) {
      dispatch(setStep('summary'));
      // TODO: Navigate to payment/summary page when ready
    }
  }, [updatePassengersDone, dispatch]);

  return (
    <>
      <HeaderOne />
      <main className="bb-checkout">
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

            {/* API Error */}
            {updatePassengersError && (
              <div className="bb-checkout__price-warning">
                {updatePassengersError}
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
                Geri Dön
              </button>
              <button
                type="submit"
                className="bb-checkout__btn bb-checkout__btn--next"
                disabled={updatePassengersLoading}
                onClick={() => {
                  // Trigger form submit via the PassengerForm's form element
                  const form = document.querySelector('.bb-passenger-form') as HTMLFormElement;
                  form?.requestSubmit();
                }}
              >
                {updatePassengersLoading ? 'Kaydediliyor...' : 'Devam Et'}
              </button>
            </div>
          </div>

          {/* ──── RIGHT: Sidebar ──── */}
          <aside className="bb-checkout__sidebar">
            {/* Flight summary card */}
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
            className="bb-checkout__bottom-bar-btn"
            disabled={updatePassengersLoading}
            onClick={() => {
              const form = document.querySelector('.bb-passenger-form') as HTMLFormElement;
              form?.requestSubmit();
            }}
          >
            {updatePassengersLoading ? 'Kaydediliyor...' : 'Devam'}
          </button>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
