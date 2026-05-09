import type { Metadata } from "next";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import TrustBar from "@/components/homes/home-one/TrustBar";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | AtaBilet",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında AtaBilet'in kişisel veri işleme faaliyetlerine ilişkin aydınlatma metni.",
  alternates: { canonical: "https://www.atabilet.com/kvkk" },
};

export default function KvkkPage() {
  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main className="ab-legal-page">
        <div className="container">
          <div className="ab-legal-page__inner">

            <h1>KVKK Aydınlatma Metni</h1>
            <span className="ab-legal-page__updated">Son güncelleme: Mayıs 2025</span>

            <p>
              Bu metin, 6698 sayılı <strong>Kişisel Verilerin Korunması Kanunu</strong> ("KVKK")
              Madde 10 uyarınca, veri sorumlusu sıfatıyla <strong>AtaBilet</strong> tarafından
              kişisel verilerinizin işlenmesine ilişkin usul ve esasları açıklamak amacıyla
              hazırlanmıştır.
            </p>

            <h2>1. Veri Sorumlusunun Kimliği</h2>
            <p>
              <strong>Ticaret Unvanı:</strong> AtaBilet<br />
              <strong>Web Sitesi:</strong> atabilet.com<br />
              <strong>E-posta:</strong>{" "}
              <a href="mailto:kvkk@atabilet.com">kvkk@atabilet.com</a><br />
              <strong>İletişim:</strong> <a href="/iletisim">İletişim Formu</a>
            </p>

            <h2>2. İşlenen Kişisel Veriler</h2>
            <p>
              AtaBilet tarafından işlenebilecek kişisel veri kategorileri aşağıda yer almaktadır:
            </p>
            <ul>
              <li>
                <strong>Kimlik verileri:</strong> Ad, soyad, T.C. kimlik numarası, pasaport
                numarası, doğum tarihi, doğum yeri, cinsiyet, uyruk.
              </li>
              <li>
                <strong>İletişim verileri:</strong> E-posta adresi, telefon numarası.
              </li>
              <li>
                <strong>Seyahat ve rezervasyon verileri:</strong> Uçuş tercihleri, PNR numarası,
                koltuk ve bagaj tercihleri, özel yardım talepleri.
              </li>
              <li>
                <strong>Finansal veriler:</strong> Fatura bilgileri. Ödeme kartı numarası
                tarafımızca saklanmaz; PCI-DSS uyumlu ödeme altyapısına şifreli olarak iletilir.
              </li>
              <li>
                <strong>İşlem güvenliği verileri:</strong> IP adresi, oturum bilgisi, çerez
                verileri, tarayıcı türü.
              </li>
              <li>
                <strong>Talep ve şikayet verileri:</strong> Müşteri destek yazışmaları ve
                geri bildirimler.
              </li>
              <li>
                <strong>Pazarlama verileri (onay hâlinde):</strong> E-posta/SMS bildirim
                tercihleriniz ve kampanya etkileşim geçmişi.
              </li>
            </ul>

            <h2>3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Dayanakları</h2>
            <p>
              Kişisel verileriniz, KVKK Madde 5 kapsamındaki aşağıdaki hukuki dayanaklar
              çerçevesinde işlenmektedir:
            </p>
            <ul>
              <li>
                <strong>Sözleşmenin kurulması ve ifası (Md. 5/2-c):</strong> Uçak bileti
                rezervasyonu, satışı, bilet düzenlenmesi, ödeme işlemlerinin tamamlanması.
              </li>
              <li>
                <strong>Hukuki yükümlülüğün yerine getirilmesi (Md. 5/2-ç):</strong> Vergi
                mevzuatı kapsamında faturalama, havacılık mevzuatı kapsamında yolcu bildirimi,
                kamu kurum talepleri.
              </li>
              <li>
                <strong>Meşru menfaat (Md. 5/2-f):</strong> Sahtekarlık ve güvenlik ihlallerinin
                önlenmesi, site işlevselliğinin ve güvenliğinin sağlanması, istatistiksel
                analizler (anonim).
              </li>
              <li>
                <strong>Açık rıza (Md. 5/1):</strong> Ticari elektronik ileti gönderimi
                (e-posta/SMS kampanya bildirimleri); yalnızca onaylamanız hâlinde gerçekleşir
                ve her zaman geri alınabilir.
              </li>
            </ul>

            <h2>4. Kişisel Verilerin Aktarılması</h2>
            <p>
              Kişisel verileriniz KVKK Madde 8 ve 9 çerçevesinde, yalnızca aşağıdaki amaç ve
              taraflarla sınırlı olarak aktarılabilir:
            </p>
            <ul>
              <li>
                <strong>Havayolu şirketleri (yurt içi ve yurt dışı):</strong> Rezervasyonun
                tamamlanması, yolcu listelerinin oluşturulması ve havacılık mevzuatı
                yükümlülüklerinin yerine getirilmesi.
              </li>
              <li>
                <strong>BiletBank A.Ş. (IATA/GDS sağlayıcısı):</strong> Rezervasyon ve bilet
                düzenleme altyapısının işletilmesi.
              </li>
              <li>
                <strong>Ödeme kuruluşu (PCI-DSS uyumlu):</strong> Ödeme işleminin güvenli
                biçimde tamamlanması.
              </li>
              <li>
                <strong>Kamu kurumları ve mahkemeler:</strong> Yasal zorunluluk veya yargısal
                karar hâllerinde.
              </li>
            </ul>
            <p>
              Verileriniz hiçbir koşulda reklam amacıyla üçüncü taraflara satılmaz veya
              kiralanmaz. Yurt dışına aktarım, yalnızca uluslararası rezervasyon kapsamında
              ve KVKK'nın 9. maddesi güvenceleri çerçevesinde gerçekleşir.
            </p>

            <h2>5. Kişisel Verilerin Saklama Süreleri</h2>
            <p>
              Verileriniz aşağıdaki süreler boyunca saklanır; bu sürelerin sona ermesinin
              ardından güvenli biçimde silinir veya anonim hâle getirilir:
            </p>
            <ul>
              <li>Fatura ve ödeme kayıtları: Vergi mevzuatı (VUK) uyarınca <strong>5 yıl</strong>.</li>
              <li>Rezervasyon ve bilet kayıtları: Tüketici mevzuatı uyarınca <strong>3 yıl</strong>.</li>
              <li>Ticari yazışmalar ve destek kayıtları: Türk Ticaret Kanunu uyarınca <strong>10 yıl</strong>.</li>
              <li>
                Pazarlama verisi (onay hâlinde): Onayın geri alındığı tarih itibarıyla derhal
                silinir.
              </li>
            </ul>

            <h2>6. Veri Sahibinin Hakları (KVKK Madde 11)</h2>
            <p>
              Kişisel veri sahibi olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul>
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>
                Verilerin işlenme amacını ve bunların amaca uygun kullanılıp kullanılmadığını
                öğrenme,
              </li>
              <li>
                Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri
                öğrenme,
              </li>
              <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme,</li>
              <li>
                KVKK'nın 7. maddesi çerçevesinde verilerin silinmesini ya da yok edilmesini
                isteme,
              </li>
              <li>
                Düzeltme, silme veya yok etme işlemlerinin aktarılan üçüncü kişilere
                bildirilmesini isteme,
              </li>
              <li>
                İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi
                sonucunda aleyhinize bir sonucun ortaya çıkmasına itiraz etme,
              </li>
              <li>
                Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini
                talep etme.
              </li>
            </ul>

            <h2>7. Haklarınızı Nasıl Kullanırsınız?</h2>
            <p>
              Yukarıdaki haklarınızı kullanmak için aşağıdaki yollardan biriyle başvurabilirsiniz:
            </p>
            <ul>
              <li>
                <strong>E-posta:</strong>{" "}
                <a href="mailto:kvkk@atabilet.com">kvkk@atabilet.com</a> adresine "KVKK Başvurusu"
                konu başlığıyla e-posta gönderin.
              </li>
              <li>
                <strong>Online form:</strong>{" "}
                <a href="/iletisim">İletişim formunu</a> doldurarak iletebilirsiniz.
              </li>
            </ul>
            <p>
              Başvurularınız, kimliğinizin doğrulanmasının ardından <strong>en geç 30 gün</strong>{" "}
              içinde ücretsiz olarak yanıtlanır. Talebin aşırı tekrarlı veya açıkça
              dayanaksız olduğu hâllerde işlem ücreti alınabilir ya da başvuru reddedilebilir
              (KVKK Md. 13/4).
            </p>

            <h2>8. Veri Güvenliği</h2>
            <p>
              Kişisel verilerinizi yetkisiz erişim, kayıp veya ifşaya karşı korumak amacıyla
              aşağıdaki teknik ve idari tedbirler uygulanmaktadır:
            </p>
            <ul>
              <li>256-bit SSL/TLS şifreleme ile veri iletimi,</li>
              <li>PCI-DSS uyumlu ödeme altyapısı (kart verileri tarafımızca saklanmaz),</li>
              <li>Erişim kontrolü ve yetkilendirme yönetimi,</li>
              <li>Güvenlik duvarı ve saldırı tespit sistemleri,</li>
              <li>Düzenli güvenlik denetimleri ve güvenlik açığı taramaları,</li>
              <li>
                Olası veri ihlali hâlinde KVKK Madde 12/5 uyarınca 72 saat içinde Kurul'a
                ve etkilenen kişilere bildirim.
              </li>
            </ul>

            <h2>9. Çerezler</h2>
            <p>
              Sitemizde kullanılan çerezlere ilişkin ayrıntılı bilgi için{" "}
              <a href="/cerez-politikasi">Çerez Politikası</a> sayfamızı inceleyiniz.
            </p>

            <h2>10. Güncellemeler</h2>
            <p>
              Bu metin, KVKK mevzuatındaki değişiklikler veya işleme faaliyetlerindeki
              güncellemeler doğrultusunda revize edilebilir. Güncel metne her zaman bu
              sayfadan erişebilirsiniz.
            </p>

          </div>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
