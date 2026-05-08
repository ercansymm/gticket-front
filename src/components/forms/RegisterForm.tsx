"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

/* Phone format per country dial code — checkout (PassengerForm) ile aynı */
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

const RegisterForm = () => {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("+90");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple password strength meter (length + variety)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!terms) {
      setError("Devam etmek için kullanım şartlarını kabul etmelisiniz.");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (!phoneDigits) {
      setError("Telefon numarası zorunludur.");
      return;
    }
    if (!getPhoneFormat(phoneCode).isValid(phoneDigits)) {
      setError("Geçerli bir telefon numarası giriniz.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: (phoneCode + phoneDigits).trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Backend already returns "Bu e-posta zaten kayıtlı." for duplicates.
        setError(data?.error || "Kayıt başarısız.");
        setLoading(false);
        return;
      }

      // Auto-login
      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      setLoading(false);

      if (signInRes?.error) {
        router.push("/login");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
      setLoading(false);
    }
  };

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
      <div className="ab-auth__field">
        <label className="ab-auth__label" htmlFor="reg-name">Ad Soyad</label>
        <div className="ab-auth__input-wrap">
          <i className="fa-regular fa-user ab-auth__leading" />
          <input
            id="reg-name"
            className="ab-auth__input"
            type="text"
            placeholder="Ad ve soyadınız"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            autoFocus
          />
        </div>
      </div>

      <div className="ab-auth__field">
        <label className="ab-auth__label" htmlFor="reg-email">E-posta</label>
        <div className="ab-auth__input-wrap">
          <i className="fa-regular fa-envelope ab-auth__leading" />
          <input
            id="reg-email"
            className="ab-auth__input"
            type="email"
            inputMode="email"
            placeholder="ornek@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="ab-auth__field">
        <label className="ab-auth__label" htmlFor="reg-phone">Cep Telefonu</label>
        <div className="ab-auth__phone">
          <select
            className="ab-auth__phone-code"
            value={phoneCode}
            onChange={(e) => {
              const newCode = e.target.value;
              const newMax = getPhoneFormat(newCode).max;
              const digits = phone.replace(/\D/g, "").slice(0, newMax);
              setPhoneCode(newCode);
              setPhone(formatPhone(digits, newCode));
            }}
            aria-label="Ülke kodu"
          >
            <option value="+90">TR (+90)</option>
            <option value="+1">US (+1)</option>
            <option value="+44">GB (+44)</option>
            <option value="+49">DE (+49)</option>
            <option value="+33">FR (+33)</option>
          </select>
          <input
            id="reg-phone"
            className="ab-auth__input ab-auth__phone-input"
            type="tel"
            inputMode="tel"
            placeholder={getPhoneFormat(phoneCode).placeholder}
            value={phone}
            onChange={(e) => {
              const max = getPhoneFormat(phoneCode).max;
              const digits = e.target.value.replace(/\D/g, "").slice(0, max);
              setPhone(formatPhone(digits, phoneCode));
            }}
            required
            autoComplete="tel-national"
          />
        </div>
      </div>

      <div className="ab-auth__field">
        <label className="ab-auth__label" htmlFor="reg-password">Şifre</label>
        <div className="ab-auth__input-wrap">
          <i className="fa-solid fa-lock ab-auth__leading" />
          <input
            id="reg-password"
            className="ab-auth__input ab-auth__input--has-trailing"
            type={showPassword ? "text" : "password"}
            placeholder="En az 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
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
        {password && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                background: "#e2e8f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(strength.score / 4) * 100}%`,
                  height: "100%",
                  background: strength.color,
                  transition: "width 0.2s, background 0.2s",
                }}
              />
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
          <input
            id="reg-confirm"
            className="ab-auth__input"
            type={showPassword ? "text" : "password"}
            placeholder="Şifrenizi tekrar girin"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </div>
        {confirm && password !== confirm && (
          <span className="ab-auth__hint" style={{ color: "#dc2626" }}>
            Şifreler eşleşmiyor.
          </span>
        )}
      </div>

      {error && (
        <div className="ab-auth__alert ab-auth__alert--error" role="alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      <label className="ab-auth__check" style={{ marginTop: 4 }}>
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
        />
        <span>
          <Link href="/kullanim-sartlari" className="ab-auth__link">Kullanım şartlarını</Link>
          {" "}ve{" "}
          <Link href="/gizlilik" className="ab-auth__link">gizlilik politikasını</Link>
          {" "}kabul ediyorum.
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
        <Link href="/login">Giriş yapın</Link>
      </p>
    </form>
    </>
  );
};

export default RegisterForm;
