"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import { Loader2, ArrowLeft } from "lucide-react";

// Frontend talep tipi -> backend SupportTicketType
// (Refund=1, Change=2, Complaint=3, Technical=4)
type RequestType =
  | "iptal"
  | "degisiklik"
  | "tekerlekli_sandalye"
  | "bagaj"
  | "diger";

const REQUEST_TYPES: {
  value: RequestType;
  label: string;
  description: string;
  backend: number;
  needsBooking: boolean;
}[] = [
  { value: "iptal", label: "İptal Talebi", description: "Bilet iadesi talep ediyorum", backend: 1, needsBooking: true },
  { value: "degisiklik", label: "Tarih / Uçuş Değişikliği", description: "Uçuş tarih veya saat değişikliği", backend: 2, needsBooking: true },
  { value: "tekerlekli_sandalye", label: "Tekerlekli Sandalye", description: "Refakat / sağlık talebi", backend: 3, needsBooking: true },
  { value: "bagaj", label: "Ek Bagaj", description: "Ekstra bagaj talebi", backend: 3, needsBooking: true },
  { value: "diger", label: "Diğer / Genel Soru", description: "Genel soru veya geri bildirim", backend: 3, needsBooking: false },
];

interface BookingSummary {
  id: string;
  internalPnr: string | null;
  status: string | null;
  origin: string | null;
  destination: string | null;
  airlineCode: string | null;
  flightNumber: string | null;
  isFinalized: boolean;
  cancelledAt: string | null;
  segments: {
    marketingAirline: string | null;
    flightNumber: string | null;
    originCode: string | null;
    destinationCode: string | null;
    departureDate: string | null;
    departureTime: string | null;
  }[];
}

function isPastBooking(segments: BookingSummary["segments"]): boolean {
  if (segments.length === 0) return false;
  const first = segments[0];
  if (!first.departureDate) return false;
  const d = new Date(first.departureDate);
  if (Number.isNaN(d.getTime())) return false;
  if (first.departureTime) {
    const [hh, mm] = first.departureTime.slice(0, 5).split(":").map(Number);
    if (!Number.isNaN(hh) && !Number.isNaN(mm)) d.setHours(hh, mm, 0, 0);
  }
  return d < new Date();
}

