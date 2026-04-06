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
      <main className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              {isFinalized ? 'Biletiniz Kesildi!' : 'Ödeme Başarılı!'}
            </h1>
            <p className="text-slate-500">
              {isFinalized
                ? 'Rezervasyonunuz onaylanmış ve biletleriniz başarıyla oluşturulmuştur.'
                : 'Ödemeniz alındı. Bilet durumunuzu "Bilet Sorgula" sayfasından takip edebilirsiniz.'}
            </p>
          </div>

          {/* PNR Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center mb-6">
            <p className="text-sm text-emerald-600 font-medium mb-1">PNR Kodunuz</p>
            <p className="text-3xl font-mono font-bold text-emerald-800 tracking-wider">{pnr}</p>
            <p className="text-sm text-slate-500 mt-2">
              Bu kodu saklayınız. Bilet sorgulama ve değişiklik işlemleri için gereklidir.
            </p>
          </div>

          {/* E-Ticket numbers */}
          {tickets.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">E-Bilet Numaraları</h3>
              <div className="space-y-3">
                {tickets.map((ticket, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <span className="block text-sm font-medium text-slate-800">
                        {ticket.firstName ?? ''} {ticket.lastName ?? ticket.passengerName ?? ''}
                      </span>
                      <span className="block text-xs text-slate-400">
                        {ticket.paxType === 'ADT' ? 'Yetişkin' :
                         ticket.paxType === 'CHD' ? 'Çocuk' :
                         ticket.paxType === 'INF' ? 'Bebek' :
                         ticket.paxType ?? ticket.passengerType ?? ''}
                        {ticket.segmentInfo ? ` — ${ticket.segmentInfo}` : ''}
                      </span>
                    </div>
                    <span className="text-sm font-mono text-slate-700">
                      {ticket.ticketNumber ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full details from readShoppingFile */}
          {readLoading && (
            <div className="flex flex-col items-center py-8">
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
              <p className="text-sm text-slate-400">Detaylar yükleniyor...</p>
            </div>
          )}

          {readResult && (
            <>
              {/* Flight segments */}
              {readResult.segments && readResult.segments.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Uçuş Detayları</h3>
                  <div className="space-y-4">
                    {readResult.segments.map((seg, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-emerald-700">
                          {seg.originCode} → {seg.destinationCode}
                        </span>
                        <div className="text-right">
                          <div className="text-sm text-slate-700">
                            {seg.departureDay} {seg.departureTime} — {seg.arrivalDay} {seg.arrivalTime}
                          </div>
                          <div className="text-xs text-slate-400">
                            {seg.marketingAirline} {seg.flightNumber}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Passenger summary */}
              {readResult.passengers && readResult.passengers.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Yolcu Bilgileri</h3>
                  <div className="space-y-2">
                    {readResult.passengers.map((pax, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1">
                        <span className="text-sm text-slate-700">{pax.firstName} {pax.lastName}</span>
                        <span className="text-sm font-mono text-slate-500">{pax.ticketNumber ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Toplam Tutar</span>
                <span className="text-xl font-bold text-slate-800">
                  {readResult.totalFare?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {readResult.currency}
                </span>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              className="flex-1 py-3 px-6 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition-colors"
              onClick={handleNewSearch}
            >
              Yeni Arama Yap
            </button>
            <Link
              href="/bilet-sorgula"
              className="flex-1 py-3 px-6 rounded-lg border border-slate-300 text-slate-700 font-medium text-center hover:bg-slate-50 transition-colors"
            >
              Bilet Sorgula
            </Link>
            <button
              className="flex-1 py-3 px-6 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              onClick={handlePrint}
            >
              Yazdır
            </button>
          </div>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
