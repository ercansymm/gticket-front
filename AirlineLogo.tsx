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
  const src = errored || !upperCode
    ? "/airlines/default.png"
    : `/airlines/${upperCode}.png`;

  return (
    <img
      src={src}
      alt={alt || upperCode}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
      loading="lazy"
    />
  );
}
