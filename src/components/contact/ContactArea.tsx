"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const INFO_ITEMS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
      </svg>
    ),
    label: "Acil Bilet Hattı",
    value: "0532 015 26 38",
    href: "tel:+905320152638",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 7l10 7 10-7" />
      </svg>
    ),
    label: "E-posta",
    value: "info@atabilet.com", // ← kendi adresinle değiştir
    href: "mailto:info@atabilet.com", // ← kendi adresinle değiştir
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: "Adres",
    value: "İstanbul, Türkiye",
    href: null,
  },
];

const ContactArea = () => {
  const { status } = useSession();
  const supportHref =
    status === "authenticated"
      ? "/destek-taleplerim/yeni"
      : "/login?callbackUrl=%2Fdestek-taleplerim%2Fyeni";

  return (
    <section className="ct-section">
      <div className="container">

        {/* Üst açıklama */}
        <div className="ct-intro">
          <h2 className="ct-intro__title">Bize Ulaşın</h2>
          <p className="ct-intro__desc">
            Seyahat planlarınız, rezervasyonlarınız veya herhangi bir konuda yardıma ihtiyaç duyarsanız
            destek ekibimiz size en kısa sürede geri dönecektir.
          </p>
        </div>

        {/* İletişim kartları */}
        <div className="ct-cards">
          {INFO_ITEMS.map((item, i) => (
            <div key={i} className="ct-card">
              <span className="ct-card__icon">{item.icon}</span>
              <p className="ct-card__label">{item.label}</p>
              {item.href ? (
                <Link href={item.href} className="ct-card__value ct-card__value--link">
                  {item.value}
                </Link>
              ) : (
                <p className="ct-card__value">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Destek talebi CTA */}
        <div className="ct-support-cta">
          <div className="ct-support-cta__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <div>
            <h3 className="ct-support-cta__title">Destek Talebi Oluşturun</h3>
            <p className="ct-support-cta__desc">
              Rezervasyon değişikliği, iade veya herhangi bir konuda talebinizi sisteme iletebilirsiniz.
              Destek ekibimiz en kısa sürede sizinle iletişime geçecektir.
            </p>
          </div>
          <Link href={supportHref} className="ct-support-cta__btn">
            Talep Oluştur
          </Link>
        </div>

 {/* Harita */}
<div className="ct-map">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d233.4947377564956!2d28.947369255827965!3d41.010255070767045!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab928ae4fca0f%3A0xdf9e60e4d9d12e7b!2sG%20Travel!5e1!3m2!1str!2str!4v1777558441740!5m2!1str!2str"
    width="100%"
    height="450"
    style={{ border: 0, borderRadius: 16, display: "block" }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    title="AtaBilet Konum"
  />
</div>

      </div>
    </section>
  );
};

export default ContactArea;
