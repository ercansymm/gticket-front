"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import AirlineLogo from "@/components/common/AirlineLogo";
import '../checkout.css';

/* ─── Types ─── */
interface PaymentStatusInfo {
  bookingId: string;
  pnr: string | null;
  status: string | null;
  grandTotal: number | null;
  currency: string | null;
  origin: string | null;
  destination: string | null;
  airlineCode: string | null;
  flightNumber: string | null;
  ticketTimeLimit: string | null;
  isExpired: boolean;
  remainingMinutes: number | null;
  isAlreadyPaid: boolean;
  isCancelled: boolean;
  canRetry: boolean;
  paymentAttemptCount: number;
  maxAttempts: number;
  maxAttemptsReached: boolean;
  lastError: string | null;
}

interface CardForm {
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

/* ─── Helpers ─── */
const formatRemaining = (mins: number | null): string => {
  if (mins == null || mins <= 0) return "0 dakika";
  if (mins < 60) return `${mins} dakika`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} saat` : `${h} saat ${m} dakika`;
};

const formatMoney = (amount: number | null, currency: string | null) => {
  if (amount == null) return "—";
  return `${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ${currency ?? "TRY"}`;
};

/* ─── Icons ─── */
const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
  </svg>
);
const IconAlert = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconClock = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);
const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─── Kart Önizleme ─── */
function CardPreview({ cardNumber, cardHolder, expiryMonth, expiryYear, cvv, showBack }: {
  cardNumber: string; cardHolder: string;
  expiryMonth: string; expiryYear: string;
  cvv: string; showBack: boolean;
}) {
  const digits = cardNumber.replace(/\s/g, '');
  const getCardType = () => {
    if (/^4/.test(digits)) return 'VISA';
    if (/^5[1-5]|^2[2-7]/.test(digits)) return 'MC';
    if (/^9/.test(digits)) return 'TROY';
    return '';
  };
  const formatPreviewNumber = () => {
    const groups = [];
    for (let i = 0; i < 4; i++) {
      const chunk = digits.slice(i * 4, i * 4 + 4);
      groups.push(chunk.padEnd(4, '•'));
    }
    return groups.join('  ');
  };
  const expiry = expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear.slice(-2)}` : 'AA/YY';
  return (
    <div className="chk-card-preview">
      <div className={`chk-card-preview__inner ${showBack ? 'chk-card-preview__inner--flipped' : ''}`}>
        <div className="chk-card-preview__front">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="chk-card-preview__chip" />
            <div className="chk-card-preview__type">{getCardType()}</div>
          </div>
          <div className="chk-card-preview__number">{formatPreviewNumber()}</div>
          <div className="chk-card-preview__bottom">
            <div>
              <div className="chk-card-preview__label">Kart Sahibi</div>
              <div className="chk-card-preview__holder">{cardHolder.trim() || 'AD SOYAD'}</div>
            </div>
            <div>
              <div className="chk-card-preview__label">Son Kullanma</div>
              <div className="chk-card-preview__expiry">{expiry}</div>
            </div>
          </div>
        </div>
        <div className="chk-card-preview__back">
          <div className="chk-card-preview__stripe" />
          <div className="chk-card-preview__cvv-row">
            <span className="chk-card-preview__cvv-label">CVV</span>
            <div className="chk-card-preview__cvv-box">{cvv || '•••'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Ana Bileşen ─── */
export default function RetryPaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [statusInfo, setStatusInfo] = useState<PaymentStatusInfo | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);

  const [cardForm, setCardForm] = useState<CardForm>({
    cardHolderName: "", cardNumber: "", expiryMonth: "", expiryYear: "", cvv: "",
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [cvvFocused, setCvvFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* Booking durumunu çek */
  useEffect(() => {
    if (!bookingId) { setStatusLoading(false); setStatusError("Rezervasyon kimliği bulunamadı."); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/flight/booking/${encodeURIComponent(bookingId)}/payment-status`, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) { setStatusError(data?.error ?? "Rezervasyon durumu alınamadı."); }
        else { setStatusInfo(data); setRemainingMinutes(data.remainingMinutes ?? null); }
      } catch {
        if (!cancelled) setStatusError("Sunucuya ulaşılamadı.");
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [bookingId]);

  /* Geri sayım */
  useEffect(() => {
    if (remainingMinutes == null || remainingMinutes <= 0) return;
    const id = setInterval(() => {
      setRemainingMinutes(prev => (prev != null && prev > 0 ? prev - 1 : 0));
    }, 60_000);
    return () => clearInterval(id);
  }, [remainingMinutes]);

  const isExpired = useMemo(() => {
    if (statusInfo?.isExpired) return true;
    if (remainingMinutes != null && remainingMinutes <= 0) return true;
    return false;
  }, [statusInfo, remainingMinutes]);

  const cannotRetry = !statusInfo || statusInfo.isAlreadyPaid || statusInfo.isCancelled ||
    isExpired || statusInfo.maxAttemptsReached || !statusInfo.canRetry;

  /* Kart validasyonu */
  const validateCard = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!cardForm.cardHolderName.trim() || cardForm.cardHolderName.trim().length < 3)
      errs.cardHolderName = 'Kart sahibi adı gereklidir';
    if (!/^\d{15,16}$/.test(cardForm.cardNumber.replace(/\s/g, '')))
      errs.cardNumber = 'Geçerli bir kart numarası giriniz';
    if (!/^(0[1-9]|1[0-2])$/.test(cardForm.expiryMonth)) errs.expiryMonth = 'Geçersiz ay';
    if (!/^\d{4}$/.test(cardForm.expiryYear) || parseInt(cardForm.expiryYear) < new Date().getFullYear())
      errs.expiryYear = 'Geçersiz yıl';
    if (!/^\d{3,4}$/.test(cardForm.cvv)) errs.cvv = 'Geçersiz CVV';
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  }, [cardForm]);

  /* Ödeme gönder */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!bookingId || cannotRetry) return;
    if (!validateCard()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/flight/booking/${encodeURIComponent(bookingId)}/retry-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          creditCard: {
            cardHolderName: cardForm.cardHolderName.trim(),
            cardNumber: cardForm.cardNumber.replace(/\s/g, ""),
            expiryMonth: cardForm.expiryMonth,
            expiryYear: cardForm.expiryYear,
            cvv: cardForm.cvv,
          },
        }),
      });
      const data = await res.json();

      if (!res.ok) { setSubmitError(data?.error ?? "Ödeme başlatılamadı."); setSubmitting(false); return; }
      if (data?.hasError) { setSubmitError(data.errorMessage ?? "Ödeme reddedildi."); setSubmitting(false); return; }

      if (data?.is3DSecureRequired && (data.threeDSecureUrl || data.threeDSecureHtml)) {
        sessionStorage.setItem("payment_3ds_session", JSON.stringify({
          searchId: null, shoppingFileId: data.shoppingFileId ?? null,
          paymentReferenceId: data.paymentReferenceId ?? null,
          amount: data.grandTotal ?? statusInfo?.grandTotal ?? 0,
          currency: data.currency ?? statusInfo?.currency ?? "TRY",
          pnr: data.pnr ?? statusInfo?.pnr ?? null, bookingId, isRetry: true,
        }));
        if (data.threeDSecureUrl) { window.location.href = data.threeDSecureUrl; return; }
        if (data.threeDSecureHtml) {
          const win = window.open("", "_blank", "width=500,height=700,scrollbars=yes");
          if (win) { win.document.open(); win.document.write(data.threeDSecureHtml); win.document.close(); }
          else { setSubmitError("Tarayıcınız popup penceresini engelledi."); setSubmitting(false); }
          return;
        }
      }

      if (data?.isPaymentSuccessful) { router.push("/checkout/success"); return; }
      setSubmitError("Beklenmeyen bir durum oluştu. Lütfen tekrar deneyiniz.");
      setSubmitting(false);
    } catch {
      setSubmitError("Sunucuya ulaşılamadı.");
      setSubmitting(false);
    }
  }, [bookingId, cannotRetry, validateCard, cardForm, statusInfo, router]);

  /* ── Yükleniyor ── */
  if (statusLoading) {
    return (
      <>
        <HeaderOne />
        <main className="chk-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: 15 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#047857', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            Rezervasyon durumu kontrol ediliyor…
          </div>
        </main>
        <FooterOne />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  /* ── Rezervasyon Bulunamadı ── */
  if (statusError || !statusInfo) {
    return (
      <>
        <HeaderOne />
        <main className="chk-page">
          <div className="chk-trust-bar">
            <div className="chk-trust-bar__inner">
              <span className="chk-trust-bar__item">256-bit SSL güvenliği</span>
              <span className="chk-trust-bar__item">3D Secure ödeme</span>
              <span className="chk-trust-bar__item">TÜRSAB üyesi</span>
            </div>
          </div>
          <div className="chk-container" style={{ paddingTop: 48, paddingBottom: 48, maxWidth: 520 }}>
            <div className="chk-section">
              <div className="chk-section__body" style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', border: '2px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#dc2626' }}>
                  <IconAlert size={28} />
                </div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Rezervasyon bulunamadı</h1>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>{statusError ?? "Rezervasyon bilgilerine erişilemedi."}</p>
                <Link href="/" className="chk-alert__btn chk-alert__btn--primary" style={{ display: 'inline-flex' }}>
                  Ana Sayfaya Dön
                </Link>
              </div>
            </div>
          </div>
        </main>
        <FooterOne />
      </>
    );
  }

  const origin = statusInfo.origin ?? '—';
  const destination = statusInfo.destination ?? '—';
  const pnr = statusInfo.pnr;
  const grandTotal = statusInfo.grandTotal;
  const currency = statusInfo.currency ?? 'TRY';

  /* ── Tekrar Denenemeyen Durum ── */
  const blockReason = statusInfo.isAlreadyPaid
    ? "Bu rezervasyonun ödemesi zaten tamamlanmış."
    : statusInfo.isCancelled
    ? "Bu rezervasyon iptal edilmiş."
    : isExpired
    ? "Rezervasyon süresi doldu. Koltuk yeniden satışa açıldı."
    : statusInfo.maxAttemptsReached
    ? `Maksimum deneme sayısına ulaşıldı (${statusInfo.paymentAttemptCount}/${statusInfo.maxAttempts}).`
    : null;

  return (
    <>
      <HeaderOne />
      <main className="chk-page">

        {/* Trust Bar */}
        <div className="chk-trust-bar">
          <div className="chk-trust-bar__inner">
            <span className="chk-trust-bar__item">256-bit SSL güvenliği</span>
            <span className="chk-trust-bar__item">3D Secure ödeme</span>
            <span className="chk-trust-bar__item">TÜRSAB üyesi</span>
          </div>
        </div>

        {/* Route Header */}
        <div className="chk-route">
          <div className="chk-route__inner">
            <div className="chk-route__path">
              <span>{origin}</span>
              <span className="chk-route__arrow"><IconArrow /></span>
              <span>{destination}</span>
            </div>
            <div className="chk-route__meta">
              Ödemeyi Tekrar Dene
              {pnr ? ` · PNR: ${pnr}` : ''}
              {statusInfo.airlineCode ? ` · ${statusInfo.airlineCode}${statusInfo.flightNumber ? ' ' + statusInfo.flightNumber : ''}` : ''}
            </div>
          </div>
        </div>

        <div className="chk-container">
          <div className="chk-grid">

            {/* ── Sol Kolon ── */}
            <div className="chk-main">

              {/* Hata bildirimi */}
              {submitError && (
                <div className="chk-alerts">
                  <div className="chk-alert chk-alert--error">
                    <IconAlert />
                    <div className="chk-alert__body">
                      <div>{submitError}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tekrar denenemez uyarısı */}
              {cannotRetry && blockReason && (
                <div className="chk-alerts">
                  <div className="chk-alert chk-alert--error">
                    <IconAlert />
                    <div className="chk-alert__body">
                      <div>{blockReason}</div>
                      <div className="chk-alert__actions">
                        <Link href="/" className="chk-alert__btn chk-alert__btn--primary">Yeni Arama Yap</Link>
                        {statusInfo.isAlreadyPaid && (
                          <Link href="/my-tickets" className="chk-alert__btn chk-alert__btn--ghost">Biletlerimi Gör</Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rezervasyon Bilgileri */}
              <div className="chk-section">
                <div className="chk-section__head">
                  <div className="chk-section__title">Rezervasyon Bilgileri</div>
                </div>
                <div className="chk-section__body">

                  {/* Uçuş satırı */}
                  {statusInfo.airlineCode && (
                    <div className="chk-flight">
                      <div className="chk-flight__row">
                        <div className="chk-flight__airline">
                          <AirlineLogo code={statusInfo.airlineCode} size={32} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
                            {statusInfo.airlineCode}{statusInfo.flightNumber ? ' ' + statusInfo.flightNumber : ''}
                          </div>
                          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                            {origin} → {destination}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detay tablosu */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 24px', padding: '16px 0 4px', fontSize: 14 }}>
                    {pnr && (
                      <>
                        <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>PNR</span>
                        <span style={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.06em', color: '#0f172a' }}>{pnr}</span>
                      </>
                    )}
                    {grandTotal != null && (
                      <>
                        <span style={{ color: '#64748b' }}>Toplam Tutar</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatMoney(grandTotal, currency)}</span>
                      </>
                    )}
                    {statusInfo.maxAttempts > 0 && (
                      <>
                        <span style={{ color: '#64748b' }}>Deneme</span>
                        <span style={{ color: '#0f172a' }}>{statusInfo.paymentAttemptCount} / {statusInfo.maxAttempts}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Rezervasyon Durumu */}
              <div className="chk-section">
                <div className="chk-section__head">
                  <div className="chk-section__title">Rezervasyon Durumu</div>
                </div>
                <div className="chk-section__body">
                  {!isExpired && !cannotRetry && (
                    <div style={{ display: 'flex', gap: 14, padding: '16px', borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
                        <IconClock size={20} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#78350f', margin: '0 0 4px' }}>Rezervasyonunuz geçerli</p>
                        <p style={{ fontSize: 13, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
                          {remainingMinutes != null && remainingMinutes > 0
                            ? <>Aynı koltuk için ödeme yapmaya <strong>{formatRemaining(remainingMinutes)}</strong> süreniz kaldı.</>
                            : "Lütfen ödeme işlemini tamamlayınız."}
                        </p>
                      </div>
                    </div>
                  )}

                  {isExpired && (
                    <div style={{ display: 'flex', gap: 14, padding: '16px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                        <IconAlert size={20} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#7f1d1d', margin: '0 0 4px' }}>Rezervasyon süresi doldu</p>
                        <p style={{ fontSize: 13, color: '#991b1b', margin: 0, lineHeight: 1.5 }}>
                          Koltuk yeniden satışa açıldı. Devam etmek için yeni bir arama yapmanız gerekiyor.
                        </p>
                      </div>
                    </div>
                  )}

                  {statusInfo.isAlreadyPaid && (
                    <div style={{ display: 'flex', gap: 14, padding: '16px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#14532d', margin: '0 0 4px' }}>Ödeme tamamlanmış</p>
                        <p style={{ fontSize: 13, color: '#166534', margin: 0, lineHeight: 1.5 }}>
                          Biletiniz oluşturuldu. Biletlerim sayfasından görüntüleyebilirsiniz.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* /chk-main */}

            {/* ── Sağ Sidebar ── */}
            <aside className="chk-summary chk-summary--with-payment" aria-label="Ödeme özeti">

              {/* Özet başlık */}
              <div className="chk-summary__head">
                <h3 className="chk-summary__title">Ödeme Özeti</h3>
                <span className="chk-summary__sub">Tekrar Deneme</span>
              </div>

              {/* Fiyat detayı */}
              <div className="chk-summary__body">
                <div className="chk-summary__leg">
                  <span className="chk-summary__leg-label">{origin}</span>
                  <span className="chk-summary__leg-route">→ {destination}</span>
                  {pnr && <span className="chk-summary__leg-date">{pnr}</span>}
                </div>
                <div className="chk-summary__divider" />
                <div className="chk-summary__total">
                  <div>
                    <div className="chk-summary__total-label">Toplam</div>
                  </div>
                  <div className="chk-summary__total-amount">{formatMoney(grandTotal, currency)}</div>
                </div>
              </div>

              {/* Kart formu */}
              {!cannotRetry && (
                <>
                  <div className="chk-summary__pay-head">
                    <span>Kart Bilgileri</span>
                    <span className="chk-card-brands">
                      <span>VISA</span><span>MC</span><span>TROY</span>
                    </span>
                  </div>
                  <form onSubmit={handleSubmit} className="chk-summary__pay-body">
                    <CardPreview
                      cardNumber={cardForm.cardNumber}
                      cardHolder={cardForm.cardHolderName}
                      expiryMonth={cardForm.expiryMonth}
                      expiryYear={cardForm.expiryYear}
                      cvv={cardForm.cvv}
                      showBack={cvvFocused}
                    />

                    {/* Kart sahibi */}
                    <div className="chk-field">
                      <label className="chk-field__label">Kart Üzerindeki İsim</label>
                      <input
                        type="text"
                        placeholder="Ad Soyad"
                        value={cardForm.cardHolderName}
                        onChange={e => {
                          const raw = e.target.value
                            .replace(/[^A-Za-zÀ-ſİıĞğŞşÜüÖöÇç ]/g, '')
                            .replace(/ {2,}/g, ' ').replace(/^ +/, '');
                          const formatted = raw.split(' ')
                            .map(w => w ? w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR') : '')
                            .join(' ');
                          setCardForm(p => ({ ...p, cardHolderName: formatted }));
                          setCardErrors(p => ({ ...p, cardHolderName: '' }));
                        }}
                        maxLength={100} autoComplete="cc-name"
                        className={`chk-input ${cardErrors.cardHolderName ? 'chk-input--error' : ''}`}
                      />
                      {cardErrors.cardHolderName && <div className="chk-field__error">{cardErrors.cardHolderName}</div>}
                    </div>

                    {/* Kart numarası */}
                    <div className="chk-field">
                      <label className="chk-field__label">Kart Numarası</label>
                      <input
                        type="text" inputMode="numeric" placeholder="0000 0000 0000 0000"
                        value={cardForm.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setCardForm(p => ({ ...p, cardNumber: v }));
                          setCardErrors(p => ({ ...p, cardNumber: '' }));
                        }}
                        maxLength={19} autoComplete="cc-number"
                        className={`chk-input chk-input--card ${cardErrors.cardNumber ? 'chk-input--error' : ''}`}
                      />
                      {cardErrors.cardNumber && <div className="chk-field__error">{cardErrors.cardNumber}</div>}
                    </div>

                    {/* Son kullanma + CVV */}
                    <div className="chk-field-row chk-field-row--exp">
                      <div className="chk-field">
                        <label className="chk-field__label">Son Kullanma</label>
                        <div className="chk-exp-row">
                          <select
                            value={cardForm.expiryMonth}
                            onChange={e => { setCardForm(p => ({ ...p, expiryMonth: e.target.value })); setCardErrors(p => ({ ...p, expiryMonth: '' })); }}
                            autoComplete="cc-exp-month"
                            className={`chk-select ${cardErrors.expiryMonth ? 'chk-select--error' : ''}`}
                          >
                            <option value="">AA</option>
                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <select
                            value={cardForm.expiryYear}
                            onChange={e => { setCardForm(p => ({ ...p, expiryYear: e.target.value })); setCardErrors(p => ({ ...p, expiryYear: '' })); }}
                            autoComplete="cc-exp-year"
                            className={`chk-select ${cardErrors.expiryYear ? 'chk-select--error' : ''}`}
                          >
                            <option value="">YYYY</option>
                            {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i)).map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                        {(cardErrors.expiryMonth || cardErrors.expiryYear) && (
                          <div className="chk-field__error">{cardErrors.expiryMonth || cardErrors.expiryYear}</div>
                        )}
                      </div>
                      <div className="chk-field">
                        <label className="chk-field__label">CVV</label>
                        <input
                          type="text" inputMode="numeric" placeholder="•••"
                          value={cardForm.cvv}
                          onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setCardForm(p => ({ ...p, cvv: v })); setCardErrors(p => ({ ...p, cvv: '' })); }}
                          onFocus={() => setCvvFocused(true)}
                          onBlur={() => setCvvFocused(false)}
                          maxLength={4} autoComplete="cc-csc"
                          className={`chk-input ${cardErrors.cvv ? 'chk-input--error' : ''}`}
                        />
                        {cardErrors.cvv && <div className="chk-field__error">{cardErrors.cvv}</div>}
                      </div>
                    </div>

                    <button type="submit" disabled={submitting} className="chk-summary__pay-btn">
                      {submitting ? 'İşleniyor...' : (
                        <>
                          <IconLock />
                          <span>{formatMoney(grandTotal, currency)} · Güvenli Ödeme Yap</span>
                        </>
                      )}
                    </button>

                    <div className="chk-summary__secure">
                      <IconShield /><span>3D Secure ile güvenli ödeme</span>
                    </div>

                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                      <Link href="/" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
                        Vazgeç — Ana Sayfa
                      </Link>
                    </div>
                  </form>
                </>
              )}

              {/* Tekrar denenemez hali */}
              {cannotRetry && (
                <div className="chk-summary__pay-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link href="/" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#0a1628,#1e3a5f)',
                    color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none',
                  }}>
                    Yeni Arama Yap
                  </Link>
                  {statusInfo.isAlreadyPaid && (
                    <Link href="/my-tickets" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#047857,#065f46)',
                      color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none',
                    }}>
                      Biletlerimi Gör
                    </Link>
                  )}
                </div>
              )}
            </aside>

          </div>
        </div>
      </main>
      <FooterOne />

      {/* İşleniyor overlay */}
      {submitting && (
        <div className="chk-loading" role="status" aria-live="polite">
          <div className="chk-loading__card">
            <div className="chk-loading__logo"><span className="accent">Ata</span><span className="dark">Bilet</span></div>
            <div className="chk-loading__bar"><div className="chk-loading__bar-fill" /></div>
            <p className="chk-loading__text">Ödeme işleniyor, lütfen bekleyiniz<span className="chk-loading__dots" /></p>
          </div>
        </div>
      )}
    </>
  );
}
