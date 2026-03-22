"use client";

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import { readShoppingFileThunk, logoutSessionThunk, resetPayment } from '@/redux/features/paymentSlice';
import { resetBooking } from '@/redux/features/bookingSlice';
import { clearSearch } from '@/redux/features/flightSlice';
import type { RootState, AppDispatch } from '@/redux/store';

export default function SuccessClient() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { searchId } = useSelector((state: RootState) => state.flight);
  const { preBookingResult } = useSelector((state: RootState) => state.booking);
  const { finalizeResult, readResult, readLoading } = useSelector((state: RootState) => state.payment);

  const hasReadFile = useRef(false);
  const hasLoggedOut = useRef(false);

  // Guard: no finalize result → back
  useEffect(() => {
    if (!finalizeResult) {
      router.push('/');
    }
  }, [finalizeResult, router]);

  // Auto read shopping file after finalize
  useEffect(() => {
    if (finalizeResult?.isFinalized && searchId && !hasReadFile.current) {
      hasReadFile.current = true;
      dispatch(readShoppingFileThunk({ searchId }));
    }
  }, [finalizeResult, searchId, dispatch]);

  // Auto logout session after reading
  useEffect(() => {
    if (readResult && searchId && !hasLoggedOut.current) {
      hasLoggedOut.current = true;
      dispatch(logoutSessionThunk({ searchId }));
    }
  }, [readResult, searchId, dispatch]);

  const handleNewSearch = () => {
    dispatch(resetPayment());
    dispatch(resetBooking());
    dispatch(clearSearch());
    router.push('/');
  };

  if (!finalizeResult) return null;

  const pnr = finalizeResult.pnr ?? finalizeResult.bookingCode ?? preBookingResult?.bookingCode ?? '—';
  const tickets = finalizeResult.tickets ?? [];

  return (
    <>
      <HeaderOne />
      <main className="bb-checkout" style={{ minHeight: '60vh' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 16px' }}>
          {/* Success header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#22c55e', marginBottom: 8 }}>
              Biletiniz Kesildi!
            </h1>
            <p style={{ color: '#6b7280', fontSize: 16 }}>
              Rezervasyonunuz onaylanmış ve biletleriniz oluşturulmuştur.
            </p>
          </div>

          {/* PNR Card */}
          <div className="bb-checkout__card" style={{ marginBottom: 24, textAlign: 'center' }}>
            <h3 className="bb-checkout__card-title">PNR Kodunuz</h3>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 4, color: '#1d4ed8', padding: '16px 0' }}>
              {pnr}
            </div>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              Bu kodu saklayınız. Bilet sorgulama ve işlemler için gereklidir.
            </p>
          </div>

          {/* E-Ticket numbers */}
          {tickets.length > 0 && (
            <div className="bb-checkout__card" style={{ marginBottom: 24 }}>
              <h3 className="bb-checkout__card-title">E-Bilet Numaraları</h3>
              {tickets.map((ticket, idx) => (
                <div key={idx} className="bb-checkout__price-row" style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {ticket.firstName ?? ''} {ticket.lastName ?? ticket.passengerName ?? ''}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {ticket.paxType ?? ticket.passengerType ?? ''}{ticket.segmentInfo ? ` — ${ticket.segmentInfo}` : ''}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {ticket.ticketNumber ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full details from readShoppingFile */}
          {readLoading && (
            <div className="bb-spinner-overlay" style={{ position: 'relative', minHeight: 80 }}>
              <div className="bb-spinner-wrapper">
                <div className="bb-spinner"></div>
                <p className="bb-spinner-text">Detaylar yükleniyor...</p>
              </div>
            </div>
          )}

          {readResult && (
            <div className="bb-checkout__card" style={{ marginBottom: 24 }}>
              <h3 className="bb-checkout__card-title">Uçuş Detayları</h3>
              {readResult.segments?.map((seg, idx) => (
                <div key={idx} className="bb-checkout__price-row" style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {seg.originCode} → {seg.destinationCode}
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      {seg.departureDay} {seg.departureTime} — {seg.arrivalDay} {seg.arrivalTime}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {seg.marketingAirline} {seg.flightNumber}
                    </div>
                  </div>
                </div>
              ))}

              {/* Passenger summary */}
              {readResult.passengers?.map((pax, idx) => (
                <div key={idx} className="bb-checkout__price-row">
                  <span>{pax.firstName} {pax.lastName}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{pax.ticketNumber ?? '—'}</span>
                </div>
              ))}

              <div className="bb-checkout__price-row bb-checkout__price-row--total" style={{ marginTop: 12 }}>
                <span>Toplam Tutar</span>
                <span>{readResult.totalFare?.toFixed(2)} {readResult.currency}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="bb-checkout__btn bb-checkout__btn--next"
              onClick={handleNewSearch}
            >
              Yeni Arama Yap
            </button>
            <button
              className="bb-checkout__btn bb-checkout__btn--back"
              onClick={() => router.push('/bilet-sorgula')}
            >
              Bilet Sorgula
            </button>
          </div>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
