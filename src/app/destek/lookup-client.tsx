"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import { Loader2, Headset, ShieldCheck, LogIn } from "lucide-react";
import { saveGuestSession, getGuestSession } from "@/lib/guest-support";

export default function LookupClient() {
  const router = useRouter();
  const [pnr, setPnr] = useState("");
  const [surname, setSurname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zaten geçerli oturum varsa doğrudan listeye gönder
  useEffect(() => {
    const sess = getGuestSession();
    if (sess) router.replace("/destek/talepler");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pnrTrim = pnr.trim().toUpperCase();
    const surnameTrim = surname.trim();

    if (!pnrTrim || !surnameTrim) {
      setError("PNR ve soyad zorunludur.");
      return;
    }
    if (pnrTrim.length < 5 || pnrTrim.length > 10) {
      setError("PNR 5-10 karakter olmalıdır.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/support/guest/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pnr: pnrTrim, surname: surnameTrim }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Backend zaten generic mesaj dönüyor
        const msg = (data as { error?: string })?.error;
        if (res.status === 429) {
          setError("Çok fazla deneme yaptınız. Lütfen bir süre bekleyin.");
        } else {
          setError(msg || "PNR veya soyad hatalı.");
        }
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
      setError("Sunucuya ulaşılamadı. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <HeaderOne />
      <main className="pnr-page">
        <div className="pnr-page__wide" style={{ maxWidth: 540 }}>
          <div className="pnr-card" style={{ padding: 32 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "#EFF6FF",
                  color: "#2563EB",
                  marginBottom: 12,
                }}
              >
                <Headset size={28} />
              </div>
              <h1
                className="pnr-search__title"
                style={{ marginBottom: 6, fontSize: 22 }}
              >
                Misafir Destek Girişi
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
                Üye olmadan rezervasyonunuz hakkında destek talebi açabilirsiniz.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 14 }}>
                <label
                  htmlFor="pnr"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  PNR Kodu
                </label>
                <input
                  id="pnr"
                  type="text"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value.toUpperCase())}
                  placeholder="Örn: ABC123"
                  maxLength={10}
                  autoComplete="off"
                  className="pnr-search__input"
                  style={{
                    width: "100%",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  htmlFor="surname"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Yolcu Soyadı
                </label>
                <input
                  id="surname"
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Bilet üzerindeki soyad"
                  maxLength={64}
                  autoComplete="family-name"
                  className="pnr-search__input"
                  style={{ width: "100%" }}
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#991B1B",
                    fontSize: 13,
                    marginBottom: 14,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="pnr-search__btn"
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="pnr-spin" />
                    Kontrol ediliyor...
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Devam Et
                  </>
                )}
              </button>
            </form>

            <div
              style={{
                marginTop: 18,
                padding: 12,
                borderRadius: 8,
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <ShieldCheck
                size={18}
                style={{ color: "#16A34A", flexShrink: 0, marginTop: 1 }}
              />
              <p style={{ margin: 0, fontSize: 12, color: "#166534" }}>
                Güvenliğiniz için bilgileriniz şifreli olarak saklanır. Oturumunuz 30
                dakika sonra otomatik kapanır.
              </p>
            </div>

            <div
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #E5E7EB",
                fontSize: 13,
                textAlign: "center",
                color: "#6B7280",
              }}
            >
              Üye misiniz?{" "}
              <Link
                href="/login?callbackUrl=/destek-taleplerim"
                style={{ color: "#2563EB", fontWeight: 500 }}
              >
                Giriş yapın
              </Link>
            </div>
          </div>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
