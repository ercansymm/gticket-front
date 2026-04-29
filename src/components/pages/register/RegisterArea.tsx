import RegisterForm from "../../forms/RegisterForm";

const RegisterArea = () => {
  return (
    <section className="ab-auth">
      <div className="ab-auth__shell">
        {/* Brand panel */}
        <aside className="ab-auth__brand" aria-hidden="true">
          <div className="ab-auth__brand-logo">
            <span style={{ color: "#DC2626" }}>Ata</span>
            <span style={{ color: "#FFFFFF" }}>Bilet</span>
          </div>
          <div className="ab-auth__brand-headline">
            <h2>Aramıza katılın</h2>
            <p>
              Ücretsiz hesabınızı oluşturun, biletlerinizi tek panelden yönetin
              ve AtaBilet&apos;e özel avantajlardan yararlanın.
            </p>
            <ul className="ab-auth__brand-features">
              <li>
                <i className="fa-solid fa-check" />
                Hızlı ve kolay rezervasyon
              </li>
              <li>
                <i className="fa-solid fa-check" />
                Geçmiş biletlerinize anında erişim
              </li>
              <li>
                <i className="fa-solid fa-check" />
                Üyelere özel kampanyalar
              </li>
            </ul>
          </div>
        </aside>

        {/* Form panel */}
        <div className="ab-auth__form-wrap">
          <h1 className="ab-auth__title">Yeni hesap oluşturun</h1>
          <p className="ab-auth__subtitle">
            Bilgilerinizi girerek ücretsiz AtaBilet hesabınızı saniyeler içinde
            oluşturun.
          </p>
          <RegisterForm />
        </div>
      </div>
    </section>
  );
};

export default RegisterArea;
