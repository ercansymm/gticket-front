"use client";

const LockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const AwardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const items = [
  {
    id: "ssl",
    icon: <LockIcon />,
    iconBg: "#E0E7FF",
    iconColor: "#4338CA",
    title: "256-bit SSL Güvenli Ödeme",
    desc: "Tüm ödemeleriniz şifreli olarak işlenir",
  },
  {
    id: "tursab",
    icon: <ShieldIcon />,
    iconBg: "#CCFBF1",
    iconColor: "#0F766E",
    title: "TÜRSAB Üyesi",
    desc: "Belge No: 18474",
  },
  {
    id: "etbis",
    icon: <AwardIcon />,
    iconBg: "#FEF3C7",
    iconColor: "#B45309",
    title: "ETBİS Onaylı",
    desc: "T.C. Ticaret Bakanlığı kayıtlı",
  },
  {
    id: "support",
    icon: <HeadphonesIcon />,
    iconBg: "#FFE4E6",
    iconColor: "#BE123C",
    title: "7/24 Müşteri Desteği",
    desc: "Her zaman yanınızdayız",
  },
];

const TrustStrip = () => (
  <section className="bb-trust-strip" aria-labelledby="trust-strip-title">
    <h2 id="trust-strip-title" className="bb-sr-only">Güven Şeridi</h2>
    <div className="container">
      <div className="bb-trust-strip__grid">
        {items.map((item) => (
          <div key={item.id} className="bb-trust-item">
            <div
              className="bb-trust-item__icon"
              style={{ background: item.iconBg, color: item.iconColor }}
            >
              {item.icon}
            </div>
            <div className="bb-trust-item__body">
              <span className="bb-trust-item__title">{item.title}</span>
              <span className="bb-trust-item__desc">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustStrip;
