"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/auth/OtpInput";

/* Phone format per country dial code */
interface PhoneFormat { groups: number[]; max: number; placeholder: string; isValid: (d: string) => boolean; }
const PHONE_FORMATS: Record<string, PhoneFormat> = {
  "+90": { groups: [3, 3, 2, 2],   max: 10, placeholder: "5XX XXX XX XX",   isValid: (d) => d.length === 10 && d.startsWith("5") },
  "+1":  { groups: [3, 3, 4],      max: 10, placeholder: "XXX XXX XXXX",    isValid: (d) => d.length === 10 },
  "+44": { groups: [4, 3, 4],      max: 11, placeholder: "XXXX XXX XXXX",   isValid: (d) => d.length >= 10 && d.length <= 11 },
  "+49": { groups: [3, 4, 4],      max: 11, placeholder: "XXX XXXX XXXX",   isValid: (d) => d.length >= 10 && d.length <= 11 },
  "+33": { groups: [1, 2, 2, 2, 2], max: 9,  placeholder: "X XX XX XX XX",   isValid: (d) => d.length === 9 },
};
function getPhoneFormat(code: string): PhoneFormat {
  return PHONE_FORMATS[code] ?? { groups: [15], max: 15, placeholder: "Telefon numarası", isValid: (d) => d.length >= 7 };
}
function formatPhone(digits: string, code: string): string {
  const fmt = getPhoneFormat(code);
  const limited = digits.slice(0, fmt.max);
  const parts: string[] = [];
  let pos = 0;
  for (const g of fmt.groups) {
    if (pos >= limited.length) break;
    parts.push(limited.slice(pos, pos + g));
    pos += g;
  }
  return parts.join(" ");
}

type Step = "form" | "otp";

