"use client";

import Link from "next/link";

const CheckInIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const PnrIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const CancelIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="10" y1="14" x2="14" y2="18" />
    <line x1="14" y1="14" x2="10" y2="18" />
  </svg>
);

const SupportIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="9" y1="10" x2="9" y2="10" />
    <line x1="12" y1="10" x2="12" y2="10" />
    <line x1="15" y1="10" x2="15" y2="10" />
  </svg>
);

const ArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const cards = [
  {
    id: "checkin",
    icon: <CheckInIcon />,
    iconBg: "#EFF6FF",
    iconColor: "#1D4ED8",
    title: "Online Check-in",
    desc: "Uçuşunuzdan önce online check-in yapın, havalimanında zaman kazanın.",
    href: "/check-in",
  },
  {
    id: "pnr",
    icon: <PnrIcon />,
    iconBg: "#F0FDF4",
    iconColor: "#047857",
    title: "PNR Sorgulama",
    desc: "Bilet rezervasyonunuzu PNR kodunuz ve soyadınız ile sorgulayın.",
    href: "/bilet-sorgula",
  },
  {
    id: "cancel",
    icon: <CancelIcon />,
    iconBg: "#FFF7ED",
    iconColor: "#C2410C",
    title: "İptal / İade",
    desc: "Uçak biletinizi iptal ettirin veya iade talebinizi kolayca oluşturun.",
    href: "/iptal-iade",
  },
  {
    id: "support",
    icon: <SupportIcon />,
    iconBg: "#FAF5FF",
    iconColor: "#7C3AED",
    title: "Destek Talebi",
    desc: "Sorun mu yaşıyorsunuz? Destek ekibimiz size yardımcı olmaktan mutluluk duyar.",
    href: "/destek",
  },
];

const ManageTravelSection = () => (
  <section className="bb-manage-travel" aria-labelledby="manage-travel-title">
    <div className="container">
      <h2 id="manage-travel-title" className="bb-manage-travel__title">
        Seyahatini Yönet
      </h2>
      <div className="bb-manage-travel__grid">
        {cards.map((card) => (
          <Link key={card.id} href={card.href} className="bb-manage-card">
            <div
              className="bb-manage-card__icon-wrap"
              style={{ background: card.iconBg, color: card.iconColor }}
            >
              {card.icon}
            </div>
            <div className="bb-manage-card__body">
              <span className="bb-manage-card__title">{card.title}</span>
              <span className="bb-manage-card__desc">{card.desc}</span>
            </div>
            <span className="bb-manage-card__arrow">
              <ArrowRight />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default ManageTravelSection;
