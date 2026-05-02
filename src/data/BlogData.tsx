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
  date: string;
  readTime: number;
  tag_tr: string;
  tag_en: string;
  author: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "istanbul-ucuz-ucak-bileti-rehberi",
    title_tr: "İstanbul'a Ucuz Uçak Bileti Bulmanın 7 Yolu",
    title_en: "7 Ways to Find Cheap Flights to Istanbul",
    summary_tr:
      "Türkiye'nin kalbi İstanbul'a her bütçeye uygun bilet bulmanın püf noktaları, en uygun fiyatlı dönemler ve dikkat edilmesi gereken detaylar.",
    summary_en:
      "Tips to find affordable flights to Istanbul for every budget, best booking periods and important details.",
    content_tr: `
      <h2>İstanbul'a Ucuz Uçak Bileti Bulmak Mümkün mü?</h2>
      <p>İstanbul, Türkiye'nin en büyük havacılık merkezi olarak yüzlerce iç ve dış hat seferine ev sahipliği yapıyor. Bu yoğun rekabet ortamı, doğru stratejiyle uygun fiyatlı bilet bulmayı kolaylaştırıyor.</p>
      <h2>1. Erken Rezervasyon Yapın</h2>
      <p>Uçuş tarihinizden en az 30-45 gün öncesinde rezervasyon yapmak, genellikle %15-30 daha ucuz fiyat anlamına gelir. Özellikle uzun tatil dönemleri için erken hareket edin.</p>
      <h2>2. Esnek Tarihler Kullanın</h2>
      <p>Uçuş tarihinizde 1-2 gün esnekliğiniz varsa, gün bazlı fiyat karşılaştırması yaparak önemli tasarruf sağlayabilirsiniz. Salı ve Çarşamba günleri genellikle daha uygun olur.</p>
      <h2>3. Sabah Erken Uçuşları Tercih Edin</h2>
      <p>İlk seferler hem daha az yolcu hem de genellikle daha uygun fiyat sunar. Gecikme riski de diğer seatlere göre daha düşüktür.</p>
      <h2>4. Bagaj Politikasını Kontrol Edin</h2>
      <p>Düşük fiyatlı biletlerde ücretsiz bagaj hakkı olmayabilir. Toplam maliyeti hesaplarken bagaj ücretini de göz önünde bulundurun.</p>
      <h2>5. Fiyat Alarmı Kurun</h2>
      <p>AtaBilet üzerinden arama yaptıktan sonra fiyatları düzenli takip ederek ani indirimleri yakalayabilirsiniz.</p>
    `,
    content_en: `
      <h2>Is It Possible to Find Cheap Flights to Istanbul?</h2>
      <p>Istanbul, as Turkey's largest aviation hub, hosts hundreds of domestic and international flights. This competitive environment makes it easier to find affordable tickets with the right strategy.</p>
      <h2>1. Book Early</h2>
      <p>Booking at least 30-45 days before your flight date usually means 15-30% cheaper prices. Especially for long holiday periods, act early.</p>
      <h2>2. Use Flexible Dates</h2>
      <p>If you have 1-2 days of flexibility in your travel dates, you can save significantly by comparing day-by-day prices. Tuesdays and Wednesdays are usually cheaper.</p>
      <h2>3. Choose Early Morning Flights</h2>
      <p>First departures have fewer passengers and generally lower prices. The risk of delays is also lower compared to later flights.</p>
      <h2>4. Check Baggage Policy</h2>
      <p>Low-cost tickets may not include free baggage. Consider baggage fees when calculating total cost.</p>
      <h2>5. Set Price Alerts</h2>
      <p>After searching on AtaBilet, you can catch sudden discounts by tracking prices regularly.</p>
    `,
    thumb: "/assets/img/cities/istanbul.jpg",
    date: "2025-04-15",
    readTime: 5,
    tag_tr: "İpuçları",
    tag_en: "Tips",
    author: "AtaBilet Editörü",
  },
  {
    id: 2,
    slug: "antalya-ne-zaman-gidilir",
    title_tr: "Antalya'ya Ne Zaman Gidilmeli? Sezon Rehberi",
    title_en: "When to Visit Antalya? A Seasonal Guide",
    summary_tr:
      "Antalya tatil planlarken bilet fiyatlarının en uygun olduğu dönemler, hava koşulları ve önerilen uçuş rotaları.",
    summary_en:
      "Best periods for affordable flights to Antalya, weather conditions and recommended flight routes.",
    content_tr: `
      <h2>Antalya: Her Sezon Farklı Bir Güzellik</h2>
      <p>Türkiye'nin tatil başkenti Antalya, yılın büyük bölümünde güzel hava koşulları sunar. Ancak bilet fiyatları sezona göre önemli ölçüde değişiklik gösterir.</p>
      <h2>Yüksek Sezon (Haziran – Ağustos)</h2>
      <p>Deniz suyu en sıcak, güneş en parlak; ancak fiyatlar da en yüksek seviyede. Bu dönemde bilet almak istiyorsanız en az 2-3 ay öncesinden planlama yapın.</p>
      <h2>Omuz Sezon (Nisan – Mayıs ve Eylül – Ekim)</h2>
      <p>En ideal dönem: hava hâlâ güzel, kalabalık daha az, fiyatlar çok daha uygun. Mayıs ve Ekim özellikle değerli.</p>
      <h2>Düşük Sezon (Kasım – Mart)</h2>
      <p>Kış aylarında denize girmek mümkün olmasa da tarihi yerleri keşfetmek için mükemmel. Bilet fiyatları yıl içindeki en düşük seviyede.</p>
      <h2>En Uygun Rotalar</h2>
      <p>İstanbul, Ankara ve İzmir'den Antalya'ya doğrudan sefer bulunmaktadır. AtaBilet üzerinden tüm havayollarını karşılaştırarak en uygun seçeneği bulabilirsiniz.</p>
    `,
    content_en: `
      <h2>Antalya: A Different Beauty Each Season</h2>
      <p>Turkey's holiday capital Antalya offers beautiful weather conditions for most of the year. However, ticket prices vary significantly by season.</p>
      <h2>High Season (June – August)</h2>
      <p>Sea water at its warmest, sun at its brightest, but prices are highest. If you want tickets during this period, plan at least 2-3 months in advance.</p>
      <h2>Shoulder Season (April – May and September – October)</h2>
      <p>The ideal period: weather still nice, fewer crowds, prices much more affordable. May and October are especially valuable.</p>
      <h2>Low Season (November – March)</h2>
      <p>While swimming isn't possible in winter, it's perfect for exploring historic sites. Ticket prices are at their lowest of the year.</p>
      <h2>Best Routes</h2>
      <p>Direct flights to Antalya are available from Istanbul, Ankara and Izmir. Compare all airlines on AtaBilet to find the best option.</p>
    `,
    thumb: "/assets/img/cities/antalya.jpg",
    date: "2025-04-08",
    readTime: 4,
    tag_tr: "Rehber",
    tag_en: "Guide",
    author: "AtaBilet Editörü",
  },
  {
    id: 3,
    slug: "turkiye-ic-hat-destinasyonlari",
    title_tr: "İç Hatla Keşfedebileceğiniz 5 Türkiye Destinasyonu",
    title_en: "5 Turkish Destinations Worth Discovering by Domestic Flight",
    summary_tr:
      "Bodrum'dan Trabzon'a, İzmir'den Kapadokya'ya — iç hat uçuşlarla kolayca ulaşabileceğiniz en güzel Türkiye şehirleri.",
    summary_en:
      "From Bodrum to Trabzon, Izmir to Cappadocia — the best Turkish cities reachable by domestic flight.",
    content_tr: `
      <h2>Türkiye'yi İç Hat Uçuşlarıyla Keşfedin</h2>
      <p>Türkiye, dünyanın en zengin coğrafi çeşitliliğine sahip ülkelerinden biri. İç hat uçuşlarının yaygınlaşmasıyla bu güzelliklere ulaşmak artık çok daha kolay.</p>
      <h2>1. Bodrum – Ege'nin İncisi</h2>
      <p>Yaz aylarında Türkiye'nin en gözde tatil destinasyonu. Bodrum Milas Havalimanı üzerinden İstanbul ve Ankara'dan doğrudan uçuş seçenekleri mevcut.</p>
      <h2>2. Trabzon – Karadeniz'in Kalbi</h2>
      <p>Sümela Manastırı, Uzungöl ve eşsiz doğasıyla Trabzon her mevsim ziyaret edilebilecek bir şehir. İstanbul'dan yaklaşık 1 saatlik bir uçuş mesafesinde.</p>
      <h2>3. İzmir – Ege'nin Modernliği</h2>
      <p>Kordon'da yürüyüş, Kemeraltı'nda alışveriş ve Efes antik kenti turu için ideal. Türkiye'nin üçüncü büyük havalimanına sahip şehir.</p>
      <h2>4. Ankara – Tarihin Merkezi</h2>
      <p>Anıtkabir, Anadolu Medeniyetleri Müzesi ve lezzetli Ankara mutfağı. Başkentimizi keşfetmek için en güzel dönem ilkbahar ve sonbahar.</p>
      <h2>5. Antalya – Antik Sahiller</h2>
      <p>Phaselis, Perge, Aspendos gibi antik kentlerle çevrili eşsiz bir sahil şehri. Hem kültür hem deniz tatilini tek seyahatte yaşayabilirsiniz.</p>
    `,
    content_en: `
      <h2>Discover Turkey with Domestic Flights</h2>
      <p>Turkey is one of the countries with the richest geographical diversity in the world. With the spread of domestic flights, reaching these beauties has become much easier.</p>
      <h2>1. Bodrum – Pearl of the Aegean</h2>
      <p>Turkey's most popular holiday destination in summer. Direct flight options are available from Istanbul and Ankara via Bodrum Milas Airport.</p>
      <h2>2. Trabzon – Heart of the Black Sea</h2>
      <p>Trabzon with Sumela Monastery, Uzungol and unique nature can be visited in any season. About 1 hour flight from Istanbul.</p>
      <h2>3. Izmir – Modernity of the Aegean</h2>
      <p>Ideal for walking on the Kordon promenade, shopping in Kemeraltı and touring the ancient city of Ephesus. City with Turkey's third largest airport.</p>
      <h2>4. Ankara – Center of History</h2>
      <p>Anitkabir, Museum of Anatolian Civilizations and delicious Ankara cuisine. Spring and autumn are the best periods to discover our capital.</p>
      <h2>5. Antalya – Ancient Shores</h2>
      <p>A unique coastal city surrounded by ancient cities like Phaselis, Perge, Aspendos. You can experience both culture and beach holiday in one trip.</p>
    `,
    thumb: "/assets/img/cities/bodrum.jpg",
    date: "2025-03-28",
    readTime: 6,
    tag_tr: "Destinasyon",
    tag_en: "Destination",
    author: "AtaBilet Editörü",
  },
];
