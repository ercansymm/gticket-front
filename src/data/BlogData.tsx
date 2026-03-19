export interface BlogPost {
  id: number;
  slug: string;
  title_tr: string;
  title_en: string;
  summary_tr: string;
  summary_en: string;
  content_tr: string;
  content_en: string;
  thumb: string;
  tag_tr: string;
  tag_en: string;
  author: string;
  date: string;
  readTime: number;
  metaTitle_tr: string;
  metaTitle_en: string;
  metaDescription_tr: string;
  metaDescription_en: string;
  keywords_tr: string[];
  keywords_en: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "ucuz-ucak-bileti-almanin-10-yolu",
    title_tr: "Ucuz Uçak Bileti Almanın 10 Yolu",
    title_en: "10 Ways to Get Cheap Flight Tickets",
    summary_tr: "Uçak bileti fiyatlarını düşürmek için kullanabileceğiniz 10 etkili yöntem. Erken rezervasyon, esnek tarih ve daha fazlası.",
    summary_en: "10 effective methods to reduce flight ticket prices. Early booking, flexible dates and more.",
    content_tr: "<p>Uçak bileti alırken fiyatları düşürmek herkesin istediği bir şey...</p><h2>1. Erken Rezervasyon Yapın</h2><p>Uçuşunuzdan en az 3-4 hafta önce bilet almak genellikle daha uygun fiyatlar sunar...</p><h2>2. Esnek Tarihlerle Arayın</h2><p>Gidiş ve dönüş tarihlerinizi 1-2 gün kaydırmak ciddi fiyat farkı yaratabilir...</p><h2>3. Farklı Havalimanlarını Karşılaştırın</h2><p>İstanbul'da IST ve SAW, İzmir'de ADB gibi alternatif havalimanlarını kontrol edin...</p><h2>4. Hafta İçi Uçuşları Tercih Edin</h2><p>Salı ve Çarşamba günleri genellikle en uygun fiyatlı günlerdir...</p><h2>5. Fiyat Takibi Yapın</h2><p>AtaBilet üzerinden düzenli olarak fiyatları kontrol edin...</p>",
    content_en: "<p>Everyone wants to reduce flight ticket prices...</p><h2>1. Book Early</h2><p>Booking at least 3-4 weeks before your flight usually offers better prices...</p><h2>2. Search with Flexible Dates</h2><p>Shifting your departure and return dates by 1-2 days can make a significant price difference...</p>",
    thumb: "/assets/img/blog/blog-2/blog-1.jpg",
    tag_tr: "Tasarruf",
    tag_en: "Savings",
    author: "AtaBilet",
    date: "2026-03-10",
    readTime: 5,
    metaTitle_tr: "Ucuz Uçak Bileti Almanın 10 Yolu | AtaBilet Blog",
    metaTitle_en: "10 Ways to Get Cheap Flight Tickets | AtaBilet Blog",
    metaDescription_tr: "Uçak bileti fiyatlarını düşürmek için 10 etkili yöntem. Erken rezervasyon, esnek tarih, alternatif havalimanı ve daha fazlası.",
    metaDescription_en: "10 effective methods to reduce flight ticket prices.",
    keywords_tr: ["ucuz uçak bileti", "ucuz bilet", "uçak bileti tasarruf", "bilet fiyatları"],
    keywords_en: ["cheap flight tickets", "flight deals", "save on flights"],
  },
  {
    id: 2,
    slug: "2026-yurt-ici-populer-rotalar",
    title_tr: "2026'da En Popüler Yurt İçi Uçuş Rotaları",
    title_en: "Most Popular Domestic Flight Routes in 2026",
    summary_tr: "Türkiye'de en çok tercih edilen yurt içi uçuş rotaları ve ortalama bilet fiyatları.",
    summary_en: "Most preferred domestic flight routes in Turkey and average ticket prices.",
    content_tr: "<p>2026 yılında Türkiye'de en popüler yurt içi uçuş rotalarını sizler için derledik...</p><h2>İstanbul - Antalya</h2><p>Yılın en yoğun hattı olan İstanbul-Antalya rotası...</p><h2>İstanbul - İzmir</h2><p>İş ve tatil amaçlı en çok tercih edilen ikinci rota...</p><h2>Ankara - İstanbul</h2><p>Başkent ile İstanbul arası her mevsim yoğun...</p>",
    content_en: "<p>We compiled the most popular domestic flight routes in Turkey for 2026...</p><h2>Istanbul - Antalya</h2><p>The busiest route of the year...</p><h2>Istanbul - Izmir</h2><p>The second most preferred route for business and holiday...</p>",
    thumb: "/assets/img/blog/blog-2/blog-2.jpg",
    tag_tr: "Rotalar",
    tag_en: "Routes",
    author: "AtaBilet",
    date: "2026-03-05",
    readTime: 4,
    metaTitle_tr: "2026 En Popüler Yurt İçi Uçuş Rotaları | AtaBilet Blog",
    metaTitle_en: "Most Popular Domestic Flight Routes 2026 | AtaBilet Blog",
    metaDescription_tr: "2026'da Türkiye'de en çok uçulan yurt içi rotalar. İstanbul-Antalya, İstanbul-İzmir ve daha fazlası.",
    metaDescription_en: "Most flown domestic routes in Turkey in 2026.",
    keywords_tr: ["yurt içi uçuş", "popüler rotalar", "istanbul antalya uçak", "istanbul izmir uçak"],
    keywords_en: ["domestic flights turkey", "popular routes", "istanbul antalya flight"],
  },
  {
    id: 3,
    slug: "ucusta-bagaj-hakki-rehberi",
    title_tr: "Uçuşta Bagaj Hakkı Rehberi: Hangi Havayolu Ne Kadar?",
    title_en: "Flight Baggage Allowance Guide: How Much per Airline?",
    summary_tr: "THY, Pegasus, AnadoluJet ve SunExpress bagaj hakları karşılaştırması. Kabin ve kayıtlı bagaj detayları.",
    summary_en: "Baggage allowance comparison for THY, Pegasus, AnadoluJet and SunExpress.",
    content_tr: "<p>Uçak yolculuğunda en çok karışıklık yaratan konulardan biri bagaj hakları...</p><h2>Türk Hava Yolları (THY)</h2><p>Ekonomi: 23kg kayıtlı + 8kg kabin...</p><h2>Pegasus</h2><p>Temel paket: Sadece 8kg kabin. Ekstra bagaj ücretli...</p><h2>AnadoluJet</h2><p>THY ile benzer kurallar geçerlidir...</p><h2>SunExpress</h2><p>Paket tipine göre bagaj hakları değişmektedir...</p>",
    content_en: "<p>One of the most confusing topics in air travel is baggage allowance...</p><h2>Turkish Airlines (THY)</h2><p>Economy: 23kg checked + 8kg cabin...</p><h2>Pegasus</h2><p>Basic package: Only 8kg cabin. Extra baggage is paid...</p>",
    thumb: "/assets/img/blog/blog-2/blog-3.jpg",
    tag_tr: "Rehber",
    tag_en: "Guide",
    author: "AtaBilet",
    date: "2026-02-28",
    readTime: 6,
    metaTitle_tr: "Bagaj Hakkı Rehberi — THY, Pegasus, AnadoluJet | AtaBilet Blog",
    metaTitle_en: "Baggage Allowance Guide — THY, Pegasus, AnadoluJet | AtaBilet Blog",
    metaDescription_tr: "THY, Pegasus, AnadoluJet ve SunExpress bagaj hakları detaylı karşılaştırma. Kabin ve kayıtlı bagaj kuralları.",
    metaDescription_en: "Detailed baggage comparison for Turkish airlines.",
    keywords_tr: ["bagaj hakkı", "thy bagaj", "pegasus bagaj", "kabin bagaj"],
    keywords_en: ["baggage allowance", "turkish airlines baggage", "pegasus baggage"],
  },
  {
    id: 4,
    slug: "online-check-in-nasil-yapilir",
    title_tr: "Online Check-in Nasıl Yapılır? Adım Adım Rehber",
    title_en: "How to Do Online Check-in? Step by Step Guide",
    summary_tr: "Havalimanına gitmeden online check-in yaparak zaman kazanın. THY, Pegasus ve AnadoluJet için adım adım anlatım.",
    summary_en: "Save time by doing online check-in before going to the airport.",
    content_tr: "<p>Online check-in yaparak havalimanında kuyrukta beklemekten kurtulabilirsiniz...</p><h2>THY Online Check-in</h2><p>Uçuşunuzdan 24 saat önce thy.com üzerinden yapılabilir...</p><h2>Pegasus Online Check-in</h2><p>Uçuşunuzdan 24 saat ile 1 saat öncesine kadar yapılabilir...</p><h2>AnadoluJet Online Check-in</h2><p>THY altyapısını kullanan AnadoluJet için aynı kurallar geçerlidir...</p>",
    content_en: "<p>You can avoid waiting in line at the airport by doing online check-in...</p><h2>THY Online Check-in</h2><p>Available 24 hours before your flight via thy.com...</p><h2>Pegasus Online Check-in</h2><p>Available from 24 hours to 1 hour before the flight...</p>",
    thumb: "/assets/img/blog/grid/grid.jpg",
    tag_tr: "Rehber",
    tag_en: "Guide",
    author: "AtaBilet",
    date: "2026-02-20",
    readTime: 3,
    metaTitle_tr: "Online Check-in Nasıl Yapılır? | AtaBilet Blog",
    metaTitle_en: "How to Do Online Check-in? | AtaBilet Blog",
    metaDescription_tr: "THY, Pegasus ve AnadoluJet için online check-in rehberi. Adım adım anlatım.",
    metaDescription_en: "Online check-in guide for Turkish airlines.",
    keywords_tr: ["online check-in", "thy check-in", "pegasus check-in"],
    keywords_en: ["online check-in", "turkish airlines check-in"],
  },
  {
    id: 5,
    slug: "ucak-bileti-iptal-ve-iade-kosullari",
    title_tr: "Uçak Bileti İptal ve İade Koşulları 2026",
    title_en: "Flight Ticket Cancellation and Refund Conditions 2026",
    summary_tr: "Uçak biletinizi iptal etmek mi istiyorsunuz? Havayollarına göre iptal ve iade kuralları.",
    summary_en: "Want to cancel your flight ticket? Cancellation and refund rules by airline.",
    content_tr: "<p>Uçak bileti iptal ve iade koşulları havayoluna ve bilet tipine göre değişir...</p><h2>THY İptal ve İade</h2><p>Tam bilet sahipleri ücretsiz iptal yapabilir...</p><h2>Pegasus İptal ve İade</h2><p>Essentials paketinde iptal ücreti uygulanır...</p><h2>Genel Kurallar</h2><p>Uçuştan 2 saat öncesine kadar iptal yapılabilir...</p>",
    content_en: "<p>Flight ticket cancellation and refund conditions vary by airline and ticket type...</p><h2>THY Cancellation & Refund</h2><p>Full fare ticket holders can cancel for free...</p><h2>Pegasus Cancellation & Refund</h2><p>Cancellation fee applies for Essentials package...</p>",
    thumb: "/assets/img/blog/grid/grid-2.jpg",
    tag_tr: "Bilgi",
    tag_en: "Info",
    author: "AtaBilet",
    date: "2026-02-15",
    readTime: 4,
    metaTitle_tr: "Uçak Bileti İptal ve İade Koşulları | AtaBilet Blog",
    metaTitle_en: "Flight Cancellation and Refund Conditions | AtaBilet Blog",
    metaDescription_tr: "2026 yılı uçak bileti iptal ve iade koşulları. THY, Pegasus, AnadoluJet kuralları.",
    metaDescription_en: "2026 flight cancellation and refund rules.",
    keywords_tr: ["bilet iptal", "bilet iade", "uçak bileti iptal"],
    keywords_en: ["flight cancellation", "ticket refund"],
  },
  {
    id: 6,
    slug: "havalimaninda-bilmeniz-gerekenler",
    title_tr: "İlk Kez Uçacaklar İçin: Havalimanında Bilmeniz Gerekenler",
    title_en: "First Time Flying: What You Need to Know at the Airport",
    summary_tr: "İlk kez uçak yolculuğu yapacaklar için havalimanı süreçleri rehberi.",
    summary_en: "Airport process guide for first-time flyers.",
    content_tr: "<p>İlk kez uçak yolculuğu heyecan verici olabilir. İşte bilmeniz gerekenler...</p><h2>Havalimanına Ne Zaman Gidilmeli?</h2><p>Yurt içi uçuşlarda en az 1.5 saat, yurt dışında 2.5 saat öncesinde olun...</p><h2>Güvenlik Kontrolü</h2><p>Sıvılar 100ml'den küçük kaplarda, şeffaf poşette olmalı...</p><h2>Boarding</h2><p>Uçuşunuzun kalkış saatinden 30 dakika önce kapı başında olun...</p>",
    content_en: "<p>Flying for the first time can be exciting. Here's what you need to know...</p><h2>When to Arrive at the Airport?</h2><p>For domestic flights, be there at least 1.5 hours early...</p><h2>Security Check</h2><p>Liquids must be in containers smaller than 100ml in a clear bag...</p>",
    thumb: "/assets/img/blog/grid/grid-3.jpg",
    tag_tr: "Rehber",
    tag_en: "Guide",
    author: "AtaBilet",
    date: "2026-02-10",
    readTime: 5,
    metaTitle_tr: "İlk Kez Uçacaklar İçin Havalimanı Rehberi | AtaBilet Blog",
    metaTitle_en: "Airport Guide for First Time Flyers | AtaBilet Blog",
    metaDescription_tr: "İlk kez uçak yolculuğu yapacaklar için havalimanı süreçleri. Check-in, güvenlik, boarding.",
    metaDescription_en: "Airport guide for first-time flyers.",
    keywords_tr: ["ilk uçuş", "havalimanı rehberi", "uçak yolculuğu"],
    keywords_en: ["first flight", "airport guide"],
  },
];

// Eski format uyumluluğu — eski bileşenler kaldırılınca silinecek
interface DataType {
  id: number;
  page: string;
  thumb: string;
  tag?: string;
  title: string;
  date: string;
  time: string;
  desc: string;
}

const blog_data: DataType[] = [];

export default blog_data;