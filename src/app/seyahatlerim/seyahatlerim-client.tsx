"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import { Download, MessageSquarePlus, Loader2 } from "lucide-react";
import type { MyBookingSummary, MyBookingSegment } from "@/types/flight";


function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return "—";
  return timeStr.slice(0, 5);
}

function formatPrice(amount: number, currency: string | null) {
  const c = currency ?? "TRY";
  try {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${c}`;
  }
}

export default function SeyahatlerimClient() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<MyBookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (authStatus === "unauthenticated") {
      router.replace("/login?callbackUrl=/seyahatlerim");
      return;
    }

    const userId = (session?.user as { id?: string } | undefined)?.id;
    const email = session?.user?.email;
    if (!userId && !email) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = userId
          ? `/api/flight/my-bookings/user/${encodeURIComponent(userId)}`
          : `/api/flight/my-bookings/email/${encodeURIComponent(email!)}`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error((data as { error?: string }).error ?? "Rezervasyonlar yüklenemedi.");
        setBookings(Array.isArray(data) ? (data as MyBookingSummary[]) : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Rezervasyonlar yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authStatus, session, router]);

  const handleDownloadPdf = useCallback(async (booking: MyBookingSummary) => {
    if (!booking.biletBankFileId || !booking.id) return;
    if (pdfLoadingId) return;
    setPdfLoadingId(booking.id);
    try {
      const passengerName = booking.firstPassenger
        ? `${booking.firstPassenger.firstName ?? ""}_${booking.firstPassenger.lastName ?? ""}`.trim()
        : "yolcu";
      const response = await fetch(`/api/ticket/pdf/${booking.biletBankFileId}`);
      if (!response.ok) throw new Error("PDF indirilemedi");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AtaBilet-${booking.internalPnr ?? booking.pnr ?? "bilet"}-${passengerName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Bilet PDF'i indirilemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setPdfLoadingId(null);
    }
  }, [pdfLoadingId]);

  // Sadece ATA PNR'i olan, biletlenmis ve iptal edilmemis rezervasyonlari goster.
  const ticketedBookings = bookings.filter((b) =>
    (b.status === "Ticketed" || b.isFinalized === true) && !b.cancelledAt && !!b.internalPnr
  );

  return (
    <>
      <HeaderOne />
      <main className="syt-page">
        <div className="syt-page__inner">
          <div className="syt-header">
            <div>
              <h1 className="syt-header__title">Seyahatlerim</h1>
              <p className="syt-header__sub">Aktif uçuş biletleriniz</p>
            </div>
          </div>

          {loading && (
            <div className="syt-state-box">
              <span className="syt-spinner" />
              <p>Rezervasyonlar yükleniyor...</p>
            </div>
          )}

          {!loading && error && (
            <div className="syt-state-box syt-state-box--error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && ticketedBookings.length === 0 && (
            <div className="syt-state-box">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
              </svg>
              <h3>Aktif biletiniz yok</h3>
              <p>Henüz biletlenmiş bir seyahatiniz bulunmuyor.</p>
              <Link href="/" className="syt-cta-btn">Uçuş Ara</Link>
            </div>
          )}

          {!loading && !error && ticketedBookings.length > 0 && (
            <div className="syt-list">
              {ticketedBookings.map((b) => {
                const segs: MyBookingSegment[] = b.segments ?? [];
                // Gidis-Donus tespiti: birden fazla segment varsa ve son segmentin
                // origin'i ilk segmentin destination'una esitse RT olarak kabul edilir.
                const isRound =
                  segs.length > 1 &&
                  segs[0].destinationCode === segs[segs.length - 1].originCode &&
                  segs[0].originCode === segs[segs.length - 1].destinationCode;

                const ataPnr = b.internalPnr ?? "—";

                return (
                  <div key={b.id ?? b.internalPnr ?? b.pnr} className="syt-ticket">
                    {/* Airline strip */}
                    <div className="syt-ticket__strip">
                      <span className="syt-ticket__airline">
                        {b.airlineCode ?? "—"}
                        {b.flightNumber && <span className="syt-ticket__fnum"> {b.flightNumber}</span>}
                      </span>
                      <span className="syt-ticket__type">{isRound ? "Gidiş-Dönüş" : "Tek Yön"}</span>
                    </div>

                    {/* Body — segmentler tek yon gibi alt alta listelenir */}
                    <div className="syt-ticket__body">
                      <div className="syt-leg-list">
                        {segs.length === 0 && (
                          <div className="syt-leg syt-leg--empty">
                            <span>{b.origin ?? "—"}</span>
                            <span className="syt-leg__sep">→</span>
                            <span>{b.destination ?? "—"}</span>
                          </div>
                        )}
                        {segs.map((s, idx) => {
                          const legLabel = isRound ? (idx === 0 ? "Gidiş" : "Dönüş") : null;
                          return (
                            <div key={idx} className="syt-leg">
                              {legLabel && <span className="syt-leg__label">{legLabel}</span>}

                              <div className="syt-leg__row">
                                <div className="syt-leg__city">
                                  <span className="syt-leg__iata">{s.originCode ?? "—"}</span>
                                  <span className="syt-leg__time">{formatTime(s.departureTime)}</span>
                                </div>

                                <div className="syt-leg__arrow">→</div>

                                <div className="syt-leg__city syt-leg__city--right">
                                  <span className="syt-leg__iata">{s.destinationCode ?? "—"}</span>
                                  <span className="syt-leg__date">{formatDate(s.departureDate)}</span>
                                </div>
                              </div>

                              {s.flightNumber && (
                                <span className="syt-leg__flight">
                                  {s.marketingAirline ?? ""} {s.flightNumber}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Perforated divider */}
                      <div className="syt-ticket__perf" />

                      {/* Details row */}
                      <div className="syt-ticket__details">
                        <div className="syt-ticket__detail-item">
                          <span className="syt-ticket__detail-label">ATA PNR</span>
                          <span className="syt-ticket__detail-val syt-ticket__pnr">{ataPnr}</span>
                        </div>
                        <div className="syt-ticket__detail-item">
                          <span className="syt-ticket__detail-label">Yolcu</span>
                          <span className="syt-ticket__detail-val">
                            {b.firstPassenger
                              ? `${b.firstPassenger.firstName ?? ""} ${b.firstPassenger.lastName ?? ""}`.trim() || "—"
                              : `${b.passengerCount} Kişi`}
                          </span>
                        </div>
                        <div className="syt-ticket__detail-item">
                          <span className="syt-ticket__detail-label">Tutar</span>
                          <span className="syt-ticket__detail-val syt-ticket__price">{formatPrice(b.grandTotal, b.currency)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer — Talep Olustur + E-Bilet Indir */}
                    <div className="syt-ticket__footer">
                      <span className="syt-ticket__status-badge syt-ticket__status-badge--active">
                        Biletlendi
                      </span>
                      <div className="syt-ticket__actions">
                        {b.id && (
                          <Link
                            href={`/destek-taleplerim/yeni?bookingId=${encodeURIComponent(b.id)}`}
                            className="syt-action-btn syt-action-btn--ghost"
                          >
                            <MessageSquarePlus size={15} />
                            Talep Oluştur
                          </Link>
                        )}
                        {b.biletBankFileId && (
                          <button
                            type="button"
                            className="syt-action-btn syt-action-btn--primary"
                            onClick={() => handleDownloadPdf(b)}
                            disabled={pdfLoadingId === b.id}
                          >
                            {pdfLoadingId === b.id ? (
                              <>
                                <Loader2 size={15} className="syt-spin" />
                                İndiriliyor...
                              </>
                            ) : (
                              <>
                                <Download size={15} />
                                E-Bilet İndir
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <FooterOne />
    </>
  );
}
