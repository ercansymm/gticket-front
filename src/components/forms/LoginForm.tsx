"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import OtpInput from "@/components/auth/OtpInput";

type Step = "form" | "otp" | "forgot-email" | "forgot-otp";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Giriş formu
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  // OTP adımı (doğrulanmamış telefon)
  const [maskedPhone, setMaskedPhone] = useState("");

  // Şifremi unuttum
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMaskedPhone, setForgotMaskedPhone] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Paylaşılan UI state
  const [step, setStep] = useState<Step>("form");
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Giriş formu gönder ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Önce precheck: telefon doğrulaması gerekiyor mu?
      const preRes = await fetch("/api/auth/login-precheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const preData = await preRes.json().catch(() => ({}));

      if (!preRes.ok) {
        setError("E-posta veya şifre hatalı.");
        setLoading(false);
        return;
      }

      if (preData?.requiresPhoneVerification) {
        // Telefon doğrulanmamış — OTP ekranına geç (SMS zaten gönderildi)
        setMaskedPhone(preData.maskedPhone ?? "");
        setOtpValue("");
        setStep("otp");
        startResendCooldown();
        setLoading(false);
        return;
      }

      // Telefon doğrulanmış → normal signIn
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("E-posta veya şifre hatalı.");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
      setLoading(false);
    }
  };

  // ── OTP doğrula (giriş için telefon doğrulaması) ────────────────────
  const handleVerifyOtp = async () => {
    if (otpValue.length < 6) { setError("Lütfen 6 haneli kodu eksiksiz girin."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Email üzerinden telefon bulunur — frontend telefon numarası tutmaz
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: otpValue }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Kod doğrulanamadı.");
        setLoading(false);
        return;
      }

      // Telefon doğrulandı — şimdi gerçek giriş yap
      setSuccessMsg("Telefon doğrulandı! Giriş yapılıyor...");
      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        setError("Giriş yapılamadı, lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
      setLoading(false);
    }
  };

  // ── OTP yeniden gönder (giriş akışı) ────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data?.error || "Kod gönderilemedi.");
      else { setSuccessMsg("Yeni kod gönderildi."); startResendCooldown(); }
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setResendLoading(false);
    }
  };

  // ── Şifremi Unuttum — email gönder ──────────────────────────────────
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "İstek gönderilemedi.");
        setLoading(false);
        return;
      }
      setForgotMaskedPhone(data.maskedPhone ?? null);
      setOtpValue("");
      setNewPassword("");
      setStep("forgot-otp");
      startResendCooldown();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  // ── Şifremi Unuttum — OTP + yeni şifre ──────────────────────────────
  const handleResetPassword = async () => {
    if (otpValue.length < 6) { setError("Lütfen 6 haneli kodu eksiksiz girin."); return; }
    if (newPassword.length < 6) { setError("Şifre en az 6 karakter olmalıdır."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          code: otpValue,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Şifre sıfırlanamadı.");
        setLoading(false);
        return;
      }
      setSuccessMsg("Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.");
      setStep("form");
      setEmail(forgotEmail.trim().toLowerCase());
      setPassword("");
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  // ── Şifremi Unuttum — yeni kod gönder ───────────────────────────────
  const handleForgotResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data?.error || "Kod gönderilemedi.");
      else { setSuccessMsg("Yeni kod gönderildi."); startResendCooldown(); }
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setResendLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const resetToForm = () => {
    setStep("form");
    setError(null);
    setSuccessMsg(null);
    setOtpValue("");
  };

  // ═══════════════════════════════════════════════════════════════════
  // Telefon doğrulama adımı (giriş akışı)
  // ═══════════════════════════════════════════════════════════════════
  if (step === "otp") {
    return (
      <div className="ab-auth__otp-step">
        <div className="ab-auth__otp-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2z" />
          </svg>
        </div>
        <h2 className="ab-auth__otp-title">Telefonunuzu Doğrulayın</h2>
        <p className="ab-auth__otp-desc">
          {maskedPhone
            ? <><strong>{maskedPhone}</strong> numaralı telefonunuza 6 haneli doğrulama kodu gönderdik.</>
            : "Hesabınıza kayıtlı telefona 6 haneli doğrulama kodu gönderdik."}
        </p>

        <OtpInput onChange={(v) => { setOtpValue(v); setError(null); }} disabled={loading} />

        {error && (
          <div className="ab-auth__alert ab-auth__alert--error" role="alert">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        {successMsg && !error && (
          <div className="ab-auth__alert ab-auth__alert--success" role="status">
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="button"
          className="ab-auth__submit"
          onClick={handleVerifyOtp}
          disabled={loading || otpValue.length < 6}
          style={{ marginTop: 16 }}
        >
          {loading ? "Doğrulanıyor..." : "Doğrula ve Giriş Yap"}
        </button>

        <div className="ab-auth__otp-resend">
          {resendCooldown > 0 ? (
            <span className="ab-auth__text-muted">Yeniden gönder ({resendCooldown}s)</span>
          ) : (
            <button type="button" className="ab-auth__link-btn" onClick={handleResend} disabled={resendLoading}>
              {resendLoading ? "Gönderiliyor..." : "Kodu yeniden gönder"}
            </button>
          )}
        </div>

        <button type="button" className="ab-auth__link-btn" onClick={resetToForm}>
          Geri dön
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // Şifremi Unuttum — email adımı
  // ═══════════════════════════════════════════════════════════════════
  if (step === "forgot-email") {
    return (
      <div className="ab-auth__otp-step">
        <h2 className="ab-auth__otp-title">Şifre Sıfırlama</h2>
        <p className="ab-auth__otp-desc">
          Hesabınıza kayıtlı e-posta adresini girin. Kayıtlı telefon numaranıza doğrulama kodu göndereceğiz.
        </p>

        <form className="ab-auth__form" onSubmit={handleForgotSubmit} noValidate>
          <div className="ab-auth__field">
            <label className="ab-auth__label" htmlFor="forgot-email">E-posta</label>
            <div className="ab-auth__input-wrap">
              <i className="fa-regular fa-envelope ab-auth__leading" />
              <input
                id="forgot-email"
                className="ab-auth__input"
                type="email"
                inputMode="email"
                placeholder="ornek@mail.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="ab-auth__alert ab-auth__alert--error" role="alert">
              <i className="fa-solid fa-circle-exclamation" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="ab-auth__submit" disabled={loading || !forgotEmail.trim()}>
            {loading ? "Gönderiliyor..." : "Kod Gönder"}
          </button>
        </form>

        <button type="button" className="ab-auth__link-btn" style={{ marginTop: 12 }} onClick={resetToForm}>
          Giriş sayfasına dön
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // Şifremi Unuttum — OTP + yeni şifre adımı
  // ═══════════════════════════════════════════════════════════════════
  if (step === "forgot-otp") {
    return (
      <div className="ab-auth__otp-step">
        <div className="ab-auth__otp-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2z" />
          </svg>
        </div>
        <h2 className="ab-auth__otp-title">Yeni Şifre Belirleyin</h2>
        <p className="ab-auth__otp-desc">
          {forgotMaskedPhone
            ? <><strong>{forgotMaskedPhone}</strong> numaralı telefonunuza gönderilen kodu girin.</>
            : "Hesabınıza kayıtlı telefona gönderilen kodu girin."}
        </p>

        <OtpInput onChange={(v) => { setOtpValue(v); setError(null); }} disabled={loading} />

        <div className="ab-auth__field" style={{ marginTop: 16 }}>
          <label className="ab-auth__label" htmlFor="reset-password">Yeni Şifre</label>
          <div className="ab-auth__input-wrap">
            <i className="fa-solid fa-lock ab-auth__leading" />
            <input
              id="reset-password"
              className="ab-auth__input ab-auth__input--has-trailing"
              type={showNewPassword ? "text" : "password"}
              placeholder="En az 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
            <button
              type="button"
              className="ab-auth__toggle"
              onClick={() => setShowNewPassword((s) => !s)}
              aria-label={showNewPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              tabIndex={-1}
            >
              <i className={`fa-regular ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="ab-auth__alert ab-auth__alert--error" role="alert">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        {successMsg && !error && (
          <div className="ab-auth__alert ab-auth__alert--success" role="status">
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="button"
          className="ab-auth__submit"
          onClick={handleResetPassword}
          disabled={loading || otpValue.length < 6 || newPassword.length < 6}
          style={{ marginTop: 8 }}
        >
          {loading ? "Güncelleniyor..." : "Şifremi Güncelle"}
        </button>

        <div className="ab-auth__otp-resend">
          {resendCooldown > 0 ? (
            <span className="ab-auth__text-muted">Yeniden gönder ({resendCooldown}s)</span>
          ) : (
            <button type="button" className="ab-auth__link-btn" onClick={handleForgotResend} disabled={resendLoading}>
              {resendLoading ? "Gönderiliyor..." : "Kodu yeniden gönder"}
            </button>
          )}
        </div>

        <button type="button" className="ab-auth__link-btn" onClick={resetToForm}>
          Geri dön
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // Ana Giriş Formu
  // ═══════════════════════════════════════════════════════════════════
  return (
    <>
      <button
        type="button"
        className="ab-auth__google-btn"
        onClick={() => signIn("google", { callbackUrl })}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
        Google ile Giriş Yap
      </button>

      <div className="ab-auth__divider">
        <span>veya e-posta ile devam et</span>
      </div>

      <form className="ab-auth__form" onSubmit={handleSubmit} noValidate>
        <div className="ab-auth__field">
          <label className="ab-auth__label" htmlFor="login-email">E-posta</label>
          <div className="ab-auth__input-wrap">
            <i className="fa-regular fa-envelope ab-auth__leading" />
            <input
              id="login-email"
              className="ab-auth__input"
              type="email"
              inputMode="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>
        </div>

        <div className="ab-auth__field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="ab-auth__label" htmlFor="login-password">Şifre</label>
            <button
              type="button"
              className="ab-auth__link-btn"
              style={{ fontSize: 13, marginBottom: 4 }}
              onClick={() => { setForgotEmail(email); setError(null); setSuccessMsg(null); setStep("forgot-email"); }}
            >
              Şifremi Unuttum
            </button>
          </div>
          <div className="ab-auth__input-wrap">
            <i className="fa-solid fa-lock ab-auth__leading" />
            <input
              id="login-password"
              className="ab-auth__input ab-auth__input--has-trailing"
              type={showPassword ? "text" : "password"}
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
            />
            <button
              type="button"
              className="ab-auth__toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              tabIndex={-1}
            >
              <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="ab-auth__alert ab-auth__alert--error" role="alert">
            <i className="fa-solid fa-circle-exclamation" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && !error && (
          <div className="ab-auth__alert ab-auth__alert--success" role="status">
            <span>{successMsg}</span>
          </div>
        )}

        <div className="ab-auth__row">
          <label className="ab-auth__check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Beni hatırla</span>
          </label>
        </div>

        <button type="submit" className="ab-auth__submit" disabled={loading}>
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" /> Giriş yapılıyor...
            </>
          ) : (
            <>
              <i className="fa-solid fa-right-to-bracket" /> Giriş Yap
            </>
          )}
        </button>

        <p className="ab-auth__footer">
          Hesabınız yok mu?
          <Link href="/kayit-ol">Hemen kayıt olun</Link>
        </p>
      </form>
    </>
  );
};

export default LoginForm;