export default function NewSupportTicketClient() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectBookingId = searchParams.get("bookingId");
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [type, setType] = useState<RequestType>("iptal");
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTypeMeta = REQUEST_TYPES.find((r) => r.value === type)!;
  const needsBooking = selectedTypeMeta.needsBooking;

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login?callbackUrl=%2Fdestek-taleplerim%2Fyeni");
    }
  }, [authStatus, router]);

  if (authStatus === "loading" || authStatus === "unauthenticated") {
    return (
      <>
        <HeaderOne />
        <main style={{ minHeight: "60vh" }} />
        <FooterOne />
      </>
    );
  }

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        setLoadingBookings(true);
        setBookingsError(null);
        const res = await fetch(`/api/flight/my-bookings/user/${userId}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(
            (data as { error?: string })?.error || "Rezervasyonlar yüklenemedi.",
          );
        }
        const list = Array.isArray(data) ? (data as BookingSummary[]) : [];
        setBookings(
          list.filter(
            (b) =>
              (b.status === "Ticketed" || b.isFinalized === true) &&
              !b.cancelledAt &&
              !!b.internalPnr,
          ),
        );
      } catch (e) {
        setBookingsError(
          e instanceof Error ? e.message : "Rezervasyonlar yüklenemedi.",
        );
      } finally {
        setLoadingBookings(false);
      }
    };
    load();
  }, [userId]);

  // Tip "diğer" olunca booking seçimini sıfırla
  useEffect(() => {
    if (!needsBooking) setSelectedBookingId("");
  }, [needsBooking]);

  // Query string ile gelen bookingId varsa, rezervasyonlar yuklendiginde otomatik sec.
  useEffect(() => {
    if (!preselectBookingId) return;
    if (!needsBooking) return;
    if (!bookings.some((b) => b.id === preselectBookingId)) return;
    setSelectedBookingId(preselectBookingId);
  }, [preselectBookingId, bookings, needsBooking]);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsBooking && !selectedBookingId) {
      setError("Lütfen bir uçuş seçiniz.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Açıklama en az 10 karakter olmalıdır.");
      return;
    }
    setError(null);

    const typeLabel = selectedTypeMeta.label;
    const selectedPnr = selectedBooking?.internalPnr ?? null;
    const subject = selectedPnr
      ? `${typeLabel} - ATA PNR ${selectedPnr}`
      : typeLabel;

    const message = [
      `Talep tipi: ${typeLabel}`,
      selectedPnr ? `ATA PNR: ${selectedPnr}` : null,
      selectedBooking
        ? `Güzergah: ${selectedBooking.origin} → ${selectedBooking.destination}`
        : null,
      "",
      description.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    const payload: Record<string, unknown> = {
      type: selectedTypeMeta.backend,
      subject,
      message,
    };
    if (selectedBookingId) payload.bookingId = selectedBookingId;

    try {
      setSubmitting(true);
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string })?.error || "Talep gönderilemedi.",
        );
      }
      const newId = (data as { id?: string })?.id;
      router.push(newId ? `/destek-taleplerim/${newId}` : "/destek-taleplerim");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Talep gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <HeaderOne />
      <main className="pnr-page">
        <div className="pnr-page__wide">
          <Link href="/destek-taleplerim" className="pnr-back">
            <ArrowLeft size={16} /> Taleplerim
          </Link>

          <div className="pnr-card" style={{ marginBottom: 16 }}>
            <h1 className="pnr-search__title" style={{ marginBottom: 4 }}>
              Yeni Destek Talebi
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
              Talep tipini seçin ve gerekli bilgileri girin. İptal/değişiklik
              talepleri için bir rezervasyon seçmeniz gerekir.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Talep Türü — pill kart seçici */}
            <div className="pnr-card" style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Talep Türü
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 8,
                }}
              >
                {REQUEST_TYPES.map((rt) => (
                  <label
                    key={rt.value}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border:
                        type === rt.value
                          ? "2px solid #2563EB"
                          : "1px solid #E5E7EB",
                      cursor: submitting ? "not-allowed" : "pointer",
                      background: type === rt.value ? "#EFF6FF" : "#fff",
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    <input
                      type="radio"
                      name="requestType"
                      value={rt.value}
                      checked={type === rt.value}
                      onChange={() => setType(rt.value)}
                      disabled={submitting}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                        {rt.label}
                      </div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>
                        {rt.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Uçuş seçimi (gerekiyorsa) */}
            {needsBooking && (
              <div className="pnr-card" style={{ marginBottom: 16 }}>
                <label className="pnr-search__label">İlgili Uçuş</label>
                <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6B7280" }}>
                  Talebi açacağınız rezervasyonu seçin.
                </p>

                {loadingBookings && (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <Loader2 size={20} className="pnr-spin" />
                  </div>
                )}

                {!loadingBookings && bookingsError && (
                  <p style={{ color: "#DC2626", fontSize: 13, margin: 0 }}>
                    {bookingsError}
                  </p>
                )}

                {!loadingBookings && !bookingsError && bookings.length === 0 && (
                  <div
                    style={{
                      padding: 16,
                      background: "#F9FAFB",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "#6B7280",
                    }}
                  >
                    Biletlenmiş bir rezervasyonunuz bulunmuyor. Genel sorularınız için
                    talep tipini "Diğer" olarak seçebilirsiniz.
                  </div>
                )}

                {!loadingBookings && !bookingsError && bookings.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {bookings.map((b) => {
                      const seg = b.segments?.[0];
                      const isSelected = selectedBookingId === b.id;
                      return (
                        <label
                          key={b.id}
                          style={{
                            display: "flex",
                            gap: 12,
                            padding: 12,
                            border: `1px solid ${isSelected ? "#0a1628" : "#E5E7EB"}`,
                            borderRadius: 8,
                            cursor: "pointer",
                            background: isSelected ? "#F8FAFC" : "#fff",
                            transition: "border-color .15s",
                          }}
                        >
                          <input
                            type="radio"
                            name="booking"
                            value={b.id}
                            checked={isSelected}
                            onChange={() => setSelectedBookingId(b.id)}
                            disabled={submitting}
                            style={{ marginTop: 4 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 4,
                                flexWrap: "wrap",
                              }}
                            >
                              <strong style={{ fontSize: 14 }}>
                                {b.origin} → {b.destination}
                              </strong>
                              {b.internalPnr && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: "2px 8px",
                                    borderRadius: 6,
                                    background: "#F3F4F6",
                                    color: "#374151",
                                  }}
                                >
                                  ATA PNR: {b.internalPnr}
                                </span>
                              )}
                              {isPastBooking(b.segments ?? []) && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: "2px 8px",
                                    borderRadius: 6,
                                    background: "#FEF3C7",
                                    color: "#92400E",
                                  }}
                                >
                                  Geçmiş Uçuş
                                </span>
                              )}
                            </div>
                            {seg && (
                              <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
                                {seg.marketingAirline} {seg.flightNumber}
                                {seg.departureDate
                                  ? ` • ${new Date(seg.departureDate).toLocaleDateString("tr-TR")}`
                                  : ""}
                                {seg.departureTime ? ` ${seg.departureTime}` : ""}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Açıklama */}
            <div className="pnr-card" style={{ marginBottom: 16 }}>
              <label className="pnr-search__label" htmlFor="description">
                Açıklama
              </label>
              <textarea
                id="description"
                className={`pnr-search__input ${error ? "pnr-search__input--error" : ""}`}
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Talebinizle ilgili detayları yazınız..."
                maxLength={1000}
                disabled={submitting}
                style={{ resize: "vertical", minHeight: 120 }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                {error ? (
                  <span className="pnr-search__error">{error}</span>
                ) : (
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                    En az 10, en fazla 1000 karakter
                  </span>
                )}
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                  {description.length}/1000
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="pnr-search__btn"
              style={{ width: "100%" }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="pnr-spin" />
                  Gönderiliyor...
                </>
              ) : (
                "Talebi Gönder"
              )}
            </button>
          </form>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
