import Image from "next/image";

const Campaigns = () => {
  return (
    <section className="bb-campaigns">
      <div className="container">
        <a href="/" className="bb-banner-slot">
          <Image
            src="/images/banners/banner.jpg"
            alt="Banner"
            fill
            style={{ objectFit: "cover" }}
            sizes="100vw"
          />
        </a>
      </div>
    </section>
  );
};

export default Campaigns;
