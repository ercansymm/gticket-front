import type { Metadata } from "next";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import TrustBar from "@/components/homes/home-one/TrustBar";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | AtaBilet",
  description:
    "AtaBilet'in kişisel verilerinizi nasıl topladığı, kullandığı ve koruduğu hakkında bilgi alın.",
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

            <h1>Gizlilik Politikası</h1>
            <span className="ab-legal-page__updated">Son güncelleme: Mayıs 2025</span>

            <p>
              AtaBilet olarak gizliliğinize saygı duyuyor ve kişisel verilerinizin güvenliğini
              ön planda tutuyoruz. Bu Gizlilik Politikası; atabilet.com üzerinden sunulan
              hizmetleri kullanırken hangi verileri topladığımızı, bu verileri nasıl kullandığımızı,
              kimlerle paylaştığımızı ve sizi nasıl korduğumuzu açıklamaktadır.
            </p>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamındaki haklarınız ve
              aydınlatma yükümlülüğümüze ilişkin ayrıntılı bilgi için{" "}
              <a href="/kvkk">KVKK Aydınlatma Metni</a> sayfasını inceleyiniz.
            </p>

            <h2>1. Veri Sorumlusu</h2>
            <p>
              Veri sorumlusu sıfatıyla AtaBilet, toplanan kişisel verilerin işlenme amaçlarını
              ve yöntemlerini belirlemektedir. İletişim için{" "}
              <a href="mailto:kvkk@atabilet.com">kvkk@atabilet.com</a> adresini kullanabilirsiniz.
            </p>

            <h2>2. Topladığımız Veriler</h2>
            <p>Hizmetlerimizi sunarken aşağıdaki kişisel veriler işlenebilmektedir:</p>
            <ul>
              <li>
                <strong>Kimlik verileri:</strong> Ad, soyad, T.C. kimlik numarası, pasaport
                numarası, doğum tarihi, uyruk.
              </li>
              <li>
                <strong>İletişim verileri:</strong> E-posta adresi, telefon numarası.
              </li>
              <li>
                <strong>Rezervasyon ve seyahat verileri:</strong> Uçuş tercihleri, PNR numarası,
                yolcu bilgileri, bagaj tercihleri.
              </li>
              <li>
                <strong>Ödeme verileri:</strong> Fatura bilgileri. Kart numarası tarafımızca
                saklanmaz; PCI-DSS uyumlu ödeme altyapısına iletilir.
              </li>
              <li>
                <strong>Teknik veriler:</strong> IP adresi, tarayıcı türü, oturum bilgisi,
                çerez verileri, sayfa gezinti geçmişi.
              </li>
              <li>
                <strong>Talep ve şikayet verileri:</strong> Destek talepleri, yazışmalar ve
                geri bildirimler.
              </li>
            </ul>

            <h2>3. Veri Toplama Yöntemleri</h2>
            <p>Verilerinizi şu kanallardan topluyoruz:</p>
            <ul>
              <li>Rezervasyon, kayıt ve ödeme formları,</li>
              <li>Müşteri destek iletişimleri (e-posta, canlı destek, telefon),</li>
              <li>Çerezler ve benzeri izleme teknolojileri,</li>
              <li>Havayolu ve seyahat teknolojisi ortaklarından alınan uçuş verileri.</li>
            </ul>

            <h2>4. Verilerin Kullanım Amaçları</h2>
            <ul>
              <li>Uçak bileti rezervasyonu, satışı ve bilet düzenlenmesi,</li>
              <li>3D Secure ödeme süreçlerinin tamamlanması,</li>
              <li>Müşteri destek hizmetlerinin sağlanması,</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, fatura, yolcu bildirimi),</li>
              <li>Sahtekarlık ve güvenlik ihlallerinin önlenmesi,</li>
              <li>Site performansının ve kullanıcı deneyiminin iyileştirilmesi,</li>
              <li>
                Açık onayınız hâlinde: kampanya, indirim ve hizmet duyuruları (e-posta/SMS).
              </li>
            </ul>

            <h2>5. Verilerin Paylaşılması</h2>
            <p>
              Kişisel verileriniz aşağıdaki taraflarla, yalnızca belirtilen amaçlar doğrultusunda
              ve gerekli ölçüde paylaşılabilir:
            </p>
            <ul>
              <li>
                <strong>Havayolu şirketleri:</strong> Rezervasyonun tamamlanabilmesi ve
                yolcu bildirim yükümlülüklerinin yerine getirilmesi için.
              </li>
              <li>
                <strong>BiletBank A.Ş.:</strong> IATA akreditasyonlu global dağıtım sistemi
                (GDS) sağlayıcısı; rezervasyon işlemlerinin yürütülmesi için.
              </li>
              <li>
                <strong>Ödeme kuruluşu:</strong> PCI-DSS uyumlu altyapı; ödeme işleminin
                gerçekleştirilmesi için.
              </li>
              <li>
                <strong>Kamu kurumları ve mahkemeler:</strong> Yasal zorunluluk hâllerinde
                ilgili mevzuat çerçevesinde.
              </li>
            </ul>
            <p>
              Verilerinizi reklam amaçlı üçüncü taraflarla satmıyor veya kiralamıyoruz.
              Yurt dışına aktarım, yalnızca uluslararası rezervasyonlar kapsamında ilgili
              havayolu ile gerçekleşir.
            </p>

            <h2>6. Veri Saklama Süreleri</h2>
            <p>
              Verileriniz, ilgili mevzuatta öngörülen süreler boyunca saklanır:
            </p>
            <ul>
              <li>Vergi mevzuatı (VUK) kapsamında fatura ve işlem kayıtları: en az 5 yıl,</li>
              <li>Tüketici mevzuatı kapsamında rezervasyon kayıtları: en az 3 yıl,</li>
              <li>Ticaret Kanunu kapsamında ticari yazışmalar: en az 10 yıl.</li>
            </ul>
            <p>
              Bu sürelerin sona ermesinin ardından verileriniz güvenli biçimde silinir veya
              anonim hâle getirilir.
            </p>

            <h2>7. Veri Güvenliği</h2>
            <p>
              Kişisel verilerinizi korumak için teknik ve idari tedbirler uyguluyoruz:
            </p>
            <ul>
              <li>Tüm iletişim 256-bit SSL/TLS şifrelemeyle korunmaktadır.</li>
              <li>Kart bilgileri tarafımızca saklanmaz; PCI-DSS uyumlu altyapı kullanılır.</li>
              <li>Sunucu erişimleri yetkilendirme ve güvenlik duvarı ile sınırlandırılmıştır.</li>
              <li>Sistemler düzenli güvenlik denetimine tabi tutulmaktadır.</li>
              <li>Veri ihlali hâlinde yasal süreler içinde KVKK'ya ve etkilenen kişilere bildirim yapılır.</li>
            </ul>

            <h2>8. Çerezler</h2>
            <p>
              Sitemizde çerez ve benzeri teknolojiler kullanılmaktadır. Hangi çerezlerin
              kullanıldığı, amaçları ve yönetim seçenekleri hakkında ayrıntılı bilgi için{" "}
              <a href="/cerez-politikasi">Çerez Politikası</a> sayfamızı ziyaret ediniz.
            </p>

            <h2>9. Haklarınız</h2>
            <p>
              KVKK Madde 11 kapsamındaki haklarınız ve bunları nasıl kullanabileceğiniz
              hakkında ayrıntılı bilgi için <a href="/kvkk">KVKK Aydınlatma Metni</a>{" "}
              sayfasını inceleyiniz.
            </p>

            <h2>10. Politika Güncellemeleri</h2>
            <p>
              Bu politika, yasal düzenlemeler veya hizmetlerimizdeki değişiklikler
              doğrultusunda güncellenebilir. Önemli değişikliklerde e-posta bildirimi
              yapılır. Güncel metne her zaman bu sayfadan ulaşabilirsiniz.
            </p>

            <h2>11. İletişim</h2>
            <p>
              Gizlilik politikamıza ilişkin sorularınız için{" "}
              <a href="/iletisim">iletişim formunu</a> kullanabilir veya{" "}
              <a href="mailto:kvkk@atabilet.com">kvkk@atabilet.com</a> adresine yazabilirsiniz.
            </p>

          </div>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
