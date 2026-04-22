"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import { readShoppingFileThunk, logoutSessionThunk, resetPayment } from '@/redux/features/paymentSlice';
import { resetBooking } from '@/redux/features/bookingSlice';
import { clearSearch } from '@/redux/features/flightSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import type { AllocateSegment } from '@/types/flight';
import { getTurkishAirportInfo } from '@/utils/airportTurkishNames';
import { useCurrency } from '@/context/CurrencyContext';

function getCityName(code: string | null): string {
  if (!code) return '';
  const info = getTurkishAirportInfo(code);
  return info?.cityName ?? code;
}

/* ── Airline code → display name (common carriers) ── */
const AIRLINE_NAMES: Record<string, string> = {
  TK: 'Turkish Airlines', PC: 'Pegasus', VF: 'AnadoluJet', XQ: 'SunExpress',
  AJ: 'AnadoluJet', KK: 'AtlasGlobal', LH: 'Lufthansa', BA: 'British Airways',
  AF: 'Air France', KL: 'KLM', EK: 'Emirates', QR: 'Qatar Airways',
  SV: 'Saudia', OS: 'Austrian', LX: 'SWISS', W6: 'Wizz Air',
  FR: 'Ryanair', U2: 'easyJet', SK: 'SAS', FI: 'Icelandair',
};

function getAirlineName(code: string | null): string {
  if (!code) return '';
  return AIRLINE_NAMES[code] ?? code;
}

/* ── Turkish date formatter ── */
const TR_MONTHS = [
  '', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function formatDateTurkish(dateStr: string | null): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10);
  const year = parts[0];
  return `${day} ${TR_MONTHS[month] ?? ''} ${year}`;
}

function formatPaxType(type: string | null): string {
  if (type === 'ADT') return 'Yetişkin';
  if (type === 'CHD') return 'Çocuk';
  if (type === 'INF') return 'Bebek';
  return type ?? '';
}

function formatGender(gender: string | null): string {
  if (gender === 'M') return 'Erkek';
  if (gender === 'F') return 'Kadın';
  return gender ?? '—';
}

/* ── ISO 8601 duration → Turkish readable ("PT2H30M" → "2s 30dk") ── */
function formatDuration(dur: string | null): string {
  if (!dur) return '';
  const match = dur.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/);
  if (!match) return dur;
  const h = match[1] ? `${match[1]}s` : '';
  const m = match[2] ? ` ${match[2]}dk` : '';
  return (h + m).trim();
}

/* ── ISO 8601 duration → clock time ("PT10H40M" → "10:40") ── */
function formatTime(val: string | null): string {
  if (!val) return '—';
  // Already formatted as HH:MM
  if (/^\d{1,2}:\d{2}$/.test(val)) return val;
  // ISO 8601 duration → extract hours:minutes as clock time
  const match = val.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/);
  if (match) {
    const h = (match[1] ?? '0').padStart(2, '0');
    const m = (match[2] ?? '0').padStart(2, '0');
    return `${h}:${m}`;
  }
  return val;
}

/* ── Flight code: avoid duplication like "TK TK2134" ── */
function formatFlightCode(airline: string | null, flightNo: string | null): string {
  if (!flightNo) return airline ?? '';
  if (!airline) return flightNo;
  // If flightNumber already starts with the airline code, just use flightNumber
  if (flightNo.startsWith(airline)) return flightNo;
  return `${airline} ${flightNo}`;
}

/* ── Baggage display with unit ── */
function formatBaggage(allowance: string | null, unit: string | null): string {
  if (!allowance || allowance === '0') return '—';
  // Normalize common unit abbreviations
  const normalizedUnit = unit === 'K' ? 'KG' : unit;
  if (normalizedUnit) return `${allowance} ${normalizedUnit}`;
  return `${allowance} KG`;
}

