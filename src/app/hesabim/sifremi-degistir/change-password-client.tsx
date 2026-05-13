"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/auth/OtpInput";
import Link from "next/link";

type Step = "request" | "verify";

export default function ChangePasswordClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep]           = useState<Step>("request");
  const [otpValue, setOtpValue]   = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="ab-pw__page">
        <div className="ab-pw__card">
          <p className="ab-pw__loading">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/giris");
    return null;
  }

  // ── Adım 1: OTP gönder ──────────────────────────────────────────────
  const handleRequestOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error || "Kod gönderilemedi."); return; }
      setStep("verify");
      startResendCooldown();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  // ── Adım 2: OTP + yeni şifre ile kaydet ─────────────────────────────
  const handleConfirm = async () => {
    if (otpValue.length < 6) { setError("Lütfen 6 haneli kodu eksiksiz girin."); return; }
    if (newPassword.length < 6) { setError("Şifre en az 6 karakter olmalıdır."); return; }
    if (newPassword !== confirmPw) { setError("Şifreler eşleşmiyor."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpValue, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error || "Şifre değiştirilemedi."); return; }
      setSuccessMsg("Şifreniz başarıyla güncellendi. Yönlendiriliyorsunuz...");
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  // ── Kodu yeniden gönder ─────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    try {
      const res = await fetch("/api/auth/change-password", { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error || "Kod gönderilemedi."); }
      else { setSuccessMsg("Yeni kod gönderildi."); startResendCooldown(); }
    } catch {
      setError("Sunucuya ulaşılamadı.");
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  return (
    <div className="ab-pw__page">
      <div className="ab-pw__card">

        {/* Başlık */}
        <div className="ab-pw__header">
          <Link href="/" className="ab-pw__back">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Ana sayfaya dön
          </Link>
          <h1 className="ab-pw__title">Şifremi Değiştir</h1>
          <p className="ab-pw__subtitle">Güvenliğiniz için kayıtlı telefonunuza doğrulama kodu göndereceğiz.</p>
        </div>

        {/* Başarı mesajı */}
        {successMsg && (
          <div className="ab-auth__alert ab-auth__alert--success" role="status">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Hata mesajı */}
        {error && (
          <div className="ab-auth__alert ab-auth__alert--error" role="alert">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── Adım 1: Kod İste ── */}
        {step === "request" && !successMsg && (
          <div className="ab-pw__step">
            <div className="ab-pw__info-box">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#047857" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2v-1a7 7 0 00-14 0v1a2 2 0 002 2zM12 11a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              <p>Kayıtlı telefon numaranıza <strong>6 haneli doğrulama kodu</strong> gönderilecektir.</p>
            </div>

            <button
              type="button"
              className="ab-auth__submit"
              onClick={handleRequestOtp}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Kod gönderiliyor...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Doğrulama Kodu Gönder
                </>
              )}
            </button>
          </div>
        )}

        {/* ── Adım 2: Kodu Gir + Yeni Şifre ── */}
        {step === "verify" && !successMsg && (
          <div className="ab-pw__step">
            <p className="ab-pw__otp-hint">Telefonunuza gelen 6 haneli kodu girin:</p>

            <OtpInput onChange={setOtpValue} disabled={loading} />

            <div className="ab-pw__fields">
              <div className="ab-auth__field">
                <label className="ab-auth__label" htmlFor="pw-new">Yeni Şifre</label>
                <div className="ab-auth__input-wrap">
                  <svg className="ab-auth__leading" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input
                    id="pw-new"
                    className="ab-auth__input ab-auth__input--has-trailing"
                    type={showPw ? "text" : "password"}
                    placeholder="En az 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="ab-auth__toggle"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
                    tabIndex={-1}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      {showPw
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
              </div>

              <div className="ab-auth__field">
                <label className="ab-auth__label" htmlFor="pw-confirm">Şifre Tekrar</label>
                <div className="ab-auth__input-wrap">
                  <svg className="ab-auth__leading" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input
                    id="pw-confirm"
                    className="ab-auth__input"
                    type={showPw ? "text" : "password"}
                    placeholder="Şifrenizi tekrar girin"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                {confirmPw && newPassword !== confirmPw && (
                  <span className="ab-auth__hint" style={{ color: "#dc2626" }}>Şifreler eşleşmiyor.</span>
                )}
              </div>
            </div>

            <button
              type="button"
              className="ab-auth__submit"
              onClick={handleConfirm}
              disabled={loading || otpValue.length < 6 || newPassword.length < 6}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Kaydediliyor...
                </>
              ) : "Şifremi Güncelle"}
            </button>

            <div className="ab-auth__otp-resend" style={{ textAlign: "center" }}>
              {resendCooldown > 0 ? (
                <span className="ab-auth__text-muted">Yeniden gönder ({resendCooldown}s)</span>
              ) : (
                <button type="button" className="ab-auth__link-btn" onClick={handleResend}>
                  Kodu yeniden gönder
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
