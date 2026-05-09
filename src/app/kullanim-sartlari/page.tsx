import type { Metadata } from "next";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import TrustBar from "@/components/homes/home-one/TrustBar";

export const metadata: Metadata = {
  title: "Kullanım Şartları | AtaBilet",
  description:
    "AtaBilet platformunu kullanmadan önce lütfen kullanım şartlarını okuyunuz.",
  alternates: { canonical: "https://www.atabilet.com/kullanim-sartlari" },
};

export default function KullanimSartlariPage() {
  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main className="ab-legal-page">
        <div className="container">
          <div className="ab-legal-page__inner">

            <h1>Kullanım Şartları</h1>
            <span className="ab-legal-page__updated">Son güncelleme: Mayıs 2025</span>

            <h2>1. Taraflar ve Kapsam</h2>
            <p>
              Bu Kullanım Şartları, <strong>AtaBilet</strong> ("Şirket") ile{" "}
              <strong>atabilet.com</strong> web sitesini ve mobil uyumlu hizmetlerini kullanan
              kişi ("Kullanıcı") arasındaki hukuki ilişkiyi düzenler. Siteyi kullanmaya
              başlamanız, bu şartları okuduğunuzu ve kabul ettiğinizi gösterir. Bu şartları
              kabul etmiyorsanız lütfen siteyi kullanmayınız.
            </p>

            <h2>2. Hizmetin Tanımı</h2>
            <p>
              AtaBilet, Türkiye'de ve uluslararası hatlarda uçak bileti arama, rezervasyon ve satın
              alma hizmetleri sunan IATA akreditasyonlu bir acentedir. Platform üzerinden yapılan
              bilet satışları ilgili havayolu şirketinin taşıma sözleşmesine tabidir. AtaBilet aracı
              acente sıfatıyla hareket eder; havayolu ile yolcu arasındaki sözleşmenin tarafı
              değildir.
            </p>

            <h2>3. Rezervasyon ve Satın Alma</h2>
            <ul>
              <li>
                Ödeme işleminin tamamlanmasıyla rezervasyon kesinleşir; havayolu bileti elektronik
                ortamda düzenlenir ve kayıtlı e-posta adresinize gönderilir.
              </li>
              <li>
                Fiyatlar, stok ve kullanılabilirlik anlık olarak değişebilir; fiyat bilgisi yalnızca
                ödeme tamamlanana kadar geçerlidir.
              </li>
              <li>
                Bilet üzerindeki isim bilgisi yolcunun resmi kimliğiyle birebir eşleşmelidir; isim
                hatası nedeniyle havayolunun uygulayacağı ücretlerden Şirket sorumlu tutulamaz.
              </li>
              <li>
                Uluslararası uçuşlarda pasaport geçerlilik süresi ve vize koşullarını kontrol etmek
                kullanıcının sorumluluğundadır.
              </li>
              <li>
                Satın alma işlemini tamamlayarak verdiğiniz bilgilerin doğruluğunu teyit etmiş
                sayılırsınız.
              </li>
            </ul>

            <h2>4. İptal ve İade Koşulları</h2>
            <p>
              İptal ve iade koşulları, satın alınan biletin havayolu tarifesine (fare rule) göre
              belirlenir. Geri ödemeli (refundable) biletlerde, havayolunun uyguladığı kesintiler
              ve hizmet bedeli düşüldükten sonra kalan tutar ödeme yönteminize iade edilir.
              Geri ödemesiz (non-refundable) biletlerde iade yapılmaz; ancak tarih/saat değişikliği
              mümkün olabilir (havayolu kurallarına göre değişir ve ek ücret alınabilir).
            </p>
            <p>
              Tüketici Kanunu kapsamında cayma hakkı, havayolu bileti gibi belirli bir tarih veya
              döneme ait rezervasyon hizmetleri için uygulanmaz (6502 s. Kanun Md. 15/g).
            </p>
            <p>
              İptal taleplerinizi <a href="/destek">destek sayfamız</a> üzerinden veya{" "}
              <a href="mailto:destek@atabilet.com">destek@atabilet.com</a> adresine e-posta
              göndererek iletebilirsiniz.
            </p>

            <h2>5. Kullanıcı Hesabı</h2>
            <ul>
              <li>Hesap oluşturmak için gerçek ve güncel bilgi verilmesi zorunludur.</li>
              <li>
                Hesap güvenliğinizden siz sorumlusunuzdur; şifrenizi kimseyle paylaşmayınız.
              </li>
              <li>
                Hesabınızın yetkisiz kullanımını fark ettiğinizde derhal{" "}
                <a href="/iletisim">bize bildirin</a>.
              </li>
              <li>
                Hesabınız üzerinden gerçekleştirilen tüm işlemler size ait kabul edilir; yetkisiz
                erişimden doğan zararlar için Şirket sorumlu tutulamaz.
              </li>
            </ul>

            <h2>6. Ödeme Güvenliği</h2>
            <p>
              Tüm ödemeler 256-bit SSL şifreleme ve 3D Secure altyapısıyla güvence altındadır.
              Kart bilgileri AtaBilet sunucularında saklanmaz; işlemler PCI-DSS uyumlu ödeme
              kuruluşu aracılığıyla gerçekleştirilir. Ödeme sırasında yaşanan teknik aksaklıklar
              nedeniyle kartınızdan çekim yapılmış ancak bilet düzenlenmemişse iade süreci en
              geç 5 iş günü içinde başlatılır.
            </p>

            <h2>7. Yasaklı Kullanımlar</h2>
            <p>Aşağıdaki kullanımlar kesinlikle yasaktır:</p>
            <ul>
              <li>Sahte veya başkasına ait kimlik/kart bilgisiyle işlem yapmak.</li>
              <li>Sistemi otomatize araçlarla (bot, scraper vb.) taramak veya yük bindirmek.</li>
              <li>Platform üzerindeki içerikleri izinsiz kopyalamak veya yeniden dağıtmak.</li>
              <li>Güvenlik açıklarını istismar etmeye çalışmak.</li>
            </ul>
            <p>
              Bu tür kullanımlar tespiti hâlinde hesabınız askıya alınabilir ve yasal işlem
              başlatılabilir.
            </p>

            <h2>8. Fikri Mülkiyet</h2>
            <p>
              atabilet.com sitesinde yer alan tüm içerik, tasarım, logo ve yazılımlar AtaBilet'e
              aittir veya lisanslıdır. Önceden yazılı izin alınmaksızın kopyalanamaz, dağıtılamaz
              veya ticari amaçla kullanılamaz.
            </p>

            <h2>9. Sorumluluğun Sınırlandırılması</h2>
            <p>
              AtaBilet, aracı acente sıfatıyla hareket etmektedir. Havayolu kaynaklı gecikmeler,
              iptal, bagaj hasarı veya hizmet değişiklikleri nedeniyle doğan zararlardan sorumlu
              tutulamaz. Şirketin azami sorumluluğu, ilgili bilet bedeliyle sınırlıdır. Mücbir
              sebep hâllerinde (doğal afet, salgın, savaş vb.) hiçbir sorumluluk üstlenilmez.
            </p>

            <h2>10. Kişisel Verilerin Korunması</h2>
            <p>
              Kişisel verilerinizin işlenmesine ilişkin detaylı bilgi için{" "}
              <a href="/gizlilik">Gizlilik Politikası</a> ve{" "}
              <a href="/kvkk">KVKK Aydınlatma Metni</a> sayfalarını inceleyiniz.
            </p>

            <h2>11. Uygulanacak Hukuk ve Uyuşmazlık</h2>
            <p>
              Bu şartlar Türk hukukuna tabidir. Uyuşmazlıklarda öncelikle Tüketici Hakem
              Heyeti başvurusu, ardından İstanbul (Anadolu) Tüketici Mahkemeleri yetkilidir.
              Tüketici işlemi niteliğindeki uyuşmazlıklarda 6502 sayılı Tüketicinin Korunması
              Hakkında Kanun hükümleri öncelikle uygulanır.
            </p>

            <h2>12. Değişiklikler</h2>
            <p>
              Şirket, bu şartları önceden bildirmeksizin güncelleme hakkını saklı tutar. Güncel
              şartlar her zaman bu sayfada yayınlanır; siteyi kullanmaya devam etmeniz güncel
              şartları kabul ettiğiniz anlamına gelir.
            </p>

            <h2>13. İletişim</h2>
            <p>
              Bu şartlara ilişkin sorularınız için <a href="/iletisim">iletişim formunu</a>{" "}
              kullanabilir veya{" "}
              <a href="mailto:destek@atabilet.com">destek@atabilet.com</a> adresine yazabilirsiniz.
            </p>

          </div>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
