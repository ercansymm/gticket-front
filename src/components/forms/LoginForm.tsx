"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("E-posta veya şifre hatalı.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        className="ab-auth__google-btn"
        onClick={() => signIn("google", { callbackUrl: callbackUrl })}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
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
        <label className="ab-auth__label" htmlFor="login-password">Şifre</label>
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

      <div className="ab-auth__row">
        <label className="ab-auth__check">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
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
