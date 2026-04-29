"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";

interface PaymentStatusInfo {
  bookingId: string;
  pnr: string | null;
  status: string | null;
  grandTotal: number | null;
  currency: string | null;
  origin: string | null;
  destination: string | null;
  ticketTimeLimit: string | null;
  isExpired: boolean;
  remainingMinutes: number | null;
  isAlreadyPaid: boolean;
  isCancelled: boolean;
  canRetry: boolean;
}

function humanizeError(raw: string | null): { title: string; detail: string; code: string } {
  if (!raw) {
    return {
      title: "Ödeme tamamlanamadı",
      detail: "Ödemeniz işlenirken beklenmeyen bir sorun oluştu. Kartınızdan herhangi bir tutar çekilmedi.",
      code: "UNKNOWN",
    };
  }
  const lower = raw.toLowerCase();
  if (lower.includes("3d") && (lower.includes("not approved") || lower.includes("denied") || lower.includes("reject"))) {
    return {
      title: "3D Secure doğrulaması tamamlanmadı",
      detail: "Bankanız 3D Secure adımında ödemeyi onaylamadı. SMS şifresi girilmemiş ya da bankanız işlemi reddetmiş olabilir.",
      code: "3DS_NOT_APPROVED",
    };
  }
  if (lower.includes("cardinformationisnotvalid") || lower.includes("card information")) {
    return {
      title: "Kart bilgileri doğrulanamadı",
      detail: "Kart numarası, son kullanma tarihi veya CVV bilgilerinde bir hata var gibi görünüyor. Bilgileri kontrol ederek tekrar deneyiniz.",
      code: "CARD_INVALID",
    };
  }
  if (lower.includes("insufficient") || lower.includes("limit")) {
    return {
      title: "Yetersiz bakiye veya limit",
      detail: "Kartınızın limiti veya bakiyesi bu işlem için yeterli değil. Lütfen farklı bir kart ile tekrar deneyiniz.",
      code: "INSUFFICIENT_FUNDS",
    };
  }
  if (lower.includes("timeout")) {
    return {
      title: "Banka yanıtı zaman aşımına uğradı",
      detail: "Banka ile bağlantıda gecikme yaşandı. Lütfen birkaç saniye bekleyip tekrar deneyiniz.",
      code: "TIMEOUT",
    };
  }
  if (lower.includes("session")) {
    return {
      title: "Ödeme oturumu sona erdi",
      detail: "Ödeme oturumunuzun süresi doldu. Lütfen uçuşunuzu tekrar seçerek işlemi baştan başlatınız.",
      code: "SESSION_EXPIRED",
    };
  }
  return { title: "Ödeme tamamlanamadı", detail: raw, code: "GENERIC" };
}

function formatRemaining(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return "";
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
}