export default function SuccessClient() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [bookingDetail, setBookingDetail] = useState<any | null>(null);
  const [recovering, setRecovering] = useState(false);
  const { formatPrice } = useCurrency();

  const { searchId, allocateResult, selectedFlight, selectedReturnFlight, searchParams: flightSearchParams } = useSelector((state: RootState) => state.flight);
  const { passengers, contactInfo, preBookingResult } = useSelector((state: RootState) => state.booking);
  const { finalizeResult, readResult, readLoading } = useSelector((state: RootState) => state.payment);

  const hasReadFile = useRef(false);
  const hasLoggedOut = useRef(false);
  const hasFetchedDetail = useRef(false);
  const hasRecovered = useRef(false);

  // URL params (from 3D callback redirect — Redux state is lost after full-page redirect)
  const urlPnr = searchParams.get('pnr');
  const urlBookingId = searchParams.get('bookingId');
  const urlShoppingFileId = searchParams.get('shoppingFileId');
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

  // 3D callback sonrasi redirect ile geldiyse Redux temizlenmis olur. BookingId varsa
  // backend'den booking detayini cek (passengers, segments, prices, contact dahil).
  // Eger isFinalized=false geldiyse otomatik recover-booking dene (FinalizeShopping retry).
  useEffect(() => {
    if (hasReduxData) return;
    if (!urlBookingId) return;
    if (hasFetchedDetail.current) return;
    hasFetchedDetail.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/flight/booking/${encodeURIComponent(urlBookingId)}`);
        if (!res.ok) return;
        let detail = await res.json();
        setBookingDetail(detail);

        // Otomatik recover: odeme alinmis (Paid) ama biletlenmemis ise FinalizeShopping'i tekrar dene.
        if (detail && detail.status === 'Paid' && detail.isFinalized === false && !hasRecovered.current) {
          hasRecovered.current = true;
          setRecovering(true);
          try {
            const rec = await fetch('/api/flight/recover-booking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId: urlBookingId }),
            });
            if (rec.ok) {
              const refreshed = await fetch(`/api/flight/booking/${encodeURIComponent(urlBookingId)}`);
              if (refreshed.ok) detail = await refreshed.json();
              setBookingDetail(detail);
            }
          } catch (recErr) {
            console.warn('recover-booking failed:', recErr);
          } finally {
            setRecovering(false);
          }
        }
      } catch (err) {
        console.error('booking detail fetch failed:', err);
      }
    })();
  }, [hasReduxData, urlBookingId]);

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

  const handleGoHome = () => {
    dispatch(resetPayment());
    dispatch(resetBooking());
    dispatch(clearSearch());
    window.location.href = '/';
  };

  const shoppingFileId = allocateResult?.shoppingFileId ?? urlShoppingFileId ?? undefined;
  // PNR oncelik sirasi: Redux finalizeResult.internalPnr (canli akis) -> bookingDetail.internalPnr
  // (3DS sonrasi backend'den cekilen) -> URL'den gelen pnr (callback'in koydugu) -> bookingDetail.pnr
  // (BB PNR, son care). InternalPnr 'ATA PNR' olarak gosteriliyor; BB PNR'i degildir.
  const pnr = finalizeResult?.internalPnr
    ?? bookingDetail?.internalPnr
    ?? urlPnr
    ?? bookingDetail?.pnr
    ?? '—';
  const tickets = finalizeResult?.tickets ?? [];
  const isFinalized = finalizeResult?.isFinalized ?? bookingDetail?.isFinalized ?? urlFinalized;

  const handleDownloadPdf = useCallback(async (sequenceNo: number, passengerName: string) => {
    if (!shoppingFileId || pdfLoading) return;
    setPdfLoading(true);
    try {
      const response = await fetch(`/api/ticket/pdf/${shoppingFileId}?sequenceNo=${sequenceNo}`);
      if (!response.ok) throw new Error('PDF download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AtaBilet-${pnr}-${passengerName.replace(/\s+/g, '_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
    } finally {
      setPdfLoading(false);
    }
  }, [shoppingFileId, pnr, pdfLoading]);

  if (!hasReduxData && !hasUrlData) return null;

  // Build today's date in Turkish
  const today = new Date();
  const issueDateStr = `${today.getDate()} ${TR_MONTHS[today.getMonth() + 1]} ${today.getFullYear()}`;

  // First passenger info for summary card
  const firstTicket = tickets[0];
  const detailPaxList: any[] = bookingDetail?.passengers ?? [];
  const firstDetailPax = detailPaxList[0];
  const firstPassengerName = firstTicket
    ? `${firstTicket.firstName ?? ''} ${firstTicket.lastName ?? firstTicket.passengerName ?? ''}`.trim()
    : (passengers[0]
        ? `${passengers[0].firstName} ${passengers[0].lastName}`
        : (firstDetailPax
            ? `${firstDetailPax.firstName ?? ''} ${firstDetailPax.lastName ?? ''}`.trim()
            : '—'));
  const firstTicketNumber = firstTicket?.ticketNumber ?? firstDetailPax?.ticketNumber ?? '—';

  // Determine flight type (one-way vs round-trip)
  // After 3DS redirect Redux state is lost, so also detect from segments
  // BiletBank puts ALL segments (outbound AND return) in ONE AirBooking for RT
  const allAllocateSegments = allocateResult?.airBookings?.[0]?.segments ?? [];
  // Backend booking endpoint'inden gelen segment'leri AllocateSegment shape'ine donustur
  const detailSegments: AllocateSegment[] = (bookingDetail?.segments ?? []).map((s: any, i: number) => ({
    segmentId: `detail-${i}`,
    marketingAirline: s.marketingAirline ?? null,
    flightNumber: s.flightNumber ?? null,
    originCode: s.originCode ?? null,
    destinationCode: s.destinationCode ?? null,
    departureDay: s.departureDate ? String(s.departureDate).slice(0, 10) : null,
    departureTime: s.departureTime ?? null,
    arrivalDay: s.arrivalDate ? String(s.arrivalDate).slice(0, 10) : null,
    arrivalTime: s.arrivalTime ?? null,
    bookingClass: s.bookingClass ?? null,
    duration: null,
  }) as unknown as AllocateSegment);
  const segments = readResult?.segments?.length ? readResult.segments
    : (allAllocateSegments.length ? allAllocateSegments : detailSegments);
  const hasRoundTripFromRedux = !!flightSearchParams?.returnDate || !!selectedReturnFlight;
  const flightType = allocateResult?.airBookings?.[0]?.flightType; // "RT" or "OW"

  // Detect round-trip from segments: if the last segment's destination equals the first segment's origin
  const hasRoundTripFromSegments = segments.length >= 2 &&
    segments[segments.length - 1]?.destinationCode === segments[0]?.originCode;
  const isRoundTrip = hasRoundTripFromRedux || flightType === 'RT' || hasRoundTripFromSegments;

  let outboundSegments: AllocateSegment[] = [];
  let returnSegments: AllocateSegment[] = [];

  if (segments.length > 0 && isRoundTrip) {
    // Use actual segment codes (not search params which may be city codes vs airport codes)
    const firstOrigin = segments[0]?.originCode;
    const firstDest = segments[0]?.destinationCode;

    // For 2-segment direct RT (most common): first goes A→B, second goes B→A
    if (segments.length === 2 &&
        segments[1]?.originCode === firstDest &&
        segments[1]?.destinationCode === firstOrigin) {
      outboundSegments = [segments[0]];
      returnSegments = [segments[1]];
    } else {
      // For multi-leg RT: find where the return journey begins.
      // The return leg starts at the segment whose origin matches the
      // first segment's destination (the final outbound destination),
      // AND that segment is not part of the outbound journey itself.
      // Strategy: walk the segments and track where we "arrive" — once
      // we've arrived at the final outbound destination and the NEXT
      // segment departs from there back towards origin, that's the split.
      const searchDest = flightSearchParams?.destination;
      let splitIdx = segments.length;

      for (let i = 1; i < segments.length; i++) {
        const segOrigin = segments[i].originCode;
        // Return leg starts from the final destination of the outbound journey
        // Match against both the first segment's destination and search params destination
        if (segOrigin === firstDest || (searchDest && segOrigin === searchDest)) {
          // Verify this isn't just a connecting leg of the outbound:
          // if the previous segment also arrived at this same point, it's a connection
          const prevDest = segments[i - 1]?.destinationCode;
          if (prevDest === segOrigin && i > 1) {
            // Could be a connection — check if it continues toward the original origin
            // by checking if any later segment ends at the first origin
            const returnsToOrigin = segments.slice(i).some(s => s.destinationCode === firstOrigin);
            if (returnsToOrigin) {
              splitIdx = i;
              break;
            }
          } else {
            splitIdx = i;
            break;
          }
        }
      }

      outboundSegments = segments.slice(0, splitIdx);
      returnSegments = segments.slice(splitIdx);
    }
  } else {
    outboundSegments = segments;
  }

  // Price info — prefer readResult (from ReadShoppingFile), then allocateResult (from Allocate)
  const airBooking = allocateResult?.airBookings?.[0];
  const priceSummary = allocateResult?.priceSummary;
  const readPayment = readResult?.payments?.[0];
  const baseFare = readResult?.baseFare || priceSummary?.totalBaseFare || airBooking?.baseFare || 0;
  const taxes = readResult?.taxes || priceSummary?.totalTaxes || airBooking?.taxes || 0;
  const totalFare = readResult?.grandTotal || readResult?.totalFare || readPayment?.amount || priceSummary?.grandTotal || airBooking?.totalFare || bookingDetail?.grandTotal || 0;
  const currency = readResult?.currency ?? readPayment?.currency ?? priceSummary?.currency ?? airBooking?.currency ?? bookingDetail?.currency ?? 'TRY';

  // Baggage info from allocateResult
  const baggageAllowances = airBooking?.baggageAllowances ?? [];
  const firstBaggage = baggageAllowances[0] ?? selectedFlight?.freeBaggageAllowances?.[0];
  const defaultBaggage = formatBaggage(firstBaggage?.allowance ?? null, firstBaggage?.unit ?? null);

  // Branded fare name
  const brandedItems = airBooking?.brandedItems ?? [];
  const fareName = brandedItems[0]?.brandName ?? selectedFlight?.bookingClassName ?? null;

  // Render a single flight leg
  const renderFlightLeg = (seg: AllocateSegment, idx: number, arr: AllocateSegment[]) => {
    const isLast = idx === arr.length - 1;
    return (
      <div key={seg.segmentId ?? idx}>
        <div className="tc-flight-leg">
          {/* Departure */}
          <div className="tc-flight-leg__point">
            <span className="tc-flight-leg__time">{formatTime(seg.departureTime)}</span>
            <span className="tc-flight-leg__date">{formatDateTurkish(seg.departureDay)}</span>
            <span className="tc-flight-leg__code">{getCityName(seg.originCode)}</span>
          </div>

          {/* Flight line */}
          <div className="tc-flight-leg__line">
            <span className="tc-flight-leg__duration">{formatDuration(seg.duration)}</span>
            <div className="tc-flight-leg__connector">
              <span className="tc-flight-leg__dot" />
              <span className="tc-flight-leg__dash" />
              <svg className="tc-flight-leg__plane" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <span className="tc-flight-leg__dash" />
              <span className="tc-flight-leg__dot" />
            </div>
            <span className="tc-flight-leg__flight-code">
              {formatFlightCode(seg.marketingAirline, seg.flightNumber)}
            </span>
          </div>

          {/* Arrival */}
          <div className="tc-flight-leg__point">
            <span className="tc-flight-leg__time">{formatTime(seg.arrivalTime)}</span>
            <span className="tc-flight-leg__date">{formatDateTurkish(seg.arrivalDay)}</span>
            <span className="tc-flight-leg__code">{getCityName(seg.destinationCode)}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="tc-flight-leg__badges">
          <span className="tc-flight-leg__badge">{getAirlineName(seg.marketingAirline)}</span>
          {(fareName || seg.bookingClass) && (
            <span className="tc-flight-leg__badge tc-flight-leg__badge--class">
              {fareName ?? seg.bookingClass}
            </span>
          )}
          <span className="tc-flight-leg__badge">{defaultBaggage}</span>
        </div>

        {/* Connection divider between legs */}
        {!isLast && (
          <div className="tc-flight-leg__transfer">
            <span className="tc-flight-leg__transfer-line" />
            <span className="tc-flight-leg__transfer-text">Aktarma</span>
            <span className="tc-flight-leg__transfer-line" />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <HeaderOne />
      <main className="tc-page">
        {/* ── Success Banner ── */}
        <div className="tc-banner">
          <div className="tc-banner__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="tc-banner__title">
            {isFinalized ? 'Seyahatiniz Oluşturuldu !' : 'Ödeme Başarılı!'}
          </h1>
          <p className="tc-banner__subtitle">
            Rezervasyon kodunuz aşağıda belirtilmiştir.
          </p>
        </div>

        <div className="tc-content">
          {/* ── Section 1: Reservation Summary Card ── */}
          <div className="tc-summary-card">
            <div className="tc-summary-card__col">
              <span className="tc-summary-card__label">PNR Kodu</span>
              <span className="tc-summary-card__value tc-summary-card__value--pnr">{pnr}</span>
            </div>
            <div className="tc-summary-card__divider" />
            <div className="tc-summary-card__col">
              <span className="tc-summary-card__label">Yolcu</span>
              <span className="tc-summary-card__value">{firstPassengerName}</span>
            </div>
            <div className="tc-summary-card__divider" />
            <div className="tc-summary-card__col">
              <span className="tc-summary-card__label">Bilet No</span>
              <span className="tc-summary-card__value">{firstTicketNumber}</span>
            </div>
            <div className="tc-summary-card__divider" />
            <div className="tc-summary-card__col">
              <span className="tc-summary-card__label">Düzenlenme Tarihi</span>
              <span className="tc-summary-card__value">{issueDateStr}</span>
            </div>
          </div>

          {/* ── Loading state ── */}
          {(readLoading || recovering) && (
            <div className="tc-loading">
              <div className="tc-loading__spinner" />
              <p className="tc-loading__text">{recovering ? 'Biletleme tamamlanıyor...' : 'Uçuş detayları yükleniyor...'}</p>
            </div>
          )}

          {/* ── Section 2: Flight Details ── */}
          {(outboundSegments.length > 0 || returnSegments.length > 0) && (
            <div className={`tc-flights ${!isRoundTrip || returnSegments.length === 0 ? 'tc-flights--single' : ''}`}>
              {/* Outbound card */}
              {outboundSegments.length > 0 && (
                <div className="tc-flight-card tc-flight-card--outbound">
                  <h3 className="tc-flight-card__header">Gidiş Uçuşu</h3>
                  {outboundSegments.map((seg, idx) => renderFlightLeg(seg, idx, outboundSegments))}
                </div>
              )}

              {/* Return card */}
              {returnSegments.length > 0 && (
                <div className="tc-flight-card tc-flight-card--return">
                  <h3 className="tc-flight-card__header">Dönüş Uçuşu</h3>
                  {returnSegments.map((seg, idx) => renderFlightLeg(seg, idx, returnSegments))}
                </div>
              )}
            </div>
          )}

          {/* ── Section 3: Price Summary ── */}
          <div className="tc-card">
            <h3 className="tc-card__header">Ücret Bilgileri</h3>
            <div className="tc-price">
              {baseFare > 0 && (
                <div className="tc-price__row">
                  <span className="tc-price__label">Esas Ücret / Base Fare</span>
                  <span className="tc-price__dots" />
                  <span className="tc-price__value">
                    {formatPrice(baseFare)}
                  </span>
                </div>
              )}
              {taxes > 0 && (
                <div className="tc-price__row">
                  <span className="tc-price__label">Vergiler ve Ücretler / Taxes</span>
                  <span className="tc-price__dots" />
                  <span className="tc-price__value">
                    {formatPrice(taxes)}
                  </span>
                </div>
              )}
              {(baseFare > 0 || taxes > 0) && <div className="tc-price__separator" />}
              <div className="tc-price__row tc-price__row--total">
                <span className="tc-price__label">TOPLAM / TOTAL</span>
                <span className="tc-price__dots" />
                <span className="tc-price__value tc-price__value--total">
                  {formatPrice(totalFare)}
                </span>
              </div>
              <p className="tc-price__note">Taxes / Fees / Charges included in total fare.</p>
            </div>
          </div>

          {/* ── Section 4: Passenger Info ── */}
          {((readResult?.passengers ?? passengers)?.length > 0 || detailPaxList.length > 0) && (
            <div className="tc-card">
              <h3 className="tc-card__header">Yolcu Bilgileri</h3>
              <div className="tc-pax-table">
                <div className="tc-pax-table__head">
                  <span>Ad Soyad</span>
                  <span>TC/Pasaport No</span>
                  <span>Doğum Tarihi</span>
                  <span>Cinsiyet</span>
                  <span>Yolcu Tipi</span>
                  <span>PDF</span>
                </div>
                {readResult?.passengers
                  ? readResult.passengers.map((pax, idx) => {
                      const bookingPax = passengers.find(
                        (p) => p.sequenceNo === pax.sequenceNo ||
                          (p.firstName?.toUpperCase() === pax.firstName?.toUpperCase() &&
                           p.lastName?.toUpperCase() === pax.lastName?.toUpperCase())
                      );
                      const paxType = pax.paxType ?? bookingPax?.paxType ?? null;
                      const seqNo = pax.sequenceNo ?? bookingPax?.sequenceNo ?? (idx + 1);
                      const fullName = `${pax.firstName} ${pax.lastName}`;
                      return (
                        <div key={idx} className="tc-pax-table__row">
                          <span className="tc-pax-table__name">{fullName}</span>
                          <span>{bookingPax?.citizenNo ?? bookingPax?.passportNo ?? '—'}</span>
                          <span>{bookingPax?.birthDate ? formatDateTurkish(bookingPax.birthDate) : '—'}</span>
                          <span>{formatGender(bookingPax?.gender ?? null)}</span>
                          <span>{formatPaxType(paxType)}</span>
                          <span>
                            {shoppingFileId && (
                              <button
                                className="tc-btn-pdf"
                                onClick={() => handleDownloadPdf(seqNo, fullName)}
                                disabled={pdfLoading}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                {pdfLoading ? '...' : 'PDF İndir'}
                              </button>
                            )}
                          </span>
                        </div>
                      );
                    })
                  : passengers.length > 0
                  ? passengers.map((pax, idx) => {
                      const seqNo = pax.sequenceNo ?? (idx + 1);
                      const fullName = `${pax.firstName} ${pax.lastName}`;
                      return (
                        <div key={idx} className="tc-pax-table__row">
                          <span className="tc-pax-table__name">{fullName}</span>
                          <span>{pax.citizenNo ?? pax.passportNo ?? '—'}</span>
                          <span>{pax.birthDate ? formatDateTurkish(pax.birthDate) : '—'}</span>
                          <span>{formatGender(pax.gender)}</span>
                          <span>{formatPaxType(pax.paxType)}</span>
                          <span>
                            {shoppingFileId && (
                              <button
                                className="tc-btn-pdf"
                                onClick={() => handleDownloadPdf(seqNo, fullName)}
                                disabled={pdfLoading}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                {pdfLoading ? '...' : 'PDF İndir'}
                              </button>
                            )}
                          </span>
                        </div>
                      );
                    })
                  : detailPaxList.map((pax, idx) => {
                      const seqNo = pax.sequenceNo ?? (idx + 1);
                      const fullName = `${pax.firstName ?? ''} ${pax.lastName ?? ''}`.trim();
                      return (
                        <div key={idx} className="tc-pax-table__row">
                          <span className="tc-pax-table__name">{fullName || '—'}</span>
                          <span>{pax.citizenNo ?? pax.passportNo ?? '—'}</span>
                          <span>{pax.birthDate ? formatDateTurkish(String(pax.birthDate).slice(0, 10)) : '—'}</span>
                          <span>{formatGender(pax.gender ?? null)}</span>
                          <span>{formatPaxType(pax.type ?? null)}</span>
                          <span>
                            {shoppingFileId ? (
                              <button
                                className="tc-btn-pdf"
                                onClick={() => handleDownloadPdf(seqNo, fullName)}
                                disabled={pdfLoading}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                {pdfLoading ? '...' : 'PDF İndir'}
                              </button>
                            ) : (
                              <span>{pax.ticketNumber ?? '—'}</span>
                            )}
                          </span>
                        </div>
                      );
                    })
                }
              </div>
            </div>
          )}

          {/* ── Section 5: Contact & Actions ── */}
          <div className="tc-bottom">
            <div className="tc-contact">
              <h4 className="tc-contact__title">İletişim Bilgileri</h4>
              {(() => {
                const email = contactInfo?.email ?? firstDetailPax?.email ?? null;
                const phone = contactInfo?.phone ?? firstDetailPax?.phone ?? null;
                if (!email && !phone) return null;
                return (
                  <>
                    {email && (
                      <div className="tc-contact__row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <span>{email}</span>
                      </div>
                    )}
                    {phone && (
                      <div className="tc-contact__row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{phone}</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="tc-actions">
              <button className="tc-btn tc-btn--gray" onClick={handleGoHome}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Ana Sayfaya Dön
              </button>
            </div>
          </div>


        </div>
      </main>
      <FooterOne />
    </>
  );
}
