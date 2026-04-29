import LoginForm from "../../forms/LoginForm";

const LoginArea = () => {
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
            <h2>Tekrar hoş geldiniz</h2>
            <p>
              Rezervasyonlarınızı yönetmek, geçmiş biletlerinize ulaşmak ve
              avantajlardan faydalanmak için hesabınıza giriş yapın.
            </p>
            <ul className="ab-auth__brand-features">
              <li>
                <i className="fa-solid fa-check" />
                Tüm rezervasyonlarınız tek panelde
              </li>
              <li>
                <i className="fa-solid fa-check" />
                Hızlı yeniden rezervasyon
              </li>
              <li>
                <i className="fa-solid fa-check" />
                7/24 destek talep yönetimi
              </li>
            </ul>
          </div>
        </aside>

        {/* Form panel */}
        <div className="ab-auth__form-wrap">
          <h1 className="ab-auth__title">Hesabınıza giriş yapın</h1>
          <p className="ab-auth__subtitle">
            E-posta adresiniz ve şifrenizle güvenli giriş yapın.
          </p>
          <LoginForm />
        </div>
      </div>
    </section>
  );
};

export default LoginArea;
