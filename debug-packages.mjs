const body = JSON.stringify({
  origin: 'IST',
  destination: 'ESB',
  departureDate: '2026-04-15',
  flightType: 'OW',
  flightClass: 'Economy',
  adultCount: 1,
  childCount: 0,
  infantCount: 0,
  directFlightsOnly: false,
  refundablesOnly: false,
  searchTimeoutMilliseconds: 0,
  searchReason: 'SearchAndBook',
});

const r = await fetch('http://37.148.212.253:5000/api/flight/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body,
});

const d = await r.json();
const fs = d.flights || [];

// Aynı flightNumber ile birden fazla sonuç var mı kontrol et
const grouped = {};
for (const f of fs) {
  const key = f.flightNumber + ' ' + f.departureTime;
  if (!grouped[key]) grouped[key] = [];
  grouped[key].push({
    productId: f.productId,
    flightNumber: f.flightNumber,
    departureTime: f.departureTime,
    bookingClass: f.bookingClass,
    bookingClassName: f.bookingClassName,
    fareType: f.fareType,
    totalFare: f.totalFare,
    cabinClassName: f.cabinClassName,
  });
}

for (const [key, flights] of Object.entries(grouped)) {
  if (flights.length > 1) {
    console.log(`\n=== ${key} — ${flights.length} fare class ===`);
    for (const ff of flights) {
      console.log(`  ${ff.bookingClassName} (${ff.fareType}) — ${ff.totalFare} TRY — ${ff.productId}`);
    }
  }
}

// Toplam uçuş sayısı ve unique uçuş sayısı
const uniqueFlights = Object.keys(grouped).length;
console.log(`\nToplam: ${fs.length} sonuç, ${uniqueFlights} benzersiz uçuş`);
if (uniqueFlights === fs.length) {
  console.log('Her uçuş farklı — paketler ayrı satır olarak GELMİYOR');
  console.log('\nİlk 5 uçuş:');
  for (const f of fs.slice(0, 5)) {
    console.log(`  ${f.flightNumber} ${f.departureTime} ${f.bookingClassName}(${f.fareType}) ${f.totalFare}TRY bfi:${f.brandedFareItems?.length} fp:${f.farePackages?.length}`);
  }
}
