"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import { Loader2, ArrowLeft, Send, Headset } from "lucide-react";

interface SupportMessage {
  id: string;
  senderType: number | string; // Backend JsonStringEnumConverter -> "Customer"/"Admin"
  senderId: string;
  senderDisplayName: string;
  body: string;
  createdAt: string;
}

interface SupportTicketDetail {
  id: string;
  ticketNumber: string;
  type: number | string;
  subject: string;
  status: number | string; // 1/Open, 2/Closed
  bookingPnr: string | null;
  bookingOrigin: string | null;
  bookingDestination: string | null;
  bookingStatus: string | null;
  userFullName: string | null;
  userEmail: string | null;
  closedAt: string | null;
  closedByAdminName: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  messages: SupportMessage[];
}

const TYPE_LABEL: Record<string, string> = {
  "1": "İade",
  "2": "Değişiklik",
  "3": "Genel / Şikayet",
  "4": "Teknik",
  Refund: "İade",
  Change: "Değişiklik",
  Complaint: "Genel / Şikayet",
  Technical: "Teknik",
};

interface Props {
  ticketId: string;
}

export default function SupportTicketDetailClient({ ticketId }: Props) {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await fetch(`/api/support/tickets/${ticketId}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string })?.error || "Talep yüklenemedi.",
        );
      }
      setTicket(data as SupportTicketDetail);
    } catch (e) {
      // Silent polling sırasında ekrandaki mesajı bozma
      if (!silent) setError(e instanceof Error ? e.message : "Talep yüklenemedi.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "loading") return;
    if (authStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=/destek-taleplerim/${ticketId}`);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, ticketId, router]);

  // Otomatik yenileme — sekme görünürken her 8 saniyede bir sessiz fetch
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const POLL_MS = 8000;
    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          load(true);
        }
      }, POLL_MS);
    };
    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        // Sekmeye dönüldüğünde anında bir kez güncelle
        load(true);
        start();
      } else {
        stop();
      }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) {
      setSendError("Mesaj boş olamaz.");
      return;
    }
    if (reply.trim().length < 2) {
      setSendError("Mesaj çok kısa.");
      return;
    }
    try {
      setSending(true);
      setSendError(null);
      const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string })?.error || "Mesaj gönderilemedi.",
        );
      }
      setReply("");
      // En güncel mesaj listesini al
      await load();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Mesaj gönderilemedi.");
    } finally {
      setSending(false);
    }
  };

  const isClosed = ticket?.status === 2 || ticket?.status === "Closed";

  return (
    <>
      <HeaderOne />
      <main className="pnr-page">
        <div className="pnr-page__wide">
          <Link href="/destek-taleplerim" className="pnr-back">
            <ArrowLeft size={16} /> Tüm Taleplerim
          </Link>

          {loading && (
            <div className="pnr-card" style={{ textAlign: "center", padding: 40 }}>
              <Loader2 size={28} className="pnr-spin" />
              <p style={{ marginTop: 12, color: "#6B7280" }}>Yükleniyor...</p>
            </div>
          )}

          {!loading && error && (
            <div className="pnr-card" style={{ borderColor: "#FECACA" }}>
              <p style={{ color: "#DC2626", margin: 0 }}>{error}</p>
            </div>
          )}

          {!loading && !error && ticket && (
            <>
              {/* Header card */}
              <div className="pnr-card" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: isClosed ? "#F3F4F6" : "#D1FAE5",
                      color: isClosed ? "#6B7280" : "#047857",
                    }}
                  >
                    {isClosed ? "Kapalı" : "Açık"}
                  </span>
                  <span style={{ fontSize: 12, color: "#6B7280" }}>
                    #{ticket.ticketNumber}
                  </span>
                  <span style={{ fontSize: 12, color: "#6B7280" }}>
                    • {TYPE_LABEL[String(ticket.type)] ?? "Diğer"}
                  </span>
                  {ticket.bookingPnr && (
                    <span style={{ fontSize: 12, color: "#6B7280" }}>
                      • ATA PNR: {ticket.bookingPnr}
                    </span>
                  )}
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  {ticket.subject}
                </h1>
                {(ticket.bookingOrigin || ticket.bookingDestination) && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "#6B7280",
                    }}
                  >
                    {ticket.bookingOrigin} → {ticket.bookingDestination}
                  </p>
                )}
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 11,
                    color: "#9CA3AF",
                  }}
                >
                  Oluşturuldu:{" "}
                  {new Date(ticket.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>

              {/* Messages — chat style */}
              <div
                className="pnr-card"
                style={{
                  marginBottom: 16,
                  padding: 0,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 16px",
                    borderBottom: "1px solid #E5E7EB",
                    background: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  <Headset size={16} style={{ color: "#0a1628" }} />
                  Konuşma
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#6B7280",
                    }}
                  >
                    {ticket.messages.length} mesaj
                  </span>
                </div>

                <div
                  style={{
                    background: "#F9FAFB",
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    maxHeight: 520,
                    overflowY: "auto",
                  }}
                >
                  {ticket.messages.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 32,
                        color: "#9CA3AF",
                        fontSize: 13,
                      }}
                    >
                      Mesaj yok
                    </div>
                  ) : (
                    ticket.messages.map((m) => {
                      const isCustomer =
                        m.senderType === 1 || m.senderType === "Customer";
                      return (
                        <div
                          key={m.id}
                          style={{
                            display: "flex",
                            justifyContent: isCustomer
                              ? "flex-end"
                              : "flex-start",
                          }}
                        >
                          <div
                            style={{
                              maxWidth: "75%",
                              padding: "10px 16px",
                              borderRadius: 16,
                              borderBottomRightRadius: isCustomer ? 4 : 16,
                              borderBottomLeftRadius: isCustomer ? 16 : 4,
                              background: isCustomer ? "#2563EB" : "#fff",
                              color: isCustomer ? "#fff" : "#1F2937",
                              border: isCustomer
                                ? "none"
                                : "1px solid #E5E7EB",
                              boxShadow:
                                "0 1px 2px rgba(0, 0, 0, 0.05)",
                              fontSize: 14,
                              lineHeight: 1.5,
                            }}
                          >
                            <div
                              style={{
                                marginBottom: 4,
                                fontSize: 12,
                                fontWeight: 500,
                                color: isCustomer
                                  ? "rgba(219, 234, 254, 1)"
                                  : "#6B7280",
                              }}
                            >
                              {isCustomer
                                ? "Siz"
                                : m.senderDisplayName || "Destek Ekibi"}{" "}
                              ·{" "}
                              {new Date(m.createdAt).toLocaleString("tr-TR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div
                              style={{
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                              }}
                            >
                              {m.body}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Reply form */}
              {!isClosed ? (
                <div className="pnr-card">
                  <form onSubmit={handleSend}>
                    <label
                      className="pnr-search__label"
                      htmlFor="reply"
                      style={{ marginBottom: 8 }}
                    >
                      Cevap yazın
                    </label>
                    <textarea
                      id="reply"
                      className={`pnr-search__input ${
                        sendError ? "pnr-search__input--error" : ""
                      }`}
                      rows={4}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      maxLength={2000}
                      disabled={sending}
                      style={{ resize: "vertical", minHeight: 96 }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 4,
                      }}
                    >
                      {sendError ? (
                        <span className="pnr-search__error">{sendError}</span>
                      ) : (
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                          {reply.length}/2000
                        </span>
                      )}
                      <button
                        type="submit"
                        disabled={sending}
                        className="pnr-search__btn"
                        style={{ width: "auto", padding: "10px 20px" }}
                      >
                        {sending ? (
                          <>
                            <Loader2 size={14} className="pnr-spin" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            Gönder
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="pnr-card">
                  <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
                    Bu talep kapatılmıştır. Yeni bir konu için lütfen yeni bir
                    talep açın.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <FooterOne />
    </>
  );
}
