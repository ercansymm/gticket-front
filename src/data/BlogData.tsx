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
      "Tips for finding tickets to Istanbul on any budget, the most affordable periods and important details to keep in mind.",
    content_tr:
      "<p>İstanbul, Türkiye'nin en hareketli şehri olarak yurt içi uçuşların büyük çoğunluğuna ev sahipliği yapar. Sabiha Gökçen ve İstanbul Havalimanı olmak üzere iki büyük havalimanıyla şehre ulaşım oldukça kolaydır.</p><p>Ucuz bilet bulmanın en önemli sırrı <strong>erken rezervasyon</strong> yapmaktır. Seyahat tarihinizden en az 3-4 hafta önce arama yaparsanız ciddi indirimlerle karşılaşabilirsiniz.</p><ul><li>Sabah erken saatlerde kalkan uçuşlar genellikle daha uygun fiyatlıdır</li><li>Hafta ortası seyahatleri hafta sonu seyahatlerine göre daha ucuzdur</li><li>İki havalimanını karşılaştırın — Sabiha Gökçen genellikle daha uygun fiyatlı olabilir</li><li>Tatil dönemlerini ve okul tatillerini kaçının</li><li>Fiyat alarmı kurun ve değişiklikleri takip edin</li><li>Ekstra bagaj ücreti ödemekten kaçınmak için el bagajıyla seyahat edin</li><li>AtaBilet gibi platformlarda birden fazla havayolunu karşılaştırın</li></ul>",
    content_en:
      "<p>Istanbul, Turkey's most vibrant city, hosts the majority of domestic flights. With two major airports — Istanbul Airport and Sabiha Gokcen — getting to the city is quite easy.</p><p>The most important secret to finding cheap tickets is <strong>early booking</strong>. If you search at least 3-4 weeks before your travel date, you can find significant discounts.</p><ul><li>Early morning flights are usually cheaper</li><li>Mid-week travel is cheaper than weekend travel</li><li>Compare both airports — Sabiha Gokcen can often be more affordable</li><li>Avoid holiday periods and school holidays</li><li>Set a price alert and track changes</li><li>Travel with carry-on only to avoid extra baggage fees</li><li>Compare multiple airlines on platforms like AtaBilet</li></ul>",
    thumb: "/assets/img/cities/istanbul.jpg",
    date: "2025-03-15",
    readTime: 5,
    tag_tr: "İpucu",
    tag_en: "Tips",
    author: "AtaBilet",
  },
  {
    id: 2,
    slug: "turkiye-ic-hat-destinasyonlari",
    title_tr: "Türkiye'de En Güzel 6 İç Hat Destinasyonu",
    title_en: "6 Most Beautiful Domestic Destinations in Turkey",
    summary_tr:
      "Uçakla keşfedebileceğiniz Türkiye'nin en büyüleyici şehirleri: tarihi dokusu, doğal güzellikleri ve lezzetleriyle öne çıkan destinasyonlar.",
    summary_en:
      "Turkey's most enchanting cities you can discover by air: destinations standing out with their historical texture, natural beauty and flavors.",
    content_tr:
      "<p>Türkiye, zengin tarihi ve coğrafi çeşitliliğiyle iç hat seyahatlerini oldukça değerli kılmaktadır. İşte uçakla keşfetmeniz gereken 6 harika destinasyon:</p><h3>1. Antalya</h3><p>Akdeniz'in incisi Antalya, tertemiz plajları, antik şehirleri ve lüks tatil köyleriyle yıl boyunca ziyaretçi çekmektedir.</p><h3>2. Trabzon</h3><p>Karadeniz'in eşsiz doğasına kapı açan Trabzon, Sümela Manastırı ve Uzungöl gibi nefes kesen noktalarıyla ünlüdür.</p><h3>3. Bodrum</h3><p>Ege'nin en gözde tatil destinasyonlarından Bodrum, beyaz evleri ve masmavi denizleriyle kartpostal gibi manzaralar sunar.</p><h3>4. İzmir</h3><p>Kozmopolit yapısıyla öne çıkan İzmir, Efes Antik Kenti ve Çeşme gibi cazibe merkezlerine yakınlığıyla ayrıca değer kazanır.</p><h3>5. Diyarbakır</h3><p>Tarihi sur duvarları ve geleneksel mimarisiyle Diyarbakır, Güneydoğu Anadolu'nun kültürel başkenti olarak öne çıkar.</p><h3>6. Ankara</h3><p>Türkiye'nin başkenti Ankara, Atatürk Mausoleum ve Anadolu Medeniyetleri Müzesi başta olmak üzere zengin kültürel mirası ile ziyaretçilerini büyüler.</p>",
    content_en:
      "<p>Turkey, with its rich history and geographical diversity, makes domestic travel quite valuable. Here are 6 wonderful destinations you should discover by air:</p><h3>1. Antalya</h3><p>The pearl of the Mediterranean, Antalya, attracts visitors year-round with its pristine beaches, ancient cities and luxury resorts.</p><h3>2. Trabzon</h3><p>Trabzon, which opens the door to the unique nature of the Black Sea, is famous for breathtaking spots like Sumela Monastery and Uzungol.</p><h3>3. Bodrum</h3><p>One of the Aegean's most popular holiday destinations, Bodrum offers postcard-like views with its white houses and crystal blue seas.</p><h3>4. Izmir</h3><p>Izmir, standing out with its cosmopolitan character, gains additional value with its proximity to attractions like Ephesus and Cesme.</p><h3>5. Diyarbakir</h3><p>With its historic city walls and traditional architecture, Diyarbakir stands out as the cultural capital of Southeastern Anatolia.</p><h3>6. Ankara</h3><p>Turkey's capital Ankara captivates visitors with its rich cultural heritage, especially Ataturk's Mausoleum and the Museum of Anatolian Civilizations.</p>",
    thumb: "/assets/img/destination/des.jpg",
    date: "2025-03-22",
    readTime: 7,
    tag_tr: "Destinasyon",
    tag_en: "Destination",
    author: "AtaBilet",
  },
  {
    id: 3,
    slug: "ucak-bileti-ne-zaman-alinir",
    title_tr: "Uçak Bileti En Ucuz Ne Zaman Alınır?",
    title_en: "When Is the Best Time to Buy Cheap Plane Tickets?",
    summary_tr:
      "Uçak bileti fiyatları neden değişir ve en uygun fiyatı yakalamak için hangi gün ve saatlerde arama yapmalısınız?",
    summary_en:
      "Why do flight prices change and on which days and times should you search to get the best price?",
    content_tr:
      "<p>Uçak bileti fiyatları dinamik bir yapıya sahip olup talep, kapasite ve sezona göre sürekli değişim gösterir. İşte en uygun fiyatı yakalamanız için bilmeniz gerekenler:</p><h3>En Uygun Gün ve Saatler</h3><p>Araştırmalar, salı ve çarşamba günleri yapılan aramaların daha uygun fiyatlar sunduğunu göstermektedir. Sabah erken saatler (05:00-07:00) ve gece geç saatler (22:00-24:00) bilet aramak için idealdir.</p><h3>Ne Kadar Önceden Alınmalı?</h3><p>Yurt içi uçuşlar için ideal süre <strong>3-6 hafta öncesi</strong>dir. Çok erken veya çok geç kalmak genellikle pahalıya mal olur. Özellikle yaz sezonunda veya bayram dönemlerinde bu süreyi 8-12 haftaya çıkarmak faydalı olabilir.</p><h3>Kaçınılması Gereken Dönemler</h3><ul><li>Ramazan Bayramı ve Kurban Bayramı tatilleri</li><li>Temmuz-Ağustos yaz sezonu piki</li><li>Yılbaşı ve yeni yıl tatili</li><li>Ulusal bayramlar (23 Nisan, 19 Mayıs, 30 Ağustos)</li></ul>",
    content_en:
      "<p>Airline ticket prices have a dynamic structure and constantly change according to demand, capacity and season. Here's what you need to know to catch the best price:</p><h3>Best Days and Times</h3><p>Research shows that searches done on Tuesdays and Wednesdays offer better prices. Early morning hours (05:00-07:00) and late night hours (22:00-24:00) are ideal for ticket searches.</p><h3>How Far in Advance Should You Buy?</h3><p>The ideal time for domestic flights is <strong>3-6 weeks in advance</strong>. Booking too early or too late usually costs more. Especially for summer season or public holidays, it may be beneficial to extend this to 8-12 weeks.</p><h3>Periods to Avoid</h3><ul><li>Eid al-Fitr and Eid al-Adha holidays</li><li>July-August summer season peak</li><li>New Year's holiday</li><li>National holidays (April 23, May 19, August 30)</li></ul>",
    thumb: "/assets/img/about/about-2.jpg",
    date: "2025-04-01",
    readTime: 4,
    tag_tr: "Rehber",
    tag_en: "Guide",
    author: "AtaBilet",
  },
  {
    id: 4,
    slug: "el-bagaji-kural-rehberi",
    title_tr: "El Bagajı Kuralları: Havayoluna Göre Ölçüler ve Ücretler",
    title_en: "Carry-On Baggage Rules: Dimensions and Fees by Airline",
    summary_tr:
      "Türk Hava Yolları, Pegasus ve diğer havayollarının el bagajı kuralları, izin verilen boyutlar ve fazla bagaj ücretleri hakkında kapsamlı rehber.",
    summary_en:
      "Comprehensive guide on carry-on baggage rules, allowed dimensions and excess baggage fees for Turkish Airlines, Pegasus and other airlines.",
    content_tr:
      "<p>Uçuş öncesinde en çok merak edilen konulardan biri el bagajı kurallarıdır. Her havayolunun kendine özgü boyut ve ağırlık kısıtlamaları bulunmaktadır.</p><h3>Türk Hava Yolları</h3><p>Business Class: 2 parça × 8 kg | Economy Class: 1 parça × 8 kg. Boyut sınırı: 55 × 40 × 23 cm.</p><h3>Pegasus Havayolları</h3><p>Standart koltuk: 1 parça × 8 kg (55 × 40 × 20 cm). Smart ve Essentials bilet sahipleri kişisel eşya hakkı da kullanabilir.</p><h3>AnadoluJet</h3><p>1 parça × 8 kg, maksimum 55 × 40 × 20 cm boyutunda.</p><h3>İpuçları</h3><ul><li>Bagaj terazisi alarak valizinizi önceden tartın</li><li>Sıvı maddeler 100 ml'den az olmalı ve şeffaf torbada taşınmalı</li><li>Yanıcı veya kesici aletler kabin bagajına alınamaz</li><li>Bagaj boyutunu ölçtüren test kutularına dikkat edin</li></ul>",
    content_en:
      "<p>One of the most frequently asked questions before a flight is carry-on baggage rules. Each airline has its own size and weight restrictions.</p><h3>Turkish Airlines</h3><p>Business Class: 2 pieces × 8 kg | Economy Class: 1 piece × 8 kg. Size limit: 55 × 40 × 23 cm.</p><h3>Pegasus Airlines</h3><p>Standard seat: 1 piece × 8 kg (55 × 40 × 20 cm). Smart and Essentials ticket holders can also use personal item allowance.</p><h3>AnadoluJet</h3><p>1 piece × 8 kg, maximum 55 × 40 × 20 cm dimensions.</p><h3>Tips</h3><ul><li>Buy a luggage scale and weigh your bag in advance</li><li>Liquids must be less than 100 ml and carried in a transparent bag</li><li>Flammable or sharp objects cannot be taken in cabin baggage</li><li>Watch out for size test boxes at the gate</li></ul>",
    thumb: "/assets/img/chose/chose.jpg",
    date: "2025-04-10",
    readTime: 6,
    tag_tr: "Pratik Bilgi",
    tag_en: "Practical Info",
    author: "AtaBilet",
  },
  {
    id: 5,
    slug: "trabzon-seyahat-rehberi",
    title_tr: "Trabzon Seyahat Rehberi: Uçakla Gitmeden Önce Bilinmesi Gerekenler",
    title_en: "Trabzon Travel Guide: What You Need to Know Before Flying",
    summary_tr:
      "Karadeniz'in incisi Trabzon'a uçuş bilgileri, havalimanı transferleri, gezilmesi gereken yerler ve yerel lezzetler hakkında eksiksiz rehber.",
    summary_en:
      "Complete guide about flights to Trabzon, the pearl of the Black Sea, airport transfers, must-see places and local delicacies.",
    content_tr:
      "<p>Trabzon, Karadeniz kıyısında yer alan tarihi ve doğal güzellikleriyle büyüleyen bir şehirdir. Türkiye'nin önde gelen destinasyonları arasında yer alan Trabzon'a İstanbul, Ankara ve İzmir başta olmak üzere birçok şehirden doğrudan uçuş bulunmaktadır.</p><h3>Trabzon Havalimanı</h3><p>Şehir merkezine yaklaşık 6 km uzaklıkta yer alan Trabzon Havalimanı, oldukça küçük ve kullanışlı bir yapıya sahiptir. Havalimanından şehir merkezine ulaşım için otobüs ve taksi seçenekleri mevcuttur.</p><h3>Gezilecek Yerler</h3><ul><li><strong>Sümela Manastırı:</strong> Kayalıklara oyulmuş bu tarihi manastır Trabzon'un simgesidir</li><li><strong>Uzungöl:</strong> Muhteşem manzarasıyla ünlü yüksek rakımlı göl</li><li><strong>Atatürk Köşkü:</strong> Tarihi köşk ve bahçesi</li><li><strong>Trabzon Kalesi:</strong> Şehri gözetleyen tarihi kale</li></ul><h3>Yerel Lezzetler</h3><p>Mısır ekmeği, hamsi, kuymak ve Trabzon tereyağı mutlaka tatmanız gereken yerel lezzetler arasındadır.</p>",
    content_en:
      "<p>Trabzon is a city on the Black Sea coast, captivating with its historical and natural beauty. One of Turkey's leading destinations, Trabzon has direct flights from many cities, especially Istanbul, Ankara and Izmir.</p><h3>Trabzon Airport</h3><p>Located approximately 6 km from the city center, Trabzon Airport has quite a small and practical structure. Bus and taxi options are available for transportation from the airport to the city center.</p><h3>Places to Visit</h3><ul><li><strong>Sumela Monastery:</strong> This historic monastery carved into the rocks is Trabzon's symbol</li><li><strong>Uzungol:</strong> High-altitude lake famous for its magnificent views</li><li><strong>Ataturk Pavilion:</strong> Historic pavilion and garden</li><li><strong>Trabzon Castle:</strong> Historic castle overlooking the city</li></ul><h3>Local Delicacies</h3><p>Corn bread, anchovies, kuymak and Trabzon butter are among the local delicacies you must try.</p>",
    thumb: "/assets/img/cities/trabzon.jpg",
    date: "2025-04-18",
    readTime: 8,
    tag_tr: "Seyahat",
    tag_en: "Travel",
    author: "AtaBilet",
  },
  {
    id: 6,
    slug: "antalya-ucus-rehberi",
    title_tr: "Antalya Uçuş Rehberi: Sezonsuz En Ucuz Bilet Nasıl Bulunur?",
    title_en: "Antalya Flight Guide: How to Find the Cheapest Ticket Year-Round?",
    summary_tr:
      "Türkiye'nin güneş başkenti Antalya'ya her dönem uygun fiyatlı uçuş bulmanın yolları, sezon dışı seyahat avantajları ve önerilen rotalar.",
    summary_en:
      "Ways to find affordable flights to Antalya, Turkey's sunshine capital, year-round, advantages of off-season travel and recommended routes.",
    content_tr:
      "<p>Antalya, Türkiye'nin en çok ziyaret edilen tatil destinasyonu olarak uçuş frekansı en yüksek şehirler arasındadır. Bu yoğun talep beraberinde uygun fiyatlı bilet fırsatlarını da getirmektedir.</p><h3>Sezon Dışı Seyahat Avantajları</h3><p>Ekim-Nisan arası dönem, Antalya'ya seyahat etmek için hem daha uygun fiyatlı hem de daha az kalabalık bir deneyim sunar. Özellikle kasım-şubat aylarında otel ve uçuş fiyatları büyük ölçüde düşer.</p><h3>Antalya Havalimanı</h3><p>Türkiye'nin üçüncü büyük havalimanı olan Antalya Havalimanı, Terminal 1 ve Terminal 2 olmak üzere iki terminale sahiptir. Havalimanından şehir merkezine tramvay ve taksi ile ulaşmak mümkündür.</p><h3>Uygun Rotalar</h3><ul><li>İstanbul - Antalya: Günde onlarca sefer, 1 saat 20 dakika</li><li>Ankara - Antalya: Günde birkaç sefer, 1 saat 10 dakika</li><li>İzmir - Antalya: Sınırlı sefer ama uygun fiyatlı</li></ul>",
    content_en:
      "<p>Antalya is Turkey's most visited holiday destination and is among the cities with the highest flight frequency. This high demand also brings affordable ticket opportunities.</p><h3>Off-Season Travel Advantages</h3><p>The October-April period offers both a more affordable and less crowded experience for traveling to Antalya. Especially in November-February, hotel and flight prices drop significantly.</p><h3>Antalya Airport</h3><p>Antalya Airport, Turkey's third largest airport, has two terminals: Terminal 1 and Terminal 2. It is possible to reach the city center from the airport by tram and taxi.</p><h3>Affordable Routes</h3><ul><li>Istanbul - Antalya: Dozens of flights per day, 1 hour 20 minutes</li><li>Ankara - Antalya: Several flights per day, 1 hour 10 minutes</li><li>Izmir - Antalya: Limited but affordable flights</li></ul>",
    thumb: "/assets/img/cities/antalya.jpg",
    date: "2025-04-25",
    readTime: 5,
    tag_tr: "Tatil",
    tag_en: "Holiday",
    author: "AtaBilet",
  },
];
