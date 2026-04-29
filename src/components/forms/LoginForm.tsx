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
        <Link href="/register">Hemen kayıt olun</Link>
      </p>
    </form>
  );
};

export default LoginForm;
