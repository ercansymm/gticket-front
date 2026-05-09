"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Hash, User, ChevronRight, Home, Loader2, ShieldCheck } from "lucide-react";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import TrustBar from "@/components/homes/home-one/TrustBar";
import { saveGuestSession, getGuestSession } from "@/lib/guest-support";

const turkishToUpper = (v: string): string => {
  const map: Record<string, string> = { ş: "S", Ş: "S", ç: "C", Ç: "C", ğ: "G", Ğ: "G", ı: "I", İ: "I", ö: "O", Ö: "O", ü: "U", Ü: "U", i: "I" };
  return v.split("").map((c) => map[c] || c).join("").toUpperCase();
};

export default function LookupClient() {
  const router = useRouter();
  const { status } = useSession();
  const [pnr, setPnr]               = useState("");
  const [surname, setSurname]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [apiError, setApiError]     = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") router.replace("/destek-taleplerim");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") return;
    const sess = getGuestSession();
    if (sess) router.replace("/destek/talepler");
  }, [router, status]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!pnr.trim())         e.pnr     = "PNR kodunuzu giriniz.";
    else if (pnr.length < 5) e.pnr     = "PNR 5-10 karakter olmalıdır.";
    if (!surname.trim())     e.surname = "Soyadınızı giriniz.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(null);
    try {
      setSubmitting(true);
      const res = await fetch("/api/support/guest/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pnr: pnr.trim().toUpperCase(), surname: surname.trim() }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setApiError(
          res.status === 429
            ? "Çok fazla deneme yaptınız. Lütfen bir süre bekleyin."
            : ((data as { error?: string })?.error ?? "PNR veya soyad hatalı.")
        );
        return;
      }
      saveGuestSession({
        token: data.token,
        expiresAt: data.expiresAt,
        pnr: data.pnr,
        passengerDisplayName: data.passengerDisplayName,
        bookingId: data.bookingId,
      });
      router.push("/destek/talepler");
    } catch {
      setApiError("Sunucuya ulaşılamadı. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <>
        <TrustBar />
        <HeaderOne />
        <section className="pnr-hero" style={{ minHeight: 260 }} />
        <FooterOne />
      </>
    );
  }

  return (
    <>
      <TrustBar />
      <HeaderOne />

      {/* ─── Hero ─── */}
      <section className="pnr-hero">
        <div className="pnr-hero__inner">
          <h1 className="pnr-hero__title">Destek Talebi</h1>
          <div className="pnr-hero__form-card">
            <form onSubmit={handleSubmit} noValidate>
              <div className="pnr-hero__form-row">
                <div className="pnr-hero__field">
                  <div className={`pnr-hero__input-wrap${errors.pnr ? " pnr-hero__input-wrap--error" : ""}`}>
                    <span className="pnr-hero__input-icon"><Hash size={16} /></span>
                    <input
                      type="text"
                      className="pnr-hero__input pnr-hero__input--mono"
                      placeholder="PNR / Rezervasyon Kodu"
                      value={pnr}
                      onChange={(e) => { setPnr(turkishToUpper(e.target.value).replace(/[^A-Z0-9]/g, "")); setErrors((p) => ({ ...p, pnr: "" })); setApiError(null); }}
                      maxLength={10}
                      autoComplete="off"
                    />
                  </div>
                  {errors.pnr && <span className="pnr-hero__error">{errors.pnr}</span>}
                </div>

                <div className="pnr-hero__field">
                  <div className={`pnr-hero__input-wrap${errors.surname ? " pnr-hero__input-wrap--error" : ""}`}>
                    <span className="pnr-hero__input-icon"><User size={16} /></span>
                    <input
                      type="text"
                      className="pnr-hero__input"
                      placeholder="Yolcunun Soyadı"
                      value={surname}
                      onChange={(e) => { setSurname(turkishToUpper(e.target.value).replace(/[^A-Z\s]/g, "")); setErrors((p) => ({ ...p, surname: "" })); setApiError(null); }}
                      autoComplete="off"
                    />
                  </div>
                  {errors.surname && <span className="pnr-hero__error">{errors.surname}</span>}
                </div>

                <button type="submit" disabled={submitting} className="pnr-hero__btn">
                  {submitting ? (
                    <><Loader2 size={16} className="pnr-spin" /> Kontrol ediliyor...</>
                  ) : (
                    <>Devam Et <ChevronRight size={16} /></>
                  )}
                </button>
              </div>

              {apiError && (
                <div className="pnr-lookup-api-error">{apiError}</div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ─── Below hero ─── */}
      <div className="pnr-below-hero">
        <div className="pnr-content-wrap">
          <nav className="pnr-breadcrumb" aria-label="breadcrumb">
            <a href="/"><Home size={14} /></a>
            <ChevronRight size={14} />
            <span className="pnr-breadcrumb__current">Destek Talebi</span>
          </nav>

          <div className="pnr-lookup-info-box">
            <ShieldCheck size={18} className="pnr-lookup-info-box__icon" />
            <p className="pnr-lookup-info-box__text">
              Bilgileriniz şifreli olarak saklanır. Oturumunuz 30 dakika sonra otomatik kapanır.
              {" "}Üye iseniz{" "}
              <Link href="/giris?callbackUrl=/destek-taleplerim" className="pnr-lookup-info-box__link">
                giriş yaparak
              </Link>{" "}
              tüm taleplerinize ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      <FooterOne />
    </>
  );
}
