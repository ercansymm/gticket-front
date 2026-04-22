"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
   const router = useRouter();

   const [fullName, setFullName] = useState("");
   const [email, setEmail] = useState("");
   const [phone, setPhone] = useState("");
   const [password, setPassword] = useState("");
   const [confirm, setConfirm] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (password !== confirm) {
         setError("Şifreler eşleşmiyor.");
         return;
      }
      if (password.length < 6) {
         setError("Şifre en az 6 karakter olmalıdır.");
         return;
      }

      setLoading(true);
      try {
         const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, email, password, phone }),
         });
         const data = await res.json().catch(() => ({}));

         if (!res.ok) {
            setError(data?.error || "Kayıt başarısız.");
            setLoading(false);
            return;
         }

         // Auto-login
         const signInRes = await signIn("credentials", {
            email,
            password,
            redirect: false,
         });

         setLoading(false);

         if (signInRes?.error) {
            // Registered but auto-login failed — send to login page
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
      <form onSubmit={handleSubmit}>
         <div className="row">
            <div className="col-lg-12 mb-25">
               <input
                  className="input"
                  type="text"
                  placeholder="Ad Soyad"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
               />
            </div>
            <div className="col-lg-12 mb-25">
               <input
                  className="input"
                  type="email"
                  placeholder="E-posta adresinizi girin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
               />
            </div>
            <div className="col-lg-12 mb-25">
               <input
                  className="input"
                  type="tel"
                  placeholder="Telefon (opsiyonel)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
               />
            </div>
            <div className="col-lg-12 mb-25">
               <input
                  className="input"
                  type="password"
                  placeholder="Şifre (en az 6 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
               />
            </div>
            <div className="col-lg-12 mb-25">
               <input
                  className="input"
                  type="password"
                  placeholder="Şifre Tekrar"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
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
                     <input className="tg-checkbox" type="checkbox" id="terms" />
                     <label htmlFor="terms" className="tg-label">Şartları kabul ediyorum</label>
                  </div>
                  <div className="tg-login-navigate mb-25">
                     <Link href="/login">Giriş Yap</Link>
                  </div>
               </div>
               <button type="submit" className="tg-btn w-100" disabled={loading}>
                  {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
               </button>
            </div>
         </div>
      </form>
   );
};

export default RegisterForm;
