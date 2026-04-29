import Link from "next/link";

const STATS = [
  { value: "50+",   label: "Havayolu" },
  { value: "500+",  label: "Destinasyon" },
  { value: "7/24",  label: "Müşteri Desteği" },
  { value: "2019",  label: "Kuruluş Yılı" },
];

const AboutArea = () => {
  return (
    <section className="ab-section">
      <div className="container">

        {/* Hero metin */}
        <div className="ab-hero">
          <div className="ab-hero__badge">AtaBilet Hakkında</div>
          <h1 className="ab-hero__title">
            Hayalinizdeki Seyahati<br />
            <span className="ab-hero__title--accent">AtaBilet ile Gerçekleştirin</span>
          </h1>
          <p className="ab-hero__desc">
            AtaBilet olarak yurt içi ve yurt dışı uçak biletlerini en uygun fiyatlarla sunuyoruz.
            Tüm havayollarını tek seferde karşılaştırın, güvenle satın alın.
            Zlatna Rota Turizm bünyesinde TURSAB 18474 ruhsatıyla hizmet vermekteyiz.
          </p>
          <Link href="/" className="ab-hero__cta">
            Uçuş Ara
          </Link>
        </div>

        {/* İstatistikler */}
        <div className="ab-stats">
          {STATS.map((s, i) => (
            <div key={i} className="ab-stat">
              <span className="ab-stat__value">{s.value}</span>
              <span className="ab-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Hakkımızda metni */}
        <div className="ab-body">
          <div className="ab-body__col">
            <h2 className="ab-body__heading">Misyonumuz</h2>
            <p className="ab-body__text">
              Seyahat etmek isteyen herkese en uygun fiyatları, en kolay rezervasyon deneyimini
              ve en güvenilir hizmeti sunmayı hedefliyoruz. BiletBank altyapısı üzerinden gerçek
              zamanlı uçuş verilerine erişerek anlık fiyatları doğrudan size iletiyoruz.
            </p>
            <p className="ab-body__text">
              Müşterilerimizin memnuniyeti her zaman önceliğimizdir. Satın alma öncesinde,
              sırasında ve sonrasında 7/24 destek ekibimizle yanınızdayız.
            </p>
          </div>
          <div className="ab-body__col">
            <h2 className="ab-body__heading">Neden AtaBilet?</h2>
            <ul className="ab-list">
              <li className="ab-list__item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Tüm havayollarında anlık fiyat karşılaştırma
              </li>
              <li className="ab-list__item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                3D Secure güvenceli ödeme altyapısı
              </li>
              <li className="ab-list__item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Anlık e-bilet teslimatı
              </li>
              <li className="ab-list__item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Esnek iptal ve değişiklik desteği
              </li>
              <li className="ab-list__item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                TURSAB üyesi güvenilir acente
              </li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutArea;
