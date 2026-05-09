"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import { Loader2, Inbox, ArrowRight } from "lucide-react";

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

export default function SupportTicketsListClient() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (authStatus === "unauthenticated") {
      router.replace("/giris?callbackUrl=/destek-taleplerim");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/support/tickets", { cache: "no-store" });
        if (res.status === 401) {
          // Oturum sunucuda geçersiz — router cache'i temizleyip login'e yönlendir
          router.refresh();
          router.replace("/giris?callbackUrl=/destek-taleplerim");
          return;
        }
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(
            (data && (data as { error?: string }).error) ||
              "Talepler yüklenemedi.",
          );
        }
        setTickets(Array.isArray(data) ? (data as TicketListItem[]) : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Talepler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authStatus, router]);

  return (
    <>
      <HeaderOne />
      <main className="pnr-page">
        <div className="pnr-page__wide">
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
            <div>
              <h1 className="pnr-search__title" style={{ marginBottom: 4 }}>
                Destek Taleplerim
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
                Açtığınız talepleri ve mesajlaşma geçmişinizi buradan
                görüntüleyebilirsiniz.
              </p>
            </div>
            <Link
              href="/destek-taleplerim/yeni"
              className="pnr-search__btn"
              style={{ width: "auto", padding: "10px 20px", whiteSpace: "nowrap" }}
            >
              + Yeni Talep
            </Link>
          </div>

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

          {!loading && !error && tickets.length === 0 && (
            <div className="pnr-card" style={{ textAlign: "center", padding: 48 }}>
              <Inbox size={36} style={{ color: "#9CA3AF" }} />
              <h3 style={{ marginTop: 12, marginBottom: 4 }}>
                Henüz talebiniz yok
              </h3>
              <p style={{ color: "#6B7280", margin: 0 }}>
                PNR sorgulama ekranından bir talep oluşturabilirsiniz.
              </p>
              <Link
                href="/destek-taleplerim/yeni"
                className="pnr-retry-btn"
                style={{ display: "inline-block", marginTop: 16 }}
              >
                + Yeni Talep Oluştur
              </Link>
            </div>
          )}

          {!loading && !error && tickets.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tickets.map((t) => {
                const st =
                  STATUS_LABEL[String(t.status)] ?? STATUS_LABEL["1"];
                const hasUnreadAdmin =
                  t.lastMessageSenderType === 2 ||
                  t.lastMessageSenderType === "Admin";
                return (
                  <Link
                    key={t.id}
                    href={`/destek-taleplerim/${t.id}`}
                    className="pnr-card"
                    style={{
                      display: "block",
                      textDecoration: "none",
                      color: "inherit",
                      transition: "border-color .15s",
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
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 6,
                              background: st.bg,
                              color: st.color,
                            }}
                          >
                            {st.label}
                          </span>
                          <span style={{ fontSize: 12, color: "#6B7280" }}>
                            #{t.ticketNumber}
                          </span>
                          <span style={{ fontSize: 12, color: "#6B7280" }}>
                            • {TYPE_LABEL[String(t.type)] ?? "Diğer"}
                          </span>
                          {t.bookingPnr && (
                            <span style={{ fontSize: 12, color: "#6B7280" }}>
                              • ATA PNR: {t.bookingPnr}
                            </span>
                          )}
                          {hasUnreadAdmin && (
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
                              Yeni cevap
                            </span>
                          )}
                        </div>
                        <h3
                          style={{
                            margin: "0 0 4px",
                            fontSize: 15,
                            fontWeight: 600,
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
                        <p
                          style={{
                            margin: "6px 0 0",
                            fontSize: 11,
                            color: "#9CA3AF",
                          }}
                        >
                          Son aktivite:{" "}
                          {new Date(t.lastActivityAt).toLocaleString("tr-TR")}
                        </p>
                      </div>
                      <ArrowRight
                        size={18}
                        style={{ color: "#9CA3AF", flexShrink: 0 }}
                      />
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
