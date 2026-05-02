"use client";

import Image from "next/image";

const Campaigns = () => {
  return (
    <section className="bb-campaigns">
      <div className="container">
        <a href="/" className="bb-promo-banner">
          <Image
            src="/assets/img/banner/banner-2/atabiletbenner.jpeg"
            alt="AtaBilet Kampanya"
            fill
            className="bb-promo-banner__img"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        </a>
      </div>
    </section>
  );
};

export default Campaigns;
