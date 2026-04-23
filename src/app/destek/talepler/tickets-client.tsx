"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import {
  Loader2,
  Inbox,
  LogOut,
  Plus,
  X,
  Headset,
  Ticket as TicketIcon,
} from "lucide-react";
import {
  getGuestSession,
  clearGuestSession,
  guestFetch,
  GuestSupportSession,
} from "@/lib/guest-support";

interface TicketListItem {
  id: string;
  ticketNumber: string;
  type: number | string;
  subject: string;
  status: number | string;
  bookingPnr: string | null;
  lastMessagePreview: string | null;
  lastMessageSenderType: number | string | null;
  messageCount: number;
  lastActivityAt: string;
  createdAt: string;
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

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  "1": { label: "Açık", color: "#047857", bg: "#D1FAE5" },
  "2": { label: "Kapalı", color: "#6B7280", bg: "#F3F4F6" },
  Open: { label: "Açık", color: "#047857", bg: "#D1FAE5" },
  Closed: { label: "Kapalı", color: "#6B7280", bg: "#F3F4F6" },
};

const REQUEST_TYPES: { value: number; label: string; description: string }[] = [
  { value: 1, label: "İade", description: "Bilet iadesi talep ediyorum" },
  { value: 2, label: "Değişiklik", description: "Tarih/uçuş değişikliği" },
  { value: 3, label: "Şikayet / Genel", description: "Genel soru veya geri bildirim" },
  { value: 4, label: "Teknik Destek", description: "Site / ödeme ile ilgili sorun" },
];

