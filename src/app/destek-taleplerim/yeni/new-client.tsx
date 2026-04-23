"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import { Loader2, ArrowLeft, Plane } from "lucide-react";

// Frontend talep tipi -> backend SupportTicketType
// (Refund=1, Change=2, Complaint=3, Technical=4)
type RequestType =
  | "iptal"
  | "degisiklik"
  | "tekerlekli_sandalye"
  | "ozel_yemek"
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
  { value: "ozel_yemek", label: "Özel Yemek", description: "Diyet / özel yemek talebi", backend: 3, needsBooking: true },
  { value: "bagaj", label: "Ek Bagaj", description: "Ekstra bagaj talebi", backend: 3, needsBooking: true },
  { value: "diger", label: "Diğer / Genel Soru", description: "Genel soru veya geri bildirim", backend: 3, needsBooking: false },
];

interface BookingSummary {
  id: string;
  // Backend C# JsonNamingPolicy.CamelCase sadece ilk karakteri küçültür:
  // PNR → pNR, GrandTotal → grandTotal. Bu yüzden iki olası anahtar da olabilir.
  pnr?: string | null;
  pNR?: string | null;
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

const getPnr = (b: BookingSummary): string | null =>
  b.pnr ?? b.pNR ?? null;

export default function NewSupportTicketClient() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [type, setType] = useState<RequestType>("iptal");
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [bookingTab, setBookingTab] = useState<"active" | "all">("active");
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTypeMeta = REQUEST_TYPES.find((r) => r.value === type)!;
  const needsBooking = selectedTypeMeta.needsBooking;

  useEffect(() => {
    if (authStatus === "loading") return;
    if (authStatus === "unauthenticated") {
      router.replace("/login?callbackUrl=/destek-taleplerim/yeni");
      return;
    }
  }, [authStatus, router]);

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
        setBookings(list.filter((b) => !b.cancelledAt));
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

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  // Bugün başlangıcı (00:00) — bugün kalkacak uçuş henüz aktif sayılır
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const isUpcoming = (b: BookingSummary): boolean => {
    const dateStr = b.segments?.[0]?.departureDate;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() >= todayStart.getTime();
  };

  const visibleBookings =
    bookingTab === "active" ? bookings.filter(isUpcoming) : bookings;

  // Sekme değişince seçili uçuş görünür listede yoksa sıfırla
  useEffect(() => {
    if (
      selectedBookingId &&
      !visibleBookings.some((b) => b.id === selectedBookingId)
    ) {
      setSelectedBookingId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingTab, bookings]);

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
    const selectedPnr = selectedBooking ? getPnr(selectedBooking) : null;
    const subject = selectedPnr
      ? `${typeLabel} - PNR ${selectedPnr}`
      : typeLabel;

    const message = [
      `Talep tipi: ${typeLabel}`,
      selectedPnr ? `PNR: ${selectedPnr}` : null,
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
                  Talebi açacağınız aktif rezervasyonu seçin.
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
                    Aktif bir rezervasyonunuz bulunmuyor. Genel sorularınız için
                    talep tipini "Diğer" olarak seçebilirsiniz.
                  </div>
                )}

                {!loadingBookings && !bookingsError && bookings.length > 0 && (
                  <>
                    {/* Sekmeler */}
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        padding: 4,
                        background: "#F3F4F6",
                        borderRadius: 8,
                        marginBottom: 12,
                        width: "fit-content",
                      }}
                    >
                      {(
                        [
                          { key: "active", label: "Aktif Uçuşlarım" },
                          { key: "all", label: "Tüm Uçuşlarım" },
                        ] as const
                      ).map((tab) => {
                        const count =
                          tab.key === "active"
                            ? bookings.filter(isUpcoming).length
                            : bookings.length;
                        const isActive = bookingTab === tab.key;
                        return (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => setBookingTab(tab.key)}
                            style={{
                              padding: "6px 14px",
                              fontSize: 13,
                              fontWeight: 600,
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                              background: isActive ? "#fff" : "transparent",
                              color: isActive ? "#0a1628" : "#6B7280",
                              boxShadow: isActive
                                ? "0 1px 2px rgba(0,0,0,0.06)"
                                : "none",
                              transition: "all .15s",
                            }}
                          >
                            {tab.label} ({count})
                          </button>
                        );
                      })}
                    </div>

                    {visibleBookings.length === 0 ? (
                      <div
                        style={{
                          padding: 16,
                          background: "#F9FAFB",
                          borderRadius: 8,
                          fontSize: 13,
                          color: "#6B7280",
                        }}
                      >
                        Bu sekmede gösterilecek uçuş bulunmuyor.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {visibleBookings.map((b) => {
                      const seg = b.segments?.[0];
                      const isSelected = selectedBookingId === b.id;
                      const pnr = getPnr(b);
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
                              <Plane size={14} style={{ color: "#0a1628" }} />
                              <strong style={{ fontSize: 14 }}>
                                {b.origin} → {b.destination}
                              </strong>
                              {pnr && (
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
                                  PNR: {pnr}
                                </span>
                              )}
                              {b.status && (
                                <span style={{ fontSize: 11, color: "#6B7280" }}>
                                  • {b.status}
                                </span>
                              )}
                            </div>
                            {seg && (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  color: "#6B7280",
                                }}
                              >
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
                  </>
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
