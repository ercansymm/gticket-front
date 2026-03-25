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

  const handlePrint = () => {
    window.print();
  };

  if (!finalizeResult) return null;

  const pnr = finalizeResult.pnr ?? finalizeResult.bookingCode ?? preBookingResult?.bookingCode ?? '—';
  const tickets = finalizeResult.tickets ?? [];

  return (
    <>
      <HeaderOne />
      <main className="bb-checkout">
        <div className="bb-success">
          {/* Success header */}
          <div className="bb-success__header">
            <div className="bb-success__icon">
              <span className="bb-success__icon-check">✓</span>
            </div>
            <h1 className="bb-success__title">Biletiniz Kesildi!</h1>
            <p className="bb-success__subtitle">
              Rezervasyonunuz onaylanmış ve biletleriniz başarıyla oluşturulmuştur.
            </p>
          </div>

          {/* PNR Card */}
          <div className="bb-success__pnr-card">
            <p className="bb-success__pnr-label">PNR Kodunuz</p>
            <p className="bb-success__pnr-code">{pnr}</p>
            <p className="bb-success__pnr-hint">
              Bu kodu saklayınız. Bilet sorgulama ve değişiklik işlemleri için gereklidir.
            </p>
          </div>

          {/* E-Ticket numbers */}
          {tickets.length > 0 && (
            <div className="bb-success__tickets">
              <h3 className="bb-success__tickets-title">E-Bilet Numaraları</h3>
              {tickets.map((ticket, idx) => (
                <div key={idx} className="bb-success__ticket-row">
                  <div className="bb-success__ticket-pax">
                    <span className="bb-success__ticket-name">
                      {ticket.firstName ?? ''} {ticket.lastName ?? ticket.passengerName ?? ''}
                    </span>
                    <span className="bb-success__ticket-type">
                      {ticket.paxType === 'ADT' ? 'Yetişkin' :
                       ticket.paxType === 'CHD' ? 'Çocuk' :
                       ticket.paxType === 'INF' ? 'Bebek' :
                       ticket.paxType ?? ticket.passengerType ?? ''}
                      {ticket.segmentInfo ? ` — ${ticket.segmentInfo}` : ''}
                    </span>
                  </div>
                  <span className="bb-success__ticket-number">
                    {ticket.ticketNumber ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Full details from readShoppingFile */}
          {readLoading && (
            <div className="bb-spinner-overlay" style={{ position: 'relative', minHeight: 80, borderRadius: 12 }}>
              <div className="bb-spinner-wrapper">
                <div className="bb-spinner"></div>
                <p className="bb-spinner-text">Detaylar yükleniyor...</p>
              </div>
            </div>
          )}

          {readResult && (
            <>
              {/* Flight segments */}
              {readResult.segments && readResult.segments.length > 0 && (
                <div className="bb-success__flight-card">
                  <h3 className="bb-success__flight-card-title">Uçuş Detayları</h3>
                  {readResult.segments.map((seg, idx) => (
                    <div key={idx} className="bb-success__segment">
                      <span className="bb-success__segment-route">
                        {seg.originCode} → {seg.destinationCode}
                      </span>
                      <div className="bb-success__segment-detail">
                        <div className="bb-success__segment-datetime">
                          {seg.departureDay} {seg.departureTime} — {seg.arrivalDay} {seg.arrivalTime}
                        </div>
                        <div className="bb-success__segment-airline">
                          {seg.marketingAirline} {seg.flightNumber}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Passenger summary */}
              {readResult.passengers && readResult.passengers.length > 0 && (
                <div className="bb-success__tickets">
                  <h3 className="bb-success__tickets-title">Yolcu Bilgileri</h3>
                  {readResult.passengers.map((pax, idx) => (
                    <div key={idx} className="bb-success__ticket-row">
                      <span className="bb-success__ticket-name">{pax.firstName} {pax.lastName}</span>
                      <span className="bb-success__ticket-number">{pax.ticketNumber ?? '—'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="bb-success__total">
                <span className="bb-success__total-label">Toplam Tutar</span>
                <span className="bb-success__total-amount">
                  {readResult.totalFare?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {readResult.currency}
                </span>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="bb-success__actions">
            <button className="bb-success__btn bb-success__btn--primary" onClick={handleNewSearch}>
              ✈️ Yeni Arama Yap
            </button>
            <button className="bb-success__btn bb-success__btn--secondary" onClick={() => router.push('/bilet-sorgula')}>
              🔍 Bilet Sorgula
            </button>
            <button className="bb-success__btn bb-success__btn--secondary" onClick={handlePrint}>
              🖨️ Yazdır
            </button>
          </div>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