export default function GuestTicketsClient() {
  const router = useRouter();
  const [session, setSession] = useState<GuestSupportSession | null>(null);
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<number>(3);
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const sess = getGuestSession();
    if (!sess) {
      router.replace("/destek");
      return;
    }
    setSession(sess);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await guestFetch("/api/support/guest/tickets");
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        if (res.status === 401) {
          clearGuestSession();
          router.replace("/destek");
          return;
        }
        throw new Error((data as { error?: string })?.error || "Talepler yüklenemedi.");
      }
      setTickets(Array.isArray(data) ? (data as TicketListItem[]) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Talepler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearGuestSession();
    router.replace("/destek");
  };

  const resetForm = () => {
    setFormSubject("");
    setFormMessage("");
    setFormType(3);
    setFormError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const subjectTrim = formSubject.trim();
    const messageTrim = formMessage.trim();

    if (!subjectTrim) {
      setFormError("Konu zorunludur.");
      return;
    }
    if (subjectTrim.length > 200) {
      setFormError("Konu en fazla 200 karakter olabilir.");
      return;
    }
    if (!messageTrim) {
      setFormError("Mesaj zorunludur.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await guestFetch("/api/support/guest/tickets", {
        method: "POST",
        body: JSON.stringify({
          type: formType,
          subject: subjectTrim,
          message: messageTrim,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          clearGuestSession();
          router.replace("/destek");
          return;
        }
        throw new Error((data as { error?: string })?.error || "Talep oluşturulamadı.");
      }
      resetForm();
      setShowForm(false);
      // Yeni talebin detayına git
      if (data?.id) {
        router.push(`/destek/talepler/${data.id}`);
      } else {
        await load();
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Talep oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) return null;

  return (
    <>
      <HeaderOne />
      <main className="pnr-page">
        <div className="pnr-page__wide">
          {/* Header card */}
          <div
            className="pnr-card"
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#EFF6FF",
                  color: "#2563EB",
                }}
              >
                <Headset size={22} />
              </div>
              <div>
                <h1
                  className="pnr-search__title"
                  style={{ marginBottom: 2, fontSize: 18 }}
                >
                  Destek Taleplerim
                </h1>
                <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
                  PNR{" "}
                  <span style={{ fontWeight: 600, color: "#111827" }}>
                    {session.pnr}
                  </span>{" "}
                  · {session.passengerDisplayName}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {!showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="pnr-search__btn"
                  style={{
                    width: "auto",
                    padding: "10px 18px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Plus size={16} />
                  Yeni Talep
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  background: "#fff",
                  color: "#6B7280",
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <LogOut size={14} />
                Çıkış
              </button>
            </div>
          </div>

          {/* New ticket form */}
          {showForm && (
            <div className="pnr-card" style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                  Yeni Talep Oluştur
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  aria-label="Kapat"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#6B7280",
                    padding: 4,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: 12 }}>
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
                            formType === rt.value
                              ? "2px solid #2563EB"
                              : "1px solid #E5E7EB",
                          cursor: "pointer",
                          background: formType === rt.value ? "#EFF6FF" : "#fff",
                          display: "flex",
                          gap: 8,
                          alignItems: "flex-start",
                        }}
                      >
                        <input
                          type="radio"
                          name="formType"
                          value={rt.value}
                          checked={formType === rt.value}
                          onChange={() => setFormType(rt.value)}
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

                <div style={{ marginBottom: 12 }}>
                  <label
                    htmlFor="subject"
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    Konu
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    maxLength={200}
                    placeholder="Talebinizi kısaca özetleyin"
                    className="pnr-search__input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label
                    htmlFor="message"
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    Mesajınız
                  </label>
                  <textarea
                    id="message"
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    rows={5}
                    placeholder="Detaylı açıklama yazın..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontSize: 14,
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>

                {formError && (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      color: "#991B1B",
                      fontSize: 13,
                      marginBottom: 12,
                    }}
                  >
                    {formError}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      background: "#fff",
                      color: "#374151",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="pnr-search__btn"
                    style={{
                      width: "auto",
                      padding: "10px 18px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      opacity: submitting ? 0.6 : 1,
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="pnr-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Talebi Oluştur
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Loading / error / empty / list */}
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

          {!loading && !error && tickets.length === 0 && !showForm && (
            <div className="pnr-card" style={{ textAlign: "center", padding: 48 }}>
              <Inbox size={36} style={{ color: "#9CA3AF" }} />
              <h3 style={{ marginTop: 12, marginBottom: 4 }}>
                Bu rezervasyon için talep yok
              </h3>
              <p style={{ color: "#6B7280", margin: 0 }}>
                Yukarıdaki &quot;Yeni Talep&quot; butonu ile destek talebi açabilirsiniz.
              </p>
            </div>
          )}

          {!loading && !error && tickets.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tickets.map((t) => {
                const st = STATUS_LABEL[String(t.status)] ?? STATUS_LABEL["1"];
                const hasUnreadAdmin =
                  t.lastMessageSenderType === 2 ||
                  t.lastMessageSenderType === "Admin";
                return (
                  <Link
                    key={t.id}
                    href={`/destek/talepler/${t.id}`}
                    className="pnr-card"
                    style={{
                      display: "block",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
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
                          <TicketIcon size={14} style={{ color: "#6B7280" }} />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#6B7280",
                              fontFamily: "monospace",
                            }}
                          >
                            {t.ticketNumber}
                          </span>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: st.bg,
                              color: st.color,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {st.label}
                          </span>
                          <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                            • {TYPE_LABEL[String(t.type)] ?? "Diğer"}
                          </span>
                          {hasUnreadAdmin && (
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: 999,
                                background: "#DBEAFE",
                                color: "#1D4ED8",
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              Yeni cevap
                            </span>
                          )}
                        </div>
                        <h3
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: 15,
                            color: "#111827",
                          }}
                        >
                          {t.subject}
                        </h3>
                        {t.lastMessagePreview && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              color: "#6B7280",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t.lastMessagePreview}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: "right", fontSize: 12, color: "#9CA3AF" }}>
                        {new Date(t.lastActivityAt).toLocaleString("tr-TR")}
                      </div>
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
