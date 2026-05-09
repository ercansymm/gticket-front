import type { Metadata } from "next";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import TrustBar from "@/components/homes/home-one/TrustBar";

export const metadata: Metadata = {
  title: "Gizlilik Politikası ve KVKK Aydınlatma Metni | AtaBilet",
  description:
    "AtaBilet kişisel verilerin korunması, gizlilik politikası ve çerez kullanımı hakkında bilgi.",
  alternates: { canonical: "https://www.atabilet.com/gizlilik" },
};

export default function GizlilikPage() {
  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main className="ab-legal-page">
        <div className="container">
          <div className="ab-legal-page__inner">

            <h1>Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
            <span className="ab-legal-page__updated">Son güncelleme: Mayıs 2025</span>

            <h2>1. Veri Sorumlusu</h2>
            <p>
              AtaBilet ("Şirket"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu
              sıfatıyla hareket etmekte olup bu aydınlatma metniyle kişisel verilerinizin işlenmesine ilişkin
              usul ve esasları sizinle paylaşmaktadır.
            </p>

            <h2>2. İşlenen Kişisel Veriler</h2>
            <p>Hizmetlerimizi sunarken aşağıdaki kişisel veriler işlenebilmektedir:</p>
            <ul>
              <li><strong>Kimlik verileri:</strong> Ad, soyad, T.C. kimlik numarası, pasaport numarası, doğum tarihi.</li>
              <li><strong>İletişim verileri:</strong> E-posta adresi, telefon numarası.</li>
              <li><strong>Rezervasyon verileri:</strong> Uçuş tercihleri, PNR numarası, yolcu bilgileri.</li>
              <li><strong>Ödeme verileri:</strong> Fatura bilgileri (kart numarası tarafımızca saklanmamaktadır).</li>
              <li><strong>İşlem güvenliği verileri:</strong> IP adresi, oturum bilgisi, çerez verileri.</li>
              <li><strong>Talep/şikayet verileri:</strong> Destek talepleri ve yazışmalar.</li>
            </ul>

            <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
            <ul>
              <li>Uçak bileti rezervasyonu, satışı ve bilet kesimi işlemlerinin yürütülmesi.</li>
              <li>3D Secure ödeme süreçlerinin tamamlanması.</li>
              <li>Müşteri destek hizmetlerinin sunulması.</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, fatura, yolcu bildirimi).</li>
              <li>Sahtekarlık ve güvenlik ihlallerinin önlenmesi.</li>
              <li>İzin vermeniz hâlinde; kampanya, indirim ve duyuru bildirimleri.</li>
            </ul>

            <h2>4. Kişisel Verilerin Aktarılması</h2>
            <p>
              Kişisel verileriniz; rezervasyon işleminin tamamlanabilmesi için ilgili havayolu şirketi ve
              IATA akreditasyonlu sistem sağlayıcısı BiletBank A.Ş. ile, ödeme işlemleri için
              PCI-DSS uyumlu ödeme kuruluşuyla ve yasal zorunluluk hâllerinde kamu kurumlarıyla paylaşılabilir.
              Yurt dışına aktarım, yalnızca uluslararası rezervasyonlar kapsamında ilgili havayolu ile yapılır.
            </p>

            <h2>5. Kişisel Verilerin Saklanma Süresi</h2>
            <p>
              Verileriniz, ilgili mevzuatta öngörülen süreler boyunca (vergi mevzuatı kapsamında en az 5 yıl,
              tüketici mevzuatı kapsamında en az 3 yıl) saklanır. Bu sürelerin sona ermesinin ardından güvenli
              biçimde silinir veya anonim hâle getirilir.
            </p>

            <h2>6. Kişisel Veri Sahibinin Hakları (KVKK Madde 11)</h2>
            <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul>
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>Verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Eksik veya yanlış verilerin düzeltilmesini isteme,</li>
              <li>KVKK'nın 7. maddesi çerçevesinde silinmesini ya da yok edilmesini isteme,</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
              <li>Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme.</li>
            </ul>
            <p>
              Haklarınızı kullanmak için <a href="/iletisim">iletişim formumuz</a> aracılığıyla veya{" "}
              <a href="mailto:kvkk@atabilet.com">kvkk@atabilet.com</a> adresine e-posta göndererek
              başvurabilirsiniz. Başvurularınız en geç 30 gün içinde yanıtlanır.
            </p>

            <h2>7. Veri Güvenliği</h2>
            <p>
              Kişisel verileriniz 256-bit SSL şifreleme ile iletilmekte, sunucularımızda erişim
              kontrollü ortamlarda saklanmakta ve düzenli güvenlik denetimine tabi tutulmaktadır.
              Kart bilgileriniz tarafımızca hiçbir şekilde saklanmaz; ödeme işlemleri PCI-DSS
              sertifikalı altyapı üzerinden gerçekleştirilir.
            </p>

            {/* Çerez bölümü */}
            <span className="ab-legal-page__section-anchor" id="cerez" />
            <h2>8. Çerez Politikası</h2>
            <p>
              AtaBilet, web sitesinin işlevselliğini ve kullanıcı deneyimini iyileştirmek amacıyla
              çerez ("cookie") teknolojisinden yararlanmaktadır.
            </p>

            <h2>8.1. Çerez Türleri</h2>
            <ul>
              <li>
                <strong>Zorunlu çerezler:</strong> Oturum yönetimi, güvenlik doğrulaması ve site
                işlevselliği için gereklidir. Devre dışı bırakılamaz.
              </li>
              <li>
                <strong>Analitik çerezler:</strong> Ziyaretçi davranışlarını anonim olarak anlamamıza
                yardımcı olur (örn. hangi sayfaların ne kadar süre ziyaret edildiği).
              </li>
              <li>
                <strong>Tercih çerezleri:</strong> Dil seçimi, döviz tercihi gibi ayarlarınızı
                hatırlamamızı sağlar.
              </li>
              <li>
                <strong>Pazarlama çerezleri:</strong> Yalnızca açık onayınız hâlinde ilgi
                alanlarınıza uygun reklamlar göstermek amacıyla kullanılır.
              </li>
            </ul>

            <h2>8.2. Çerezlerin Yönetimi</h2>
            <p>
              Tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman silebilir veya engelleyebilirsiniz.
              Zorunlu çerezler dışındakileri reddetmeniz hâlinde bazı özellikler (dil tercihi,
              oturum hatırlama vb.) düzgün çalışmayabilir.
            </p>
            <p>
              Popüler tarayıcılarda çerez ayarları için:{" "}
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a>
              {" · "}
              <a href="https://support.mozilla.org/tr/kb/cerezleri-silmek" target="_blank" rel="noopener noreferrer">Firefox</a>
              {" · "}
              <a href="https://support.apple.com/tr-tr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a>
            </p>

            <h2>9. Politika Güncellemeleri</h2>
            <p>
              Bu metin, yasal düzenlemeler veya hizmetlerimizdeki değişiklikler doğrultusunda
              güncellenebilir. Önemli değişikliklerde kullanıcılarımıza e-posta ile bildirim yapılır.
              Güncel metne her zaman bu sayfadan ulaşabilirsiniz.
            </p>

          </div>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
