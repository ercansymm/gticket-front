"use client";

import { useEffect, useState, useRef } from "react";

const IMAGES = [
  "/ethiopia-search/ethiopiasearch2.png",
  "/ethiopia-search/ethiopiasearch3.png",
  "/ethiopia-search/ethiopiasearch4..jpeg",
  "/ethiopia-search/ethiopiasearch5.jpg",
];

const SLOGANS = [
  "Dünyaya açılan kapın: Atabilet.com",
  "Ethiopian Airlines ayrıcalığıyla şimdi keşfet: Atabilet.com",
  "En iyi rotalar, en doğru fiyatlar: Atabilet.com",
  "Uçuşunu seç, dünyayı yaşa: Atabilet.com",
];

function formatDate(input: string): string {
  if (!input) return "";
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(input);
  if (iso) {
    return `${iso[3]}.${iso[2]}.${iso[1]}`;
  }
  const dmy = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/.exec(input);
  if (dmy) {
    const d = dmy[1].padStart(2, "0");
    const m = dmy[2].padStart(2, "0");
    return `${d}.${m}.${dmy[3]}`;
  }
  return input;
}

interface FlightSearchLoadingProps {
  origin: string;
  destination: string;
  departureDate: string;
  passengerCount: number;
  cabinClass: string;
  tripType: "one-way" | "round-trip";
}

export default function FlightSearchLoading({
  origin,
  destination,
  departureDate,
  passengerCount,
  cabinClass,
  tripType,
}: FlightSearchLoadingProps) {
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const [sloganVisible, setSloganVisible] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  const extendedImages = [...IMAGES, IMAGES[0]];
  const totalSlides = extendedImages.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setOffset((prev) => prev + 1);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (offset === IMAGES.length) {
      const snapTimer = setTimeout(() => {
        setIsTransitioning(false);
        setOffset(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsTransitioning(true);
          });
        });
      }, 750);
      return () => clearTimeout(snapTimer);
    }
  }, [offset]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSloganVisible(false);
      setTimeout(() => {
        setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
        setSloganVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const tripLabel = tripType === "round-trip" ? "Gidiş-Dönüş" : "Tek Yön";
  const dateLabel = formatDate(departureDate);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Uçuşlar aranıyor"
    >
      <div
        style={{
          width: "100%",
          maxWidth: "780px",
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Carousel ── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            overflow: "hidden",
            aspectRatio: "16 / 8",
            backgroundColor: "#0f172a",
          }}
        >
          <div
            ref={trackRef}
            style={{
              display: "flex",
              width: `${totalSlides * 100}%`,
              height: "100%",
              transform: `translateX(-${(offset * 100) / totalSlides}%)`,
              transition: isTransitioning
                ? "transform 700ms ease-in-out"
                : "none",
            }}
          >
            {extendedImages.map((src, i) => (
              <div
                key={i}
                style={{
                  width: `${100 / totalSlides}%`,
                  height: "100%",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Ethiopian Airlines ${(i % IMAGES.length) + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Info Panel (3 lines) ── */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "14px 28px 12px",
            textAlign: "center",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          {/* Line 1: Slogan (top) */}
          <div style={{ minHeight: "20px", marginBottom: "8px" }}>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: 600,
                color: "#dc2626",
                opacity: sloganVisible ? 1 : 0,
                transition: "opacity 400ms ease",
              }}
            >
              {SLOGANS[currentSlogan]}
            </p>
          </div>

          {/* Line 2: Date + trip type + passenger (single line) */}
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#475569",
            }}
          >
            <span style={{ fontWeight: 600, color: "#1e293b" }}>{dateLabel}</span>
            {" "}
            <span style={{ color: "#64748b" }}>({tripLabel})</span>
            {"  •  "}
            <span style={{ color: "#64748b" }}>{passengerCount} yolcu, {cabinClass}</span>
          </p>

          {/* Line 3: Route search */}
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "#475569",
              letterSpacing: "0.3px",
            }}
          >
            <span style={{ fontWeight: 600 }}>{origin}</span>
            {" → "}
            <span style={{ fontWeight: 600 }}>{destination}</span>
            {" "}
            kriterleriyle en iyi fiyatlı uçuşlar aranıyor...
          </p>
        </div>

        {/* ── Progress Bar ── */}
        <div
          style={{
            position: "relative",
            height: "3px",
            backgroundColor: "#e2e8f0",
            overflow: "hidden",
          }}
        >
          <span className="fsl-progress-bar" />
        </div>
      </div>

      <style jsx>{`
        @keyframes fslSlide {
          0% {
            left: -35%;
          }
          100% {
            left: 100%;
          }
        }
        .fsl-progress-bar {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -35%;
          width: 35%;
          background: linear-gradient(90deg, #1e293b, #334155, #1e293b);
          border-radius: 9999px;
          animation: fslSlide 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}