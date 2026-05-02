import { Search, UserCheck, Ticket } from "lucide-react";
import { useTranslation } from "../../../context/LanguageContext";

const steps = [
  {
    num: "01",
    Icon: Search,
    title_tr: "Uçuş Arayın",
    title_en: "Search Flights",
    desc_tr:
      "Kalkış noktasını, varış şehrini ve tarihleri seçin. Yüzlerce seçenek arasından en uygun fiyatı saniyeler içinde görün.",
    desc_en:
      "Select your departure, destination and dates. See the best prices from hundreds of options in seconds.",
  },
  {
    num: "02",
    Icon: UserCheck,
    title_tr: "Bilgilerinizi Girin",
    title_en: "Enter Your Details",
    desc_tr:
      "Yolcu bilgilerini doldurun ve güvenli ödeme adımına geçin. Tüm büyük kredi ve banka kartları desteklenir.",
    desc_en:
      "Fill in passenger details and proceed to secure payment. All major credit and debit cards are supported.",
  },
  {
    num: "03",
    Icon: Ticket,
    title_tr: "E-Biletinizi Alın",
    title_en: "Receive Your E-Ticket",
    desc_tr:
      "Ödeme onaylandıktan sonra e-biletiniz anında e-posta adresinize gönderilir. PNR kodunuzla her an sorgulayabilirsiniz.",
    desc_en:
      "Your e-ticket is sent instantly to your email once payment is confirmed. Query anytime with your PNR code.",
  },
];

const HowItWorks = () => {
  const { lang } = useTranslation();
  const isTr = lang === "tr";

  return (
    <section className="bb-section bb-how" aria-label={isTr ? "Nasıl Çalışır?" : "How It Works"}>
      <div className="container">
        <div className="bb-how__header">
          <span className="bb-section-eyebrow">
            {isTr ? "Nasıl Çalışır?" : "How It Works"}
          </span>
          <h2 className="bb-section-title">
            {isTr ? "Biletinize 3 Adımda Ulaşın" : "Get Your Ticket in 3 Steps"}
          </h2>
          <p className="bb-section-subtitle">
            {isTr
              ? "Uçuş aramadan e-bilet kesimine kadar her şey tek platformda, kolayca."
              : "From flight search to e-ticket issuance — everything on one platform, simply."}
          </p>
        </div>

        <div className="bb-how__steps">
          {steps.map(({ num, Icon, title_tr, title_en, desc_tr, desc_en }) => (
            <div key={num} className="bb-how__step">
              <div className="bb-how__step-circle" aria-hidden="true">
                <Icon size={26} strokeWidth={1.75} />
                <span className="bb-how__step-num">{num}</span>
              </div>
              <h3 className="bb-how__step-title">
                {isTr ? title_tr : title_en}
              </h3>
              <p className="bb-how__step-desc">
                {isTr ? desc_tr : desc_en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
