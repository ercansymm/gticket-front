import type { Metadata } from "next";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import TrustBar from "@/components/homes/home-one/TrustBar";

export const metadata: Metadata = {
  title: "Çerez Politikası | AtaBilet",
  description:
    "AtaBilet'in web sitesinde kullandığı çerezler, amaçları ve yönetim seçenekleri hakkında bilgi alın.",
  alternates: { canonical: "https://www.atabilet.com/cerez-politikasi" },
};

export default function CerezPolitikasiPage() {
  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main className="ab-legal-page">
        <div className="container">
          <div className="ab-legal-page__inner">

            <h1>Çerez Politikası</h1>
            <span className="ab-legal-page__updated">Son güncelleme: Mayıs 2025</span>

            <p>
              AtaBilet olarak atabilet.com'da sunulan hizmetin işlevselliğini sağlamak,
              site deneyimini iyileştirmek ve yasal yükümlülüklerimizi yerine getirmek
              amacıyla çerez ("cookie") ve benzeri izleme teknolojilerinden yararlanıyoruz.
              Bu Çerez Politikası; hangi çerezlerin kullanıldığını, amaçlarını ve
              tercihlerinizi nasıl yönetebileceğinizi açıklamaktadır.
            </p>

            <h2>1. Çerez Nedir?</h2>
            <p>
              Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla
              cihazınıza yerleştirilen küçük metin dosyalarıdır. Ziyaretinize ilişkin
              bilgileri saklayarak sonraki ziyaretlerinizde sizi tanıyabilmemizi ve
              tercihlerinizi hatırlayabilmemizi sağlarlar.
            </p>
            <p>
              Çerezler; oturum çerezleri (tarayıcı kapatıldığında silinir) ve kalıcı
              çerezler (belirlenen süre boyunca saklanır) olarak ikiye ayrılır.
              Ayrıca birinci taraf çerezler (atabilet.com tarafından yerleştirilen) ve
              üçüncü taraf çerezler (harici hizmet sağlayıcılar tarafından yerleştirilen)
              şeklinde de sınıflandırılır.
            </p>

            <h2>2. Kullandığımız Çerez Kategorileri</h2>

            <h3>2.1. Zorunlu Çerezler</h3>
            <p>
              Bu çerezler, sitenin temel işlevlerinin çalışması için vazgeçilmezdir.
              Oturum yönetimi, güvenlik doğrulaması ve alışveriş sepeti gibi kritik
              işlevleri destekler. Devre dışı bırakılamaz; ancak çoğu yalnızca tarayıcı
              kapatıldığında silinen oturum çerezleridir.
            </p>
            <ul>
              <li>
                <strong>Oturum çerezi (session_id):</strong> Giriş yapmış kullanıcının
                oturumunu aktif tutar; tarayıcı kapatıldığında silinir.
              </li>
              <li>
                <strong>CSRF koruma çerezi:</strong> Siteler arası istek sahteciliği
                saldırılarına karşı güvenlik sağlar.
              </li>
              <li>
                <strong>Çerez onay çerezi (cookie_consent):</strong> Çerez tercih
                seçimlerinizi hatırlar; 12 ay saklanır.
              </li>
            </ul>

            <h3>2.2. İşlevsel (Tercih) Çerezler</h3>
            <p>
              Dil seçimi, döviz birimi tercihi ve arama geçmişi gibi kişiselleştirme
              ayarlarınızı hatırlamak için kullanılır. Bu çerezler olmadan bazı kişiselleştirme
              özellikleri çalışmayabilir.
            </p>
            <ul>
              <li>
                <strong>Dil tercihi (lang):</strong> Seçtiğiniz dili hatırlar; 12 ay saklanır.
              </li>
              <li>
                <strong>Döviz tercihi (currency):</strong> TRY/USD/EUR seçimini hatırlar;
                12 ay saklanır.
              </li>
              <li>
                <strong>Son arama (last_search):</strong> Son uçuş arama parametrelerinizi
                saklar; 7 gün.
              </li>
            </ul>

            <h3>2.3. Analitik Çerezler</h3>
            <p>
              Ziyaretçilerin siteyi nasıl kullandığını anonim olarak anlamamıza yardımcı
              olur. Bu veriler, sitenin performansını ve kullanıcı deneyimini iyileştirmek
              amacıyla kullanılır; kişisel olarak sizi tanımlamaya yönelik değildir.
            </p>
            <ul>
              <li>
                <strong>Google Analytics (_ga, _gid):</strong> Anonim ziyaretçi istatistikleri
                (sayfa görüntülemeleri, oturum süresi, tıklama yolları). Saklama süresi:
                _ga 2 yıl, _gid 24 saat.
              </li>
            </ul>

            <h3>2.4. Pazarlama ve Hedefleme Çerezleri</h3>
            <p>
              Bu çerezler yalnızca <strong>açık onayınız hâlinde</strong> etkinleştirilir.
              İlgi alanlarınıza uygun içerik ve reklam sunmak amacıyla kullanılır.
              Onayınızı istediğiniz zaman geri alabilirsiniz.
            </p>
            <ul>
              <li>
                <strong>Google Ads / Remarketing:</strong> Ziyaret ettiğiniz sayfalara göre
                kişiselleştirilmiş reklam gösterilmesi.
              </li>
              <li>
                <strong>Meta Pixel:</strong> Sosyal medya platformlarında hedeflenmiş
                reklam sunumu.
              </li>
            </ul>

            <h2>3. Çerez Saklama Süreleri Özeti</h2>
            <div style={{ overflowX: "auto" }}>
              <table className="ab-legal-page__table">
                <thead>
                  <tr>
                    <th>Çerez Adı</th>
                    <th>Kategori</th>
                    <th>Saklama Süresi</th>
                    <th>Amaç</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>session_id</td>
                    <td>Zorunlu</td>
                    <td>Oturum süresi</td>
                    <td>Kullanıcı oturumu</td>
                  </tr>
                  <tr>
                    <td>cookie_consent</td>
                    <td>Zorunlu</td>
                    <td>12 ay</td>
                    <td>Çerez tercihi kaydı</td>
                  </tr>
                  <tr>
                    <td>lang</td>
                    <td>İşlevsel</td>
                    <td>12 ay</td>
                    <td>Dil tercihi</td>
                  </tr>
                  <tr>
                    <td>currency</td>
                    <td>İşlevsel</td>
                    <td>12 ay</td>
                    <td>Döviz birimi tercihi</td>
                  </tr>
                  <tr>
                    <td>last_search</td>
                    <td>İşlevsel</td>
                    <td>7 gün</td>
                    <td>Son arama hatırlama</td>
                  </tr>
                  <tr>
                    <td>_ga</td>
                    <td>Analitik</td>
                    <td>2 yıl</td>
                    <td>Anonim istatistik</td>
                  </tr>
                  <tr>
                    <td>_gid</td>
                    <td>Analitik</td>
                    <td>24 saat</td>
                    <td>Anonim günlük istatistik</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>4. Çerez Tercihlerinizi Yönetme</h2>

            <h3>4.1. Çerez Onay Merkezi</h3>
            <p>
              Sitemizi ilk ziyaretinizde görüntülenen çerez onay penceresinden zorunlu
              çerezler dışındakileri kategori bazlı olarak kabul edebilir veya
              reddedebilirsiniz. Tercihlerinizi istediğiniz zaman güncelleyebilirsiniz.
            </p>

            <h3>4.2. Tarayıcı Ayarları</h3>
            <p>
              Tüm çerezleri tarayıcı ayarlarından yönetebilirsiniz. Zorunlu çerezler
              devre dışı bırakılırsa oturum açma, rezervasyon ve ödeme gibi temel
              işlevler çalışmayabilir.
            </p>
            <p>Popüler tarayıcılarda çerez ayarlarına ulaşmak için:</p>
            <ul>
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Chrome — Çerez Ayarları
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/tr/kb/cerezleri-silmek"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mozilla Firefox — Çerez Yönetimi
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/tr-tr/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apple Safari — Çerez Tercihleri
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/tr-tr/microsoft-edge/microsoft-edge-de-tanımlama-bilgilerini-silme-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Microsoft Edge — Çerez Yönetimi
                </a>
              </li>
            </ul>

            <h3>4.3. Google Analytics'ten Çıkma</h3>
            <p>
              Google Analytics izlemesini devre dışı bırakmak için{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Analytics Opt-out Browser Add-on
              </a>{" "}
              eklentisini yükleyebilirsiniz.
            </p>

            <h2>5. Üçüncü Taraf Çerezleri</h2>
            <p>
              Google Analytics, Google Ads ve Meta Pixel gibi üçüncü taraf hizmetler kendi
              gizlilik politikaları çerçevesinde çerez yerleştirebilir. Bu üçüncü tarafların
              veri işleme pratikleri kendi politikalarına tabidir:
            </p>
            <ul>
              <li>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Gizlilik Politikası
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/privacy/policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Meta Gizlilik Politikası
                </a>
              </li>
            </ul>

            <h2>6. KVKK Kapsamındaki Haklarınız</h2>
            <p>
              Çerezler aracılığıyla işlenen kişisel veriler bakımından 6698 sayılı KVKK
              kapsamındaki haklarınızı kullanabilirsiniz. Ayrıntılı bilgi için{" "}
              <a href="/kvkk">KVKK Aydınlatma Metni</a> sayfasını inceleyiniz.
            </p>

            <h2>7. Politika Güncellemeleri</h2>
            <p>
              Bu Çerez Politikası, yasal düzenlemeler veya kullandığımız teknolojilerdeki
              değişiklikler doğrultusunda güncellenebilir. Önemli değişikliklerde çerez
              onay penceresi yeniden gösterilir. Güncel politikaya her zaman bu sayfadan
              ulaşabilirsiniz.
            </p>

            <h2>8. İletişim</h2>
            <p>
              Çerez kullanımına ilişkin sorularınız için{" "}
              <a href="/iletisim">iletişim formunu</a> kullanabilir veya{" "}
              <a href="mailto:kvkk@atabilet.com">kvkk@atabilet.com</a> adresine
              yazabilirsiniz.
            </p>

          </div>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