const RegisterForm = () => {
  const router = useRouter();

  // Form alanları
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("+90");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);

  // UI state
  const [step, setStep] = useState<Step>("form");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Arka planda saklanan bilgiler (OTP adımında gerekli)
  const [savedEmail, setSavedEmail] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [savedPhone, setSavedPhone] = useState("");

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "#e2e8f0" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
    const labels = ["Çok zayıf", "Zayıf", "Orta", "Güçlü", "Çok güçlü"];
    const colors = ["#ef4444", "#f97316", "#eab308", "#10b981", "#059669"];
    return { score, label: labels[score], color: colors[score] };
  }, [password]);

  // ── Adım 1: Kayıt formu gönder ──────────────────────────────────────
  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) { setError("Ad zorunludur."); return; }
    if (!lastName.trim()) { setError("Soyad zorunludur."); return; }
    if (!terms) { setError("Devam etmek için kullanım şartlarını kabul etmelisiniz."); return; }

    const phoneDigits = phone.replace(/\D/g, "");
    if (!phoneDigits) { setError("Telefon numarası zorunludur."); return; }
    if (!getPhoneFormat(phoneCode).isValid(phoneDigits)) { setError("Geçerli bir telefon numarası giriniz."); return; }
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalıdır."); return; }
    if (password !== confirm) { setError("Şifreler eşleşmiyor."); return; }

    setLoading(true);
    try {
      const fullPhone = (phoneCode + phoneDigits).trim();
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: email.trim().toLowerCase(),
          password,
          phone: fullPhone,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Kayıt başarısız.");
        setLoading(false);
        return;
      }

      if (data?.requiresPhoneVerification) {
        // OTP adımına geç
        setSavedEmail(email.trim().toLowerCase());
        setSavedPassword(password);
        setSavedPhone(fullPhone);
        setMaskedPhone(data.maskedPhone ?? fullPhone);
        setStep("otp");
        startResendCooldown();
      } else {
        // OTP gerekmiyorsa (eski kullanıcılar) direkt login
        await autoLogin(email.trim().toLowerCase(), password);
      }
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  // ── Adım 2: OTP doğrula ─────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otpValue.length < 6) { setError("Lütfen 6 haneli kodu eksiksiz girin."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: savedPhone, code: otpValue }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Kod doğrulanamadı.");
        setLoading(false);
        return;
      }

      // Telefon doğrulandi — auto login
      setSuccessMsg("Telefon doğrulandı! Giriş yapılıyor...");
      await autoLogin(savedEmail, savedPassword);
    } catch {
      setError("Sunucuya ulaşılamadı.");
      setLoading(false);
    }
  };

  // ── Kodu yeniden gönder ─────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: savedPhone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error || "Kod gönderilemedi."); }
      else { setSuccessMsg("Yeni kod gönderildi."); startResendCooldown(); }
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setResendLoading(false);
    }
  };

  const autoLogin = async (emailVal: string, pass: string) => {
    const signInRes = await signIn("credentials", { email: emailVal, password: pass, redirect: false });
    if (signInRes?.error) { router.push("/giris"); return; }
    router.push("/");
    router.refresh();
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

  // ═══════════════════════════════════════════════════════════════════
  // OTP Adımı
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
          <strong>{maskedPhone}</strong> numaralı telefonunuza 6 haneli doğrulama kodu gönderdik.
        </p>

        <OtpInput onChange={setOtpValue} disabled={loading} />

        {error && (
          <div className="ab-auth__alert ab-auth__alert--error" role="alert">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
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
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Doğrulanıyor...
            </>
          ) : "Doğrula"}
        </button>

        <div className="ab-auth__otp-resend">
          {resendCooldown > 0 ? (
            <span className="ab-auth__text-muted">Yeniden gönder ({resendCooldown}s)</span>
          ) : (
            <button
              type="button"
              className="ab-auth__link-btn"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? "Gönderiliyor..." : "Kodu yeniden gönder"}
            </button>
          )}
        </div>

        <button type="button" className="ab-auth__link-btn" onClick={() => { setStep("form"); setError(null); }}>
          Geri dön
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // Kayıt Formu (Adım 1)
  // ═══════════════════════════════════════════════════════════════════
  return (
    <>
      <button
        type="button"
        className="ab-auth__google-btn"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        Google ile Kayıt Ol
      </button>

      <div className="ab-auth__divider">
        <span>veya e-posta ile devam et</span>
      </div>

      <form className="ab-auth__form" onSubmit={handleSubmit} noValidate>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="ab-auth__field">
          <label className="ab-auth__label" htmlFor="reg-firstname">Ad</label>
          <div className="ab-auth__input-wrap">
            <i className="fa-regular fa-user ab-auth__leading" />
            <input id="reg-firstname" className="ab-auth__input" type="text" placeholder="Adınız"
              value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" autoFocus />
          </div>
        </div>
        <div className="ab-auth__field">
          <label className="ab-auth__label" htmlFor="reg-lastname">Soyad</label>
          <div className="ab-auth__input-wrap">
            <i className="fa-regular fa-user ab-auth__leading" />
            <input id="reg-lastname" className="ab-auth__input" type="text" placeholder="Soyadınız"
              value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
          </div>
        </div>
      </div>

      <div className="ab-auth__field">
        <label className="ab-auth__label" htmlFor="reg-email">E-posta</label>
        <div className="ab-auth__input-wrap">
          <i className="fa-regular fa-envelope ab-auth__leading" />
          <input id="reg-email" className="ab-auth__input" type="email" inputMode="email" placeholder="ornek@mail.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
      </div>

      <div className="ab-auth__field">
        <label className="ab-auth__label" htmlFor="reg-phone">Cep Telefonu</label>
        <div className="ab-auth__phone">
          <select className="ab-auth__phone-code" value={phoneCode}
            onChange={(e) => {
              const newCode = e.target.value;
              const newMax  = getPhoneFormat(newCode).max;
              const digits  = phone.replace(/\D/g, "").slice(0, newMax);
              setPhoneCode(newCode);
              setPhone(formatPhone(digits, newCode));
            }} aria-label="Ülke kodu">
            <option value="+90">TR (+90)</option>
            <option value="+1">US (+1)</option>
            <option value="+44">GB (+44)</option>
            <option value="+49">DE (+49)</option>
            <option value="+33">FR (+33)</option>
          </select>
          <input id="reg-phone" className="ab-auth__input ab-auth__phone-input" type="tel" inputMode="tel"
            placeholder={getPhoneFormat(phoneCode).placeholder} value={phone}
            onChange={(e) => {
              const max    = getPhoneFormat(phoneCode).max;
              const digits = e.target.value.replace(/\D/g, "").slice(0, max);
              setPhone(formatPhone(digits, phoneCode));
            }} required autoComplete="tel-national" />
        </div>
      </div>

      <div className="ab-auth__field">
        <label className="ab-auth__label" htmlFor="reg-password">Şifre</label>
        <div className="ab-auth__input-wrap">
          <i className="fa-solid fa-lock ab-auth__leading" />
          <input id="reg-password" className="ab-auth__input ab-auth__input--has-trailing"
            type={showPassword ? "text" : "password"} placeholder="En az 6 karakter"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required autoComplete="new-password" minLength={6} />
          <button type="button" className="ab-auth__toggle"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"} tabIndex={-1}>
            <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
          </button>
        </div>
        {password && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 4, background: "#e2e8f0", overflow: "hidden" }}>
              <div style={{ width: `${(strength.score / 4) * 100}%`, height: "100%", background: strength.color, transition: "width 0.2s, background 0.2s" }} />
            </div>
            <span style={{ fontSize: 11.5, color: strength.color, fontWeight: 600, minWidth: 70, textAlign: "right" }}>
              {strength.label}
            </span>
          </div>
        )}
      </div>

      <div className="ab-auth__field">
        <label className="ab-auth__label" htmlFor="reg-confirm">Şifre Tekrar</label>
        <div className="ab-auth__input-wrap">
          <i className="fa-solid fa-lock ab-auth__leading" />
          <input id="reg-confirm" className="ab-auth__input"
            type={showPassword ? "text" : "password"} placeholder="Şifrenizi tekrar girin"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            required autoComplete="new-password" minLength={6} />
        </div>
        {confirm && password !== confirm && (
          <span className="ab-auth__hint" style={{ color: "#dc2626" }}>Şifreler eşleşmiyor.</span>
        )}
      </div>

      {error && (
        <div className="ab-auth__alert ab-auth__alert--error" role="alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      <label className="ab-auth__check" style={{ marginTop: 4 }}>
        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
        <span>
          <Link href="/kullanim-sartlari" className="ab-auth__link">Kullanım şartlarını</Link>
          {", "}
          <Link href="/gizlilik" className="ab-auth__link">gizlilik politikasını</Link>
          {" ve "}
          <Link href="/kvkk" className="ab-auth__link">KVKK aydınlatma metnini</Link>
          {" "}okudum, kabul ediyorum.
        </span>
      </label>

      <button type="submit" className="ab-auth__submit" disabled={loading}>
        {loading ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" /> Hesap oluşturuluyor...
          </>
        ) : (
          <>
            <i className="fa-solid fa-user-plus" /> Hesap Oluştur
          </>
        )}
      </button>

      <p className="ab-auth__footer">
        Zaten bir hesabınız var mı?
        <Link href="/giris">Giriş yapın</Link>
      </p>
    </form>
    </>
  );
};

export default RegisterForm;