const IconX = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconRefresh = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" /><path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" /><path d="M3 21v-5h5" />
  </svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
  </svg>
);
const IconTicket = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
  </svg>
);
const IconPlane = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(90 12 12)" />
  </svg>
);
const IconSupport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default function FailedClient() {
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState(() => humanizeError(null));
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [statusInfo, setStatusInfo] = useState<PaymentStatusInfo | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);

  useEffect(() => {
    const rawError = searchParams.get("error");
    setErrorInfo(humanizeError(rawError));
    const bid = searchParams.get("bookingId");
    setBookingId(bid);
    try { sessionStorage.removeItem("payment_3ds_session"); } catch { /* noop */ }
    if (bid) {
      setStatusLoading(true);
      fetch(`/api/flight/booking/${encodeURIComponent(bid)}/payment-status`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: PaymentStatusInfo | null) => {
          if (data && data.bookingId) {
            setStatusInfo(data);
            setRemainingMinutes(data.remainingMinutes);
          }
        })
        .catch(() => { /* noop */ })
        .finally(() => setStatusLoading(false));
    }
  }, [searchParams]);

  useEffect(() => {
    if (remainingMinutes === null || remainingMinutes <= 0) return;
    const id = setInterval(() => {
      setRemainingMinutes((prev) => prev === null ? null : Math.max(0, prev - 1));
    }, 60_000);
    return () => clearInterval(id);
  }, [remainingMinutes]);

  const isExpired = statusInfo?.isExpired === true || (remainingMinutes !== null && remainingMinutes <= 0);
  const canRetry = statusInfo?.canRetry === true && !isExpired;
  const isAlreadyPaid = statusInfo?.isAlreadyPaid === true;
  const showCountdown = !!statusInfo?.ticketTimeLimit && !isExpired && !isAlreadyPaid && !statusInfo?.isCancelled;

  const route = useMemo(() => {
    if (!statusInfo?.origin || !statusInfo?.destination) return null;
    return `${statusInfo.origin} → ${statusInfo.destination}`;
  }, [statusInfo]);

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f0f2f7" }}>
      <HeaderOne />

      <section style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px 48px" }}>
        <div style={{ width: "100%", maxWidth: 520 }}>

          {/* ── Ana Kart ── */}
          <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 32px rgba(10,22,40,0.10)" }}>

            {/* Üst Hata Bandı */}
            <div style={{ background: "linear-gradient(135deg,#1a0a0a 0%,#3b0d0d 100%)", padding: "32px 32px 28px", position: "relative", overflow: "hidden" }}>
              {/* dekoratif daire */}
              <div style={{ position: "absolute", right: -40, top: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
              <div style={{ position: "absolute", right: 20, bottom: -50, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

              <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 20 }}>
                {/* Hata ikonu */}
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "rgba(239,68,68,0.15)",
                  border: "2px solid rgba(239,68,68,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, color: "#f87171",
                }}>
                  <IconX />
                </div>

                <div style={{ paddingTop: 4, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
                    Ödeme Başarısız
                  </p>
                  <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.3, margin: 0 }}>
                    {errorInfo.title}
                  </h1>
                </div>
              </div>
            </div>

            {/* Hata açıklama */}
            <div style={{ padding: "24px 28px 0" }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#475569", margin: 0 }}>
                {errorInfo.detail}
              </p>
            </div>

            {/* Ücret alınmadı rozeti */}
            <div style={{ margin: "16px 28px 0" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 8, padding: "8px 14px",
              }}>
                <span style={{ color: "#16a34a", display: "flex" }}><IconShield /></span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>
                  Kartınızdan herhangi bir ücret tahsil edilmedi
                </span>
              </div>
            </div>

            {/* ── Rezervasyon Bilgisi ── */}
            {(bookingId || statusInfo) && (
              <div style={{ margin: "20px 28px 0", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <div style={{ background: "#f8fafc", padding: "10px 16px", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#94a3b8" }}>
                    Rezervasyon Detayı
                  </span>
                </div>
                <div style={{ padding: "4px 0" }}>
                  {route && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
                        <span style={{ color: "#94a3b8" }}><IconPlane /></span> Uçuş
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{route}</span>
                    </div>
                  )}
                  {statusInfo?.pnr && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 13, color: "#64748b" }}>PNR</span>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: "#0f172a", letterSpacing: "0.06em" }}>{statusInfo.pnr}</span>
                    </div>
                  )}
                  {statusInfo?.grandTotal && statusInfo.currency && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 13, color: "#64748b" }}>Tutar</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                        {statusInfo.grandTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {statusInfo.currency}
                      </span>
                    </div>
                  )}
                  {bookingId && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 13, color: "#64748b" }}>İşlem No</span>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b" }}>{bookingId.slice(0, 20)}{bookingId.length > 20 ? "…" : ""}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px" }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>Hata kodu</span>
                    <span style={{
                      fontSize: 11, fontFamily: "monospace", fontWeight: 600,
                      background: "#fef2f2", color: "#dc2626",
                      padding: "2px 8px", borderRadius: 4,
                    }}>{errorInfo.code}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Durum Bildirimleri ── */}
            <div style={{ padding: "20px 28px 0" }}>
              {statusLoading && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", borderRadius: 12,
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid #e2e8f0", borderTopColor: "#047857",
                    animation: "spin 0.8s linear infinite", display: "block", flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, color: "#64748b" }}>Rezervasyon durumu kontrol ediliyor…</span>
                </div>
              )}

              {!statusLoading && isAlreadyPaid && (
                <div style={{
                  display: "flex", gap: 14, padding: "16px",
                  borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "#dcfce7", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#16a34a", flexShrink: 0,
                  }}>
                    <IconCheck />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#14532d", margin: "0 0 4px" }}>
                      Ödeme zaten tamamlanmış
                    </p>
                    <p style={{ fontSize: 13, color: "#166534", margin: 0, lineHeight: 1.5 }}>
                      Biletiniz oluşturuldu. &ldquo;Biletlerim&rdquo; sayfasından detayları görüntüleyebilirsiniz.
                    </p>
                  </div>
                </div>
              )}

              {!statusLoading && showCountdown && (
                <div style={{
                  display: "flex", gap: 14, padding: "16px",
                  borderRadius: 12, background: "#f1f5f9", border: "1px solid #cbd5e1",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "#e2e8f0", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#475569", flexShrink: 0,
                  }}>
                    <IconClock />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>
                      Rezervasyonunuz hâlâ geçerli
                    </p>
                    <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 }}>
                      {remainingMinutes !== null && remainingMinutes > 0
                        ? <>Aynı koltuk için ödeme yapmaya <strong>{formatRemaining(remainingMinutes)}</strong> süreniz kaldı.</>
                        : "Süre dolmadan tekrar deneyebilirsiniz."}
                    </p>
                  </div>
                </div>
              )}

              {!statusLoading && isExpired && !isAlreadyPaid && (
                <div style={{
                  display: "flex", gap: 14, padding: "16px",
                  borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "#fee2e2", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#dc2626", flexShrink: 0,
                  }}>
                    <IconX />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#7f1d1d", margin: "0 0 4px" }}>
                      Rezervasyon süresi doldu
                    </p>
                    <p style={{ fontSize: 13, color: "#991b1b", margin: 0, lineHeight: 1.5 }}>
                      Koltuk yeniden satışa açıldı. Devam etmek için yeni bir arama yapmanız gerekiyor.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Sıradaki Adım ── */}
            {!statusLoading && (
              <div style={{ padding: "20px 28px 0" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12 }}>
                  Ne yapmalısınız?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {!isAlreadyPaid && canRetry && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0a1628", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>1</div>
                      <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6, paddingTop: 4 }}>Kart bilgilerinizi kontrol ederek <strong style={{ color: "#0a1628" }}>ödemeyi tekrar deneyin</strong>. Rezervasyonunuz hâlâ geçerli.</p>
                    </div>
                  )}
                  {!isAlreadyPaid && !canRetry && !isExpired && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0a1628", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>1</div>
                      <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6, paddingTop: 4 }}>Ana sayfaya dönüp <strong style={{ color: "#0a1628" }}>yeni bir arama</strong> yapabilirsiniz.</p>
                    </div>
                  )}
                  {isExpired && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0a1628", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>1</div>
                      <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6, paddingTop: 4 }}>Rezervasyon süresi dolduğu için <strong style={{ color: "#0a1628" }}>yeni bir arama</strong> yapmanız gerekmektedir.</p>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e2e8f0", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                      {canRetry || (!isAlreadyPaid && !isExpired) ? "2" : "1"}
                    </div>
                    <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6, paddingTop: 4 }}>
                      Sorun devam ederse{" "}
                      <a href="mailto:destek@atabilet.com" style={{ color: "#047857", fontWeight: 600, textDecoration: "none" }}>destek@atabilet.com</a>
                      {" "}adresinden destek alabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Aksiyon Butonları ── */}
            <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
              {isAlreadyPaid ? (
                <Link href="/my-tickets" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "14px 20px", borderRadius: 12,
                  background: "linear-gradient(135deg,#047857,#065f46)",
                  color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(4,120,87,0.35)",
                  transition: "opacity 0.2s",
                }}>
                  <IconTicket /> Biletlerimi Gör
                </Link>
              ) : canRetry && bookingId ? (
                <Link href={`/checkout/retry-payment?bookingId=${encodeURIComponent(bookingId)}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "14px 20px", borderRadius: 12,
                  background: "linear-gradient(135deg,#047857,#065f46)",
                  color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(4,120,87,0.35)",
                }}>
                  <IconRefresh /> Ödemeyi Tekrar Dene
                </Link>
              ) : (
                <Link href="/" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "14px 20px", borderRadius: 12,
                  background: "linear-gradient(135deg,#0a1628,#1e3a5f)",
                  color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(10,22,40,0.25)",
                }}>
                  <IconSearch /> Yeni Arama Yap
                </Link>
              )}

              <Link href="/" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "12px 20px", borderRadius: 12,
                border: "1.5px solid #e2e8f0", background: "#fff",
                color: "#475569", fontWeight: 600, fontSize: 14, textDecoration: "none",
              }}>
                Ana Sayfa
              </Link>
            </div>
          </div>

          {/* ── Destek Satırı ── */}
          <div style={{
            marginTop: 20, padding: "14px 20px", borderRadius: 12,
            background: "#fff", border: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{ color: "#94a3b8" }}><IconSupport /></span>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              7/24 destek:{" "}
              <a href="mailto:destek@atabilet.com" style={{ color: "#047857", fontWeight: 600, textDecoration: "none" }}>
                destek@atabilet.com
              </a>
            </span>
          </div>

        </div>
      </section>

      <FooterOne />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
