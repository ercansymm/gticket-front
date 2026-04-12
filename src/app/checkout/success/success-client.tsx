"use client";

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import { readShoppingFileThunk, logoutSessionThunk, resetPayment } from '@/redux/features/paymentSlice';
import { resetBooking } from '@/redux/features/bookingSlice';
import { clearSearch } from '@/redux/features/flightSlice';
import type { RootState, AppDispatch } from '@/redux/store';

export default function SuccessClient() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { searchId } = useSelector((state: RootState) => state.flight);
  const { preBookingResult } = useSelector((state: RootState) => state.booking);
  const { finalizeResult, readResult, readLoading } = useSelector((state: RootState) => state.payment);

  const hasReadFile = useRef(false);
  const hasLoggedOut = useRef(false);

  // URL params (from 3D callback redirect — Redux state is lost after full-page redirect)
  const urlPnr = searchParams.get('pnr');
  const urlBookingId = searchParams.get('bookingId');
  const urlFinalized = searchParams.get('finalized') === 'True' || searchParams.get('finalized') === 'true';

  // Determine data source: Redux state OR URL params
  const hasReduxData = !!finalizeResult;
  const hasUrlData = !!urlPnr || !!urlBookingId;

  // Guard: no data at all → back
  useEffect(() => {
    if (!hasReduxData && !hasUrlData) {
      router.push('/');
    }
  }, [hasReduxData, hasUrlData, router]);

  // Auto read shopping file after finalize (only when Redux flow)
  useEffect(() => {
    if (finalizeResult?.isFinalized && searchId && !hasReadFile.current) {
      hasReadFile.current = true;
      dispatch(readShoppingFileThunk({ searchId }));
    }
  }, [finalizeResult, searchId, dispatch]);

  // Auto logout session after reading (only when Redux flow)
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

  if (!hasReduxData && !hasUrlData) return null;

  const pnr = finalizeResult?.pnr ?? finalizeResult?.bookingCode ?? preBookingResult?.bookingCode ?? urlPnr ?? '—';
  const tickets = finalizeResult?.tickets ?? [];
  const isFinalized = finalizeResult?.isFinalized ?? urlFinalized;

  return (
    <>
      <HeaderOne />
      <main className="bb-success-page">
        <div className="bb-success">
          {/* Success header */}
          <div className="bb-success__header">
            <div className="bb-success__icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="bb-success__title">
              {isFinalized ? 'Biletiniz Kesildi!' : 'Ödeme Başarılı!'}
            </h1>
            <p className="bb-success__subtitle">
              {isFinalized
                ? 'Rezervasyonunuz onaylanmış ve biletleriniz başarıyla oluşturulmuştur.'
                : 'Ödemeniz alındı. Bilet durumunuzu "Bilet Sorgula" sayfasından takip edebilirsiniz.'}
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

          {/* Loading state */}
          {readLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #d1fae5', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: '#9ca3af' }}>Detaylar yükleniyor...</p>
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
              Yeni Arama Yap
            </button>
            <Link href="/bilet-sorgula" className="bb-success__btn bb-success__btn--secondary">
              Bilet Sorgula
            </Link>
            <button className="bb-success__btn bb-success__btn--secondary" onClick={handlePrint}>
              Yazdır
            </button>
          </div>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
