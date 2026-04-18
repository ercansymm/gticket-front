// components/AirlineLogo.tsx
// Kullanim: <AirlineLogo code="TK" size={32} />

"use client";

import { useState } from "react";

interface AirlineLogoProps {
  code: string;            // IATA kodu: "TK", "PC", "LH", vb.
  size?: number;           // px cinsinden (varsayilan 32)
  className?: string;
  alt?: string;
}

export default function AirlineLogo({
  code,
  size = 32,
  className = "",
  alt = "",
}: AirlineLogoProps) {
  const [errored, setErrored] = useState(false);

  const upperCode = (code || "").toUpperCase();

  // Circular container style (applies to both image and fallback)
  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    overflow: "hidden",
    background: "#fff",
    border: "1px solid #E5E7EB",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    // Ensure the logo prints in PDF (all major browsers)
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  };

  // If no code or image failed to load, show IATA code inside the circle
  if (!upperCode || errored) {
    return (
      <span
        className={className}
        style={{
          ...containerStyle,
          background: "#F3F4F6",
          color: "#374151",
          fontSize: Math.round(size * 0.36),
          fontWeight: 700,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {upperCode || "??"}
      </span>
    );
  }

  // kiwi.com returns icon-only (no wordmark) airline logos for all IATA codes
  const src = `https://images.kiwi.com/airlines/64x64/${upperCode}.png`;

  return (
    <span className={className} style={containerStyle}>
      <img
        src={src}
        alt={alt || upperCode}
        width={size}
        height={size}
        onError={() => setErrored(true)}
        style={{
          width: "82%",
          height: "82%",
          objectFit: "contain",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
        loading="lazy"
      />
    </span>
  );
}
