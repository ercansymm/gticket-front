"use client";

import Link from "next/link";

export default function ErrorPageClient() {
  return (
    <div className="tg-error-area-start tg-error-spacing" style={{ minHeight: "60vh", display: "flex", alignItems: "center" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-7 col-md-9">
            <div className="tg-error-content text-center">
              <h1 style={{ fontSize: "80px", fontWeight: 800, color: "var(--ab-primary)" }}>404</h1>
              <h2 className="mb-15">Sayfa Bulunamadı</h2>
              <p className="mb-35">Aradığınız sayfa bulunamadı veya taşınmış olabilir.</p>
              <div className="tg-error-btn">
                <Link className="tg-btn" href="/">Ana Sayfaya Dön</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
