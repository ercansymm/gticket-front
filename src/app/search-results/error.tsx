"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Search error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div className="bb-error-modal" style={{ position: "relative" }}>
        <div className="bb-error-modal__header">
          <h2>Arama Hatası</h2>
        </div>
        <div className="bb-error-modal__body">
          <p>Uçuş arama sırasında bir hata oluştu. Lütfen tekrar deneyin.</p>
        </div>
        <div className="bb-error-modal__footer">
          <button
            className="bb-error-modal__btn bb-error-modal__btn--retry"
            onClick={reset}
          >
            Tekrar Dene
          </button>
          <a href="/" className="bb-error-modal__btn bb-error-modal__btn--close">
            Ana Sayfa
          </a>
        </div>
      </div>
    </div>
  );
}
