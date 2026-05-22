"use client";

import Image from "next/image";

const airlines = [
  { code: "TK", name: "Turkish Airlines" },
  { code: "PC", name: "Pegasus" },
  { code: "ET", name: "Ethiopian Airlines" },
  { code: "AF", name: "Air France" },
  { code: "KL", name: "KLM" },
  { code: "BA", name: "British Airways" },
  { code: "EK", name: "Emirates" },
  { code: "QR", name: "Qatar Airways" },
  { code: "AY", name: "Finnair" },
  { code: "LX", name: "Swiss" },
  { code: "SU", name: "Aeroflot" },
  { code: "W6", name: "Wizz Air" },
];

const AirlinePartners = () => (
  <section className="bb-airline-partners" aria-labelledby="airline-partners-title">
    <div className="container">
      <div className="bb-airline-partners__header">
        <h2 id="airline-partners-title" className="bb-airline-partners__title">
          Anlaşmalı Havayollarımız
        </h2>
        <p className="bb-airline-partners__subtitle">
          Türkiye ve dünyanın önde gelen havayollarıyla 90+ destinasyona bilet
        </p>
      </div>

      <div className="bb-airline-partners__grid">
        {airlines.map((airline) => (
          <div key={airline.code} className="bb-airline-card" title={airline.name}>
            <Image
              src={`/airlines/${airline.code}.png`}
              alt={airline.name}
              width={64}
              height={64}
              unoptimized
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <p className="bb-airline-partners__note">
        ve 90+ havayolu şirketi daha
      </p>
    </div>
  </section>
);

export default AirlinePartners;
