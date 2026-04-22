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
type SenderType = "Customer" | "Admin";

interface Message {
  id: string;
  senderType: SenderType;
  senderId: string;
  senderDisplayName: string;
  body: string;
  createdAt: string;
}

interface TicketDetail {
  id: string;
  ticketNumber: string;
  type: TicketType;
  subject: string;
  status: TicketStatus;
  bookingPnr?: string | null;
  bookingOrigin?: string | null;
  bookingDestination?: string | null;
  createdAt: string;
  lastActivityAt: string;
  messages: Message[];
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

export default function DestekTalebiDetailClient({ ticketId }: { ticketId: string }) {
  const { status } = useSession();
  const router = useRouter();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, { cache: "no-store" });
      if (res.status === 404) {
        setNotFound(true);
        setTicket(null);
      } else if (res.ok) {
        const data = await res.json();
        setTicket(data);
      }
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/destek-talebi/${ticketId}`);
      return;
    }
    if (status === "authenticated") {
      load();
    }
  }, [status, router, ticketId, load]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setReplyError(null);
    if (!reply.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReplyError(data?.error || "Mesaj gönderilemedi.");
        setSending(false);
        return;
      }
      setReply("");
      setSending(false);
      await load();
    } catch {
      setReplyError("Sunucuya ulaşılamadı.");
      setSending(false);
    }
  };

  if (status === "loading" || loading) {
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

  if (notFound || !ticket) {
    return (
      <>
        <TrustBar />
        <HeaderOne />
        <main style={{ minHeight: "60vh", padding: "60px 20px", textAlign: "center" }}>
          <p>Destek talebi bulunamadı.</p>
          <Link href="/destek-talebi" style={{ color: "#047857" }}>← Listeye dön</Link>
        </main>
        <FooterOne />
      </>
    );
  }

  const statusInfo = STATUS_LABELS[ticket.status] ?? STATUS_LABELS.Open;
  const isClosed = ticket.status === "Closed";

  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main style={{ minHeight: "60vh", background: "#f8fafc", padding: "40px 0" }}>
        <div className="container" style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href="/destek-talebi" style={{ color: "#047857", fontSize: 14, marginBottom: 16, display: "inline-block" }}>
            ← Tüm taleplerim
          </Link>

          <div style={{ background: "#fff", padding: 24, borderRadius: 8, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{ticket.ticketNumber}</div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0a1628", margin: 0 }}>
                  {ticket.subject}
                </h1>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: statusInfo.color, padding: "4px 12px", background: "#f3f4f6", borderRadius: 12 }}>
                {statusInfo.text}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, padding: "2px 8px", background: "#f3f4f6", borderRadius: 4 }}>
                {TYPE_LABELS[ticket.type]}
              </span>
              {ticket.bookingPnr && (
                <span style={{ fontSize: 12, padding: "2px 8px", background: "#dbeafe", color: "#1e40af", borderRadius: 4 }}>
                  PNR: {ticket.bookingPnr}
                  {ticket.bookingOrigin && ticket.bookingDestination && ` · ${ticket.bookingOrigin}-${ticket.bookingDestination}`}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {ticket.messages.map((m) => {
              const isCustomer = m.senderType === "Customer";
              return (
                <div
                  key={m.id}
                  style={{
                    background: isCustomer ? "#ecfdf5" : "#fff",
                    border: isCustomer ? "1px solid #a7f3d0" : "1px solid #e5e7eb",
                    padding: 16,
                    borderRadius: 8,
                    alignSelf: isCustomer ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    width: "fit-content",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: isCustomer ? "#047857" : "#0a1628", marginBottom: 4 }}>
                    {m.senderDisplayName} {isCustomer ? "(Siz)" : "(Destek)"}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "#1f2937" }}>{m.body}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6, textAlign: "right" }}>
                    {new Date(m.createdAt).toLocaleString("tr-TR")}
                  </div>
                </div>
              );
            })}
          </div>

          {isClosed ? (
            <div style={{ background: "#fff", padding: 16, borderRadius: 8, textAlign: "center", color: "#6b7280" }}>
              Bu talep kapalı. Yeni bir mesaj göndermek için yeni talep oluşturun.
            </div>
          ) : (
            <form onSubmit={handleReply} style={{ background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Yanıt Yaz</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
                required
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical", marginBottom: 8 }}
              />
              {replyError && (
                <div style={{ color: "#dc2626", marginBottom: 8, fontSize: 14 }}>{replyError}</div>
              )}
              <button
                type="submit"
                disabled={sending}
                style={{
                  background: "#047857",
                  color: "#fff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: sending ? "not-allowed" : "pointer",
                  opacity: sending ? 0.7 : 1,
                }}
              >
                {sending ? "Gönderiliyor..." : "Gönder"}
              </button>
            </form>
          )}
        </div>
      </main>
      <FooterOne />
    </>
  );
}
