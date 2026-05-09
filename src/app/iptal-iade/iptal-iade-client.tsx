"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, User, ChevronRight, ChevronDown, Home, Loader2 } from "lucide-react";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import TrustBar from "@/components/homes/home-one/TrustBar";

const faqs = [
  {
    q: "Bilet iptali için ne gerekiyor?",
    a: "PNR kodunuz ve bilet üzerindeki soyadınız ile biletinizi sorgulayabilirsiniz. Sonuç sayfasından iptal / iade talebi oluşturun, destek ekibimiz süreci sizin adınıza yönetir.",
  },
  {
    q: "Her bilet iptal edilebilir mi?",
    a: "Bilet iptal koşulları satın aldığınız tarife tipine ve havayoluna göre değişir. Kısıtlı (non-refundable) tarifeler iade edilmeyebilir; ancak havayolu kaynaklı iptallerde tam iade hakkınız bulunmaktadır.",
  },
  {
    q: "İade süreci ne kadar sürer?",
    a: "Onaylanan iadeler genellikle 7–14 iş günü içinde ödeme yaptığınız karta yansır. Banka işlem sürelerine göre bu süre değişebilir.",
  },
  {
    q: "Uçuş havayolu tarafından iptal edilirse ne olur?",
    a: "Havayolu kaynaklı iptallerde tam iade hakkınız yasal olarak güvence altındadır. Alternatif uçuş teklif edilebilir; kabul etmemeniz halinde bilet bedeli tamamen iade edilir.",
  },
  {
    q: "Vergi ve harçlar iade edilir mi?",
    a: "Kısıtlı tarifelerde uçuş bedeli iade edilmese de havalimanı vergisi ve harçlar çoğunlukla iade edilebilir. Talebi oluştururken bu konuyu belirtmenizi öneririz.",
  },
];

const steps = [
  { no: "1", title: "Biletinizi Sorgulayın", desc: "PNR kodunuz ve soyadınızı girerek rezervasyonunuzu bulun." },
  { no: "2", title: "Talep Oluşturun",       desc: "Bilet detayları sayfasından \"İptal Talebi\" seçeneğini seçin." },
  { no: "3", title: "Takip Edin",            desc: "Destek ekibimiz talebinizi değerlendirip en kısa sürede dönüş yapar." },
];

const turkishToUpper = (v: string): string => {
  const map: Record<string, string> = { ş: "S", Ş: "S", ç: "C", Ç: "C", ğ: "G", Ğ: "G", ı: "I", İ: "I", ö: "O", Ö: "O", ü: "U", Ü: "U", i: "I" };
  return v.split("").map((c) => map[c] || c).join("").toUpperCase();
};

export default function IptalIadeClient() {
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
          <h1 className="pnr-hero__title">İptal / İade İşlemleri</h1>
          <div className="pnr-hero__form-card">
            <form onSubmit={handleSubmit}>
              <div className="pnr-hero__form-row">
                {/* PNR */}
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

                {/* Soyad */}
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

                {/* Buton */}
                <button type="submit" disabled={loading} className="pnr-hero__btn">
                  {loading ? (
                    <><Loader2 size={16} className="pnr-spin" /> Yükleniyor...</>
                  ) : (
                    <>Rezervasyonumu Bul <ChevronRight size={16} /></>
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

          {/* Breadcrumb */}
          <nav className="pnr-breadcrumb" aria-label="breadcrumb">
            <a href="/"><Home size={14} /></a>
            <ChevronRight size={14} />
            <span className="pnr-breadcrumb__current">İptal / İade</span>
          </nav>

          {/* Adımlar — topics grid stilinde */}
          <section className="pnr-topics-section">
            <h2 className="pnr-topics-section__title">Nasıl İşlem Yapılır?</h2>
            <div className="iptal-steps-grid">
              {steps.map((s) => (
                <div key={s.no} className="iptal-step-card">
                  <span className="iptal-step-card__no">{s.no}</span>
                  <div>
                    <p className="iptal-step-card__title">{s.title}</p>
                    <p className="iptal-step-card__desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
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
                    <ChevronDown
                      size={18}
                      className={`pnr-faq-chevron${openFaq === i ? " pnr-faq-chevron--open" : ""}`}
                    />
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
