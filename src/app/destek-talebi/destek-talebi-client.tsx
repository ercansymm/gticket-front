"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import TrustBar from "@/components/homes/home-one/TrustBar";

// Backend JsonStringEnumConverter kullandığı için enum'lar string olarak gelir.
type TicketType = "Refund" | "Change" | "Complaint" | "Technical";
type TicketStatus = "Open" | "Closed";

interface TicketItem {
  id: string;
  ticketNumber: string;
  type: TicketType;
  subject: string;
  status: TicketStatus;
  bookingPnr?: string | null;
  lastMessagePreview?: string | null;
  messageCount: number;
  lastActivityAt: string;
  createdAt: string;
}

const TYPE_LABELS: Record<TicketType, string> = {
  Refund: "İade",
  Change: "Değişiklik",
  Complaint: "Şikayet / Soru",
  Technical: "Teknik Sorun",
};

const STATUS_LABELS: Record<TicketStatus, { text: string; color: string }> = {
  Open: { text: "Açık", color: "#047857" },
  Closed: { text: "Kapalı", color: "#6b7280" },
};

export default function DestekTalebiClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // form
  const [type, setType] = useState<TicketType>("Complaint");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      } else {
        setTickets([]);
      }
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/destek-talebi");
      return;
    }
    if (status === "authenticated") {
      loadTickets();
    }
  }, [status, router, loadTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const requiresBooking = type === "Refund" || type === "Change";
    if (requiresBooking && !bookingId.trim()) {
      setFormError("İade ve değişiklik talepleri için rezervasyon ID girmeniz gerekir.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject: subject.trim(),
          message: message.trim(),
          bookingId: requiresBooking ? bookingId.trim() : null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data?.error || "Talep oluşturulamadı.");
        setSubmitting(false);
        return;
      }

      // reset
      setSubject("");
      setMessage("");
      setBookingId("");
      setType("Complaint");
      setShowForm(false);
      setSubmitting(false);
      await loadTickets();
    } catch {
      setFormError("Sunucuya ulaşılamadı.");
      setSubmitting(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading && tickets.length === 0)) {
    return (
      <>
        <TrustBar />
        <HeaderOne />
        <main style={{ minHeight: "60vh", padding: "60px 20px", textAlign: "center" }}>
          <p>Yükleniyor...</p>
        </main>
        <FooterOne />
      </>
    );
  }

  if (status !== "authenticated" || !session) {
    return null;
  }

  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main style={{ minHeight: "60vh", background: "#f8fafc", padding: "40px 0" }}>
        <div className="container" style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0a1628", margin: 0 }}>
              Destek Taleplerim
            </h1>
            <button
              type="button"
              onClick={() => setShowForm((p) => !p)}
              style={{
                background: "#047857",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {showForm ? "Vazgeç" : "+ Yeni Talep"}
            </button>
          </div>

          {showForm && (
            <div style={{ background: "#fff", padding: 24, borderRadius: 8, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#0a1628" }}>
                Yeni Destek Talebi
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Talep Türü</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TicketType)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 6 }}
                  >
                    <option value="Complaint">Şikayet / Soru</option>
                    <option value="Refund">İade</option>
                    <option value="Change">Değişiklik</option>
                    <option value="Technical">Teknik Sorun</option>
                  </select>
                </div>

                {(type === "Refund" || type === "Change") && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                      Rezervasyon ID
                    </label>
                    <input
                      type="text"
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                      placeholder="Rezervasyon GUID"
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 6 }}
                    />
                    <small style={{ color: "#6b7280" }}>
                      İade ve değişiklik talepleri için zorunlu.
                    </small>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Konu</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    maxLength={200}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 6 }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Mesaj</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical" }}
                  />
                </div>

                {formError && (
                  <div style={{ color: "#dc2626", marginBottom: 12, fontSize: 14 }}>{formError}</div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: "#0a1628",
                    color: "#fff",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Gönderiliyor..." : "Talep Oluştur"}
                </button>
              </form>
            </div>
          )}

          {tickets.length === 0 ? (
            <div style={{ background: "#fff", padding: 40, borderRadius: 8, textAlign: "center", color: "#6b7280" }}>
              Henüz bir destek talebiniz bulunmuyor.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tickets.map((t) => {
                const statusInfo = STATUS_LABELS[t.status] ?? STATUS_LABELS.Open;
                return (
                  <Link
                    key={t.id}
                    href={`/destek-talebi/${t.id}`}
                    style={{
                      background: "#fff",
                      padding: 16,
                      borderRadius: 8,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      textDecoration: "none",
                      color: "#0a1628",
                      display: "block",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700 }}>{t.ticketNumber}</span>
                        <span style={{ fontSize: 12, padding: "2px 8px", background: "#f3f4f6", borderRadius: 4 }}>
                          {TYPE_LABELS[t.type]}
                        </span>
                        {t.bookingPnr && (
                          <span style={{ fontSize: 12, padding: "2px 8px", background: "#dbeafe", color: "#1e40af", borderRadius: 4 }}>
                            PNR: {t.bookingPnr}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: statusInfo.color }}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.subject}</div>
                    {t.lastMessagePreview && (
                      <div style={{ fontSize: 13, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.lastMessagePreview}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
                      {new Date(t.lastActivityAt).toLocaleString("tr-TR")} · {t.messageCount} mesaj
                    </div>
                  </Link>
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
