"use client";

import { useEffect, useRef } from "react";

const LAT = 41.010255;
const LNG = 28.947369;
const ZOOM = 16;

export default function ContactMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let mounted = true;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mounted || !mapRef.current) return;

      // Strict Mode çift çalışmasından kalan artık instance'ı temizle
      if ((mapRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) {
        instanceRef.current?.remove();
        instanceRef.current = null;
      }

      if (instanceRef.current) return;

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const map = L.map(mapRef.current).setView([LAT, LNG], ZOOM);
      instanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.marker([LAT, LNG], { icon })
        .addTo(map)
        .bindPopup("<b>AtaBilet</b><br>İstanbul, Türkiye")
        .openPopup();
    })();

    return () => {
      mounted = false;
      instanceRef.current?.remove();
      instanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: 450, borderRadius: 16, zIndex: 0 }}
    />
  );
}
