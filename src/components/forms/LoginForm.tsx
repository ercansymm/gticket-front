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
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      const res = await signIn("credentials", {
         email,
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
      <form onSubmit={handleSubmit}>
         <div className="row">
            <div className="col-lg-12 mb-25">
               <input
                  className="input"
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
               />
            </div>
            <div className="col-lg-12 mb-25">
               <input
                  className="input"
                  type="password"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
               />
            </div>
            {error && (
               <div className="col-lg-12 mb-15">
                  <div style={{ color: "#dc2626", fontSize: 14 }}>{error}</div>
               </div>
            )}
            <div className="col-lg-12">
               <div className="d-flex align-items-center justify-content-between">
                  <div className="review-checkbox d-flex align-items-center mb-25">
                     <input className="tg-checkbox" type="checkbox" id="rememberMe" />
                     <label htmlFor="rememberMe" className="tg-label">Beni hatırla</label>
                  </div>
                  <div className="tg-login-navigate mb-25">
                     <Link href="/register">Kayıt Ol</Link>
                  </div>
               </div>
               <button type="submit" className="tg-btn w-100" disabled={loading}>
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
               </button>
            </div>
         </div>
      </form>
   );
};

export default LoginForm;
