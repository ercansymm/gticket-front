export interface FaqItem {
  id: number;
  category: "booking" | "payment" | "baggage" | "cancel" | "flight";
  title: string;
  desc: string;
}

const faq_data: FaqItem[] = [
  // ── Bilet & Rezervasyon ──────────────────────────────
  {
    id: 1,
    category: "booking",
    title: "Uçak bileti nasıl satın alabilirim?",
    desc: "AtaBilet ana sayfasında kalkış ve varış noktanızı, tarih ve yolcu sayısını girerek arama yapın. Listelenen uçuşlar arasından size uygun olanı seçin, yolcu bilgilerini doldurun ve güvenli ödeme adımını tamamlayın. Biletiniz anında e-posta adresinize gönderilir.",
  },
  {
    id: 2,
    category: "booking",
    title: "PNR kodu nedir, nasıl öğrenebilirim?",
    desc: "PNR (Passenger Name Record), rezervasyonunuza ait benzersiz bir referans kodudur. Satın alma işleminizin ardından e-posta ile gönderilen onay mesajında ve uygulamamızdaki 'Rezervasyonlarım' bölümünde yer alır. Bu kod ile bilet sorgulama sayfamızdan bilgilerinize ulaşabilirsiniz.",
  },
  {
    id: 3,
    category: "booking",
    title: "Bileti kaç gün önceden satın almalıyım?",
    desc: "Uçak biletleri genellikle kalkıştan 11 ay öncesinden satışa çıkar. Erken rezervasyon yapmanız durumunda daha uygun fiyatlarla bilet bulma ihtimaliniz artar. Yoğun seyahat dönemlerinde (tatil, bayram) en az 4-6 hafta öncesinden rezervasyon yaptırmanızı öneririz.",
  },
  {
    id: 4,
    category: "booking",
    title: "Grup bileti satın alabilir miyim?",
    desc: "10 ve üzeri yolcu için grup rezervasyonu talebinde bulunabilirsiniz. Grup biletleri özel fiyatlandırma ve esnek koşullar sunabilir. Destek hattımızı arayarak veya iletişim formumuzu doldurarak grup teklifi alabilirsiniz.",
  },
  {
    id: 5,
    category: "booking",
    title: "Satın aldığım bileti başkasına devredebilir miyim?",
    desc: "Bilet devri havayolunun kurallarına bağlıdır. Çoğu havayolu bilet devrini kabul etmez; ancak bazıları ücret karşılığında isim değişikliğine olanak tanır. İsim değişikliği talebiniz için destek ekibimizle iletişime geçebilirsiniz.",
  },

  // ── Ödeme ────────────────────────────────────────────
  {
    id: 6,
    category: "payment",
    title: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
    desc: "Visa, Mastercard ve American Express markalı kredi ve banka kartları ile ödeme yapabilirsiniz. Tüm ödemeler 3D Secure altyapısı ile güvence altında gerçekleştirilmektedir.",
  },
  {
    id: 7,
    category: "payment",
    title: "3D Secure nedir, neden gerekli?",
    desc: "3D Secure, online kart ödemelerinde bankanız tarafından uygulanan ek bir kimlik doğrulama katmanıdır. Ödeme sırasında telefonunuza gelen tek kullanımlık şifre (OTP) ile işleminizi onaylamanız istenir. Bu yöntem kartınızın yetkisiz kullanımını önler.",
  },
  {
    id: 8,
    category: "payment",
    title: "Ödeme işlemim başarısız oldu, ne yapmalıyım?",
    desc: "Ödeme başarısız olduğunda kart bakiyenizin ve bilgilerinizin doğruluğunu kontrol edin. Sorun devam ediyorsa bankanızın internet limitini veya 3D Secure durumunu kontrol edin. Birden fazla başarısız denemeden sonra bankanız kartı geçici olarak kısıtlayabilir; bu durumda bankanızı arayın ya da destek hattımızla iletişime geçin.",
  },
  {
    id: 9,
    category: "payment",
    title: "Ücretlendirme ne zaman yapılır?",
    desc: "Ödeme işlemi, rezervasyon onaylandığı anda kartınızdan tahsil edilir. Ön provizyon alınmaz; işlem tek seferde gerçekleşir. Fatura bilgilerinize e-posta ile gönderilen onay mesajından ulaşabilirsiniz.",
  },

  // ── Bagaj ────────────────────────────────────────────
  {
    id: 10,
    category: "baggage",
    title: "Ücretsiz bagaj hakkım ne kadar?",
    desc: "Bagaj hakkı, seçtiğiniz havayolu ve tarife türüne göre değişir. Ekonomi sınıfında genellikle 15–23 kg, business sınıfında 30–32 kg ücretsiz bagaj hakkı tanınır. Biletinize ait detayları rezervasyon onay e-postanızda veya 'Biletimi Sorgula' sayfasında bulabilirsiniz.",
  },
  {
    id: 11,
    category: "baggage",
    title: "El bagajı için kurallar nelerdir?",
    desc: "El bagajı genellikle 8 kg ağırlık ve 55×40×20 cm boyut sınırına tabidir. Sıvı maddeler 100 ml'yi geçmemeli ve şeffaf poşet içinde taşınmalıdır. Havayoluna göre farklılık gösterebileceğinden havayolunuzun web sitesini incelemenizi öneririz.",
  },
  {
    id: 12,
    category: "baggage",
    title: "Fazla bagaj nasıl eklerim?",
    desc: "Rezervasyon sonrasında destek ekibimize başvurarak ek bagaj hakkı satın alabilirsiniz. Havalimanında satın alınan fazla bagaj genellikle daha pahalıya gelir, bu nedenle önceden işlem yaptırmanızı öneririz.",
  },
  {
    id: 13,
    category: "baggage",
    title: "Bagajım kayboldu veya hasar gördü, ne yapmalıyım?",
    desc: "Bagaj kayıp ya da hasarını öncelikle havalimanındaki havayolu kontuarına bildirin ve PIR (Property Irregularity Report) belgesi alın. Akabinde destek ekibimize başvurarak süreci birlikte yönetebiliriz. Havayolunun hasar tazminatı genellikle 21 gün içinde sonuçlandırılır.",
  },

  // ── İptal & Değişiklik ───────────────────────────────
  {
    id: 14,
    category: "cancel",
    title: "Biletimi iptal edebilir miyim?",
    desc: "İptal koşulları satın aldığınız tarife türüne bağlıdır. Esnek tarifeler ücretsiz veya düşük ücretli iptale olanak tanırken, promosyon tarifeleri genellikle iade edilmez. Bilet iptal talebi için 'Biletimi Sorgula' sayfasından PNR'ınızla giriş yaparak destek talebi oluşturabilirsiniz.",
  },
  {
    id: 15,
    category: "cancel",
    title: "İptal durumunda para iademi ne zaman alırım?",
    desc: "İade süresi havayoluna ve bankanıza bağlı olarak 7–30 iş günü arasında değişir. İşlem başlatıldıktan sonra durum takibini destek taleplerim bölümünden yapabilirsiniz.",
  },
  {
    id: 16,
    category: "cancel",
    title: "Uçuş tarihimi veya saatimi değiştirebilir miyim?",
    desc: "Tarih/saat değişikliği, biletinizin tarife kurallarına ve havayolunun müsaitliğine bağlıdır. Değişiklik talebinizi bilet kalkışından en az 24 saat önce iletmeniz gerekmektedir. Destek talebi oluşturarak en kısa sürede size dönüş yapıyoruz.",
  },
  {
    id: 17,
    category: "cancel",
    title: "Havayolu uçuşumu iptal ederse ne olur?",
    desc: "Havayolunun uçuşu iptal etmesi durumunda alternatif uçuş seçeneği veya tam iade hakkınız doğar. Bildirim genellikle e-posta veya SMS ile yapılır. Destek ekibimize başvurarak süreçte size yardımcı olabiliriz.",
  },

  // ── Uçuş Bilgisi ─────────────────────────────────────
  {
    id: 18,
    category: "flight",
    title: "Online check-in nasıl yapılır?",
    desc: "Online check-in, kalkıştan genellikle 24–48 saat önce havayolunun web sitesi veya mobil uygulaması üzerinden yapılabilir. PNR kodunuz ve soyadınızla giriş yaparak koltuğunuzu seçip biniş kartınızı alabilirsiniz.",
  },
  {
    id: 19,
    category: "flight",
    title: "Havalimanına ne zaman gitmeliyim?",
    desc: "Yurt içi uçuşlar için en az 1,5–2 saat, uluslararası uçuşlar için en az 3 saat önce havalimanında olmanız önerilir. Yoğun tatil ve bayram dönemlerinde bu süreyi artırmanızı tavsiye ederiz.",
  },
  {
    id: 20,
    category: "flight",
    title: "Çocuklarla seyahatte özel düzenlemeler var mı?",
    desc: "2 yaşından küçük bebekler genellikle kucakta ve düşük ücretle seyahat edebilir. 2–12 yaş arası çocuklar için çocuk tarifesi uygulanır. 'Refakatsiz küçük' hizmeti bazı havayollarında ücretli sunulmaktadır. Arama sırasında doğru yolcu türünü seçmeniz önemlidir.",
  },
  {
    id: 21,
    category: "flight",
    title: "Transit uçuşta bagajımı teslim almam gerekiyor mu?",
    desc: "Bağlantılı uçuşlarda bagajınız son varış noktanıza direkt olarak yüklenebilir ya da transit havalimanında teslim almanız gerekebilir. Bu durum havayoluna ve bağlantı noktasına göre değişir. Biletinizi satın alırken ya da check-in sırasında havayolu personeliyle teyit etmenizi öneririz.",
  },
];

export default faq_data;
