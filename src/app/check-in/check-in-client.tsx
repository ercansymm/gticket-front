"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, User, ChevronRight, ChevronDown, Home, Loader2 } from "lucide-react";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import TrustBar from "@/components/homes/home-one/TrustBar";

const faqs = [
  {
    q: "Online check-in ne zaman açılır?",
    a: "Çoğu havayolunda check-in, uçuşunuzdan 24 saat önce başlar ve kalkışa yaklaşık 60–90 dakika kala kapanır. Tam süre için havayolunuzun web sitesini kontrol edin.",
  },
  {
    q: "Online check-in için neye ihtiyacım var?",
    a: "PNR kodunuz (rezervasyon numarası) ve bilet üzerindeki soyad yeterlidir. Uçuş sırasında kimlik veya pasaportunuzu yanınızda bulundurmanız zorunludur.",
  },
  {
    q: "Online check-in yaptıktan sonra ne yapmalıyım?",
    a: "Biniş kartınızı PDF olarak indirin veya e-posta ile kendinize gönderin. Uçak bagajınız varsa havalimanında bagaj teslim kontuarını kullanmanız gerekir.",
  },
  {
    q: "Check-in butonunu göremiyorum, neden?",
    a: "Check-in butonu yalnızca desteklenen havayollarında ve uçuşa 24 saatten az kaldığında görünür. Uçuşunuz bu aralıkta değilse butonu ileride tekrar kontrol edin.",
  },
];

const turkishToUpper = (v: string): string => {
  const map: Record<string, string> = { ş: "S", Ş: "S", ç: "C", Ç: "C", ğ: "G", Ğ: "G", ı: "I", İ: "I", ö: "O", Ö: "O", ü: "U", Ü: "U", i: "I" };
  return v.split("").map((c) => map[c] || c).join("").toUpperCase();
};

export default function CheckInClient() {
  const router = useRouter();
  const [pnr, setPnr]         = useState("");
  const [surname, setSurname] = useState("");
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!pnr.trim())     e.pnr     = "PNR kodunuzu giriniz.";
    if (!surname.trim()) e.surname = "Soyadınızı giriniz.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    router.push(`/bilet-sorgula?pnr=${encodeURIComponent(pnr.trim())}&soyad=${encodeURIComponent(surname.trim())}`);
  };

  return (
    <>
      <TrustBar />
      <HeaderOne />

      {/* ─── Hero ─── */}
      <section className="pnr-hero">
        <div className="pnr-hero__inner">
          <h1 className="pnr-hero__title">Online Check-in</h1>
          <div className="pnr-hero__form-card">
            <form onSubmit={handleSubmit}>
              <div className="pnr-hero__form-row">
                <div className="pnr-hero__field">
                  <div className={`pnr-hero__input-wrap${errors.pnr ? " pnr-hero__input-wrap--error" : ""}`}>
                    <span className="pnr-hero__input-icon"><Hash size={16} /></span>
                    <input
                      type="text"
                      className="pnr-hero__input pnr-hero__input--mono"
                      placeholder="PNR / Rezervasyon Kodu"
                      value={pnr}
                      onChange={(e) => { setPnr(turkishToUpper(e.target.value).replace(/[^A-Z0-9]/g, "")); setErrors((p) => ({ ...p, pnr: "" })); }}
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
                      onChange={(e) => { setSurname(turkishToUpper(e.target.value).replace(/[^A-Z\s]/g, "")); setErrors((p) => ({ ...p, surname: "" })); }}
                      autoComplete="off"
                    />
                  </div>
                  {errors.surname && <span className="pnr-hero__error">{errors.surname}</span>}
                </div>

                <button type="submit" disabled={loading} className="pnr-hero__btn">
                  {loading ? (
                    <><Loader2 size={16} className="pnr-spin" /> Yükleniyor...</>
                  ) : (
                    <>Check-in Durumunu Gör <ChevronRight size={16} /></>
                  )}
                </button>
              </div>
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
            <span className="pnr-breadcrumb__current">Online Check-in</span>
          </nav>

          <section className="pnr-faq-section">
            <h2 className="pnr-faq-section__title">Sıkça Sorulan Sorular</h2>
            <div className="pnr-faq-list">
              {faqs.map((faq, i) => (
                <div key={i} className="pnr-faq-item">
                  <button
                    type="button"
                    className="pnr-faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={18} className={`pnr-faq-chevron${openFaq === i ? " pnr-faq-chevron--open" : ""}`} />
                  </button>
                  {openFaq === i && <p className="pnr-faq-a">{faq.a}</p>}
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      <FooterOne />
    </>
  );
}
