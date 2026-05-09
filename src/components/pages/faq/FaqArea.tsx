"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, Ticket, CreditCard, ShoppingBag, RotateCcw, Plane, MessageCircle, Phone } from "lucide-react";
import faq_data, { FaqItem } from "../../../data/FaqData";

type Category = "all" | FaqItem["category"];

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: "all",      label: "Tümü",               icon: null },
  { id: "booking",  label: "Bilet & Rezervasyon", icon: <Ticket size={15} /> },
  { id: "payment",  label: "Ödeme",               icon: <CreditCard size={15} /> },
  { id: "baggage",  label: "Bagaj",               icon: <ShoppingBag size={15} /> },
  { id: "cancel",   label: "İptal & Değişiklik",  icon: <RotateCcw size={15} /> },
  { id: "flight",   label: "Uçuş Bilgisi",        icon: <Plane size={15} /> },
];

const FaqArea = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [openId, setOpenId] = useState<number | null>(1);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return faq_data.filter((item) => {
      const matchCat = activeCategory === "all" || item.category === activeCategory;
      const matchSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="faq-hero">
        <div className="faq-hero__inner">
          <p className="faq-hero__eyebrow">Yardım Merkezi</p>
          <h1 className="faq-hero__title">Sıkça Sorulan Sorular</h1>
          <p className="faq-hero__sub">Merak ettiğiniz her konuya hızlıca ulaşın</p>
          <div className="faq-hero__search-wrap">
            <Search size={18} className="faq-hero__search-icon" />
            <input
              type="text"
              className="faq-hero__search"
              placeholder="Soru veya konu ara… (örn: bagaj, iptal, ödeme)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveCategory("all");
              }}
            />
            {search && (
              <button
                type="button"
                className="faq-hero__search-clear"
                onClick={() => setSearch("")}
                aria-label="Aramayı temizle"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────── */}
      <div className="faq-body">
        <div className="faq-body__inner">

          {/* Category tabs */}
          <div className="faq-cats" role="tablist" aria-label="Soru kategorileri">
            {CATEGORIES.map(({ id, label, icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeCategory === id}
                type="button"
                className={`faq-cat-btn${activeCategory === id ? " faq-cat-btn--active" : ""}`}
                onClick={() => {
                  setActiveCategory(id);
                  setSearch("");
                }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Result count when searching */}
          {search && (
            <p className="faq-search-hint">
              <strong>{filtered.length}</strong> sonuç bulundu
              {filtered.length === 0 && " — farklı bir anahtar kelime deneyin."}
            </p>
          )}

          {/* Accordion */}
          <div className="faq-list" role="list">
            {filtered.length > 0 ? (
              filtered.map((item, idx) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`faq-item${isOpen ? " faq-item--open" : ""}`}
                    role="listitem"
                  >
                    <button
                      type="button"
                      className="faq-item__q"
                      onClick={() => toggle(item.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-item__num">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="faq-item__text">{item.title}</span>
                      <ChevronDown
                        size={18}
                        className={`faq-item__chevron${isOpen ? " faq-item__chevron--open" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="faq-item__a">
                        <p>{item.desc}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="faq-empty">
                <Search size={32} className="faq-empty__icon" />
                <p>Aramanızla eşleşen soru bulunamadı.</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="faq-cta">
            <div className="faq-cta__left">
              <MessageCircle size={28} className="faq-cta__icon" />
              <div>
                <h3 className="faq-cta__title">Aradığınızı bulamadınız mı?</h3>
                <p className="faq-cta__sub">Destek ekibimiz size yardımcı olmaktan memnuniyet duyacaktır.</p>
              </div>
            </div>
            <div className="faq-cta__actions">
              <Link href="/iletisim" className="faq-cta__btn faq-cta__btn--primary">
                <Phone size={15} />
                İletişime Geç
              </Link>
              <Link href="/bilet-sorgula" className="faq-cta__btn faq-cta__btn--ghost">
                <Ticket size={15} />
                Biletimi Sorgula
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default FaqArea;
