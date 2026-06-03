import { useEffect, useRef, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "../../../context/LanguageContext";
import { getPopularRoutes, type PopularRouteDto } from "../../../api/lookup";
import { airports as airportData } from "../../../data/AirportData";

interface RouteItem {
   id: number;
   from: string;
   fromCode: string;
   to: string;
   toCode: string;
   price: string;
   img: string;
}

const staticRoutes: RouteItem[] = [
   { id: 1, from: "İstanbul", fromCode: "IST", to: "Antalya", toCode: "AYT", price: "899", img: "/assets/img/cities/antalya.webp" },
   { id: 2, from: "İstanbul", fromCode: "IST", to: "İzmir", toCode: "ADB", price: "749", img: "/assets/img/cities/izmir.webp" },
   { id: 3, from: "Ankara", fromCode: "ESB", to: "İstanbul", toCode: "IST", price: "649", img: "/assets/img/cities/istanbul.webp" },
   { id: 4, from: "İstanbul", fromCode: "IST", to: "Trabzon", toCode: "TZX", price: "799", img: "/assets/img/cities/trabzon.webp" },
   { id: 5, from: "İstanbul", fromCode: "IST", to: "Bodrum", toCode: "BJV", price: "949", img: "/assets/img/cities/bodrum.webp" },
   { id: 6, from: "İstanbul", fromCode: "IST", to: "Ankara", toCode: "ESB", price: "599", img: "/assets/img/cities/ankara.webp" },
   { id: 7, from: "İstanbul", fromCode: "IST", to: "Dalaman", toCode: "DLM", price: "899", img: "/assets/img/cities/dalaman.webp" },
   { id: 8, from: "İstanbul", fromCode: "IST", to: "Adana", toCode: "ADA", price: "679", img: "/assets/img/cities/adana.webp" },
   { id: 9, from: "İstanbul", fromCode: "IST", to: "Gaziantep", toCode: "GZT", price: "749", img: "/assets/img/cities/gaziantep.webp" },
   { id: 10, from: "İstanbul", fromCode: "IST", to: "Kayseri", toCode: "ASR", price: "649", img: "/assets/img/cities/kayseri.webp" },
];

/** Havalimanı kodundan şehir ismi bul (API'den gelmezse AirportData fallback) */
const getCityName = (code: string, lang: 'tr' | 'en' = 'tr'): string => {
   const airport = airportData.find(a => a.code === code);
   if (!airport) return code;
   return lang === 'tr' ? airport.cityTr : airport.cityEn;
};

/** Varış şehrine göre görsel seç — şehir kodu eşleşmezse fallback döner */
const cityImageMap: Record<string, string> = {
   AYT: '/assets/img/cities/antalya.webp',
   ADB: '/assets/img/cities/izmir.webp',
   IST: '/assets/img/cities/istanbul.webp',
   SAW: '/assets/img/cities/istanbul.webp',
   TZX: '/assets/img/cities/trabzon.webp',
   BJV: '/assets/img/cities/bodrum.webp',
   ESB: '/assets/img/cities/ankara.webp',
   DLM: '/assets/img/cities/dalaman.webp',
   ADA: '/assets/img/cities/adana.webp',
   GZT: '/assets/img/cities/gaziantep.webp',
   ASR: '/assets/img/cities/kayseri.webp',
};

const fallbackImages = [
   '/assets/img/cities/istanbul.webp',
   '/assets/img/cities/antalya.webp',
   '/assets/img/cities/izmir.webp',
   '/assets/img/cities/bodrum.webp',
];

const getRouteImage = (toCode: string, index: number): string => {
   return cityImageMap[toCode] || fallbackImages[index % fallbackImages.length];
};

const ChevronLeftIcon = () => (
   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
   </svg>
);

const ChevronRightIcon = () => (
   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
   </svg>
);

/** AtaBilet — Popüler uçuş hatları. Konveyör bandı gibi sonsuz slider (sadece buton ile). */
const Location = () => {
   const { t, lang } = useTranslation();
   const [routes, setRoutes] = useState<RouteItem[]>(staticRoutes);
   const sliderRef = useRef<HTMLDivElement>(null);
   // Mevcut konumun toplam kart index'i (5 set * 10 kart = 50 kart üzerinden)
   const currentIndexRef = useRef(0);
   // İlk mount'ta scroll konumunu set ettik mi? routes API'den güncellenince başa zıplamayı engeller.
   const initializedRef = useRef(false);

   useEffect(() => {
      const fetchRoutes = async () => {
         try {
            const data = await getPopularRoutes();
            if (data.length > 0) {
               setRoutes(data.map((r: PopularRouteDto, i: number) => ({
                  id: i + 1,
                  from: r.originCity && r.originCity !== r.originCode ? r.originCity : getCityName(r.originCode, lang),
                  fromCode: r.originCode,
                  to: r.destinationCity && r.destinationCity !== r.destinationCode ? r.destinationCity : getCityName(r.destinationCode, lang),
                  toCode: r.destinationCode,
                  price: String(r.displayPrice),
                  img: getRouteImage(r.destinationCode, i),
               })));
            }
         } catch {
            // API hata verirse statik fallback zaten yüklü
         }
      };
      fetchRoutes();
   }, [lang]);

   // Sonsuz scroll için rotaları 5 kez tekrarla — sınıra ulaşma şansı düşük olsun
   const SET_COUNT = 5;
   const loopedRoutes = Array.from({ length: SET_COUNT }, () => routes).flat();

   // Bir adım (kart genişliği + gap) hesapla
   const getStep = (el: HTMLDivElement): number => {
      const firstCard = el.querySelector<HTMLElement>('.bb-dest-card');
      const cardWidth = firstCard?.offsetWidth ?? 280;
      return cardWidth + 16;
   };

   const stepOnce = (direction: 1 | -1) => {
      const el = sliderRef.current;
      if (!el) return;
      currentIndexRef.current += direction;
      const step = getStep(el);
      el.scrollTo({ left: currentIndexRef.current * step, behavior: 'smooth' });
   };

   // İlk yüklemede ortadaki sete (3. set, index = routes.length * 2) konumlan.
   // Sadece ilk başarılı render'da çalışır — API'den routes güncellenirse kullanıcının
   // mevcut konumu korunur, başa zıplamaz.
   useEffect(() => {
      if (initializedRef.current) return;
      const el = sliderRef.current;
      if (!el || routes.length === 0) return;
      initializedRef.current = true;
      const middle = routes.length * Math.floor(SET_COUNT / 2);
      currentIndexRef.current = middle;
      requestAnimationFrame(() => {
         const step = getStep(el);
         el.scrollLeft = middle * step;
      });
   }, [routes]);

   // Scroll bittikten sonra silent teleport: 3. set'e geri al.
   // 5 set olduğu için ve hepsi aynı kartlar olduğu için kullanıcı zıplamayı fark etmez —
   // pixel-pixel aynı görüntü, sadece scrollLeft değişir. Sonsuz akış sağlanır.
   useEffect(() => {
      const el = sliderRef.current;
      if (!el || routes.length === 0) return;
      let timeoutId: number;
      const middle = routes.length * Math.floor(SET_COUNT / 2);
      const lowerBound = routes.length; // 2. set'in başı
      const upperBound = routes.length * (SET_COUNT - 1); // 5. set'in başı

      const handleScroll = () => {
         window.clearTimeout(timeoutId);
         timeoutId = window.setTimeout(() => {
            const step = getStep(el);
            // Swipe ile gelmişse currentIndex'i scrollLeft'ten yeniden hesapla
            currentIndexRef.current = Math.round(el.scrollLeft / step);
            // Sınıra yaklaştıysa sessizce orta sete teleport et
            if (currentIndexRef.current >= upperBound || currentIndexRef.current < lowerBound) {
               const offsetWithinSet = currentIndexRef.current % routes.length;
               currentIndexRef.current = middle + offsetWithinSet;
               el.scrollLeft = currentIndexRef.current * step;
            }
         }, 180);
      };

      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
         el.removeEventListener('scroll', handleScroll);
         window.clearTimeout(timeoutId);
      };
   }, [routes]);

   const isTr = lang === "tr";

   return (
      <section aria-label={t.popularRoutes} className="bb-section bb-routes-section">
         <div className="container">
            <div className="bb-routes-header">
               <div>
                  <span className="bb-section-eyebrow">{isTr ? 'Fırsatlar' : 'Deals'}</span>
                  <h2 className="bb-section-title">{t.popularRoutes}</h2>
                  <p className="bb-section-subtitle">
                     {isTr
                        ? 'En çok tercih edilen rotalarda güncel uçak bileti fiyatları.'
                        : 'Up-to-date flight ticket prices on the most preferred routes.'}
                  </p>
               </div>
               <div className="bb-routes-header__actions">
                  <div className="bb-slider-nav" role="group" aria-label={isTr ? 'Slider kontrolleri' : 'Slider controls'}>
                     <button
                        type="button"
                        className="bb-slider-nav__btn"
                        onClick={() => stepOnce(-1)}
                        aria-label={isTr ? 'Önceki' : 'Previous'}
                     >
                        <ChevronLeftIcon />
                     </button>
                     <button
                        type="button"
                        className="bb-slider-nav__btn"
                        onClick={() => stepOnce(1)}
                        aria-label={isTr ? 'Sonraki' : 'Next'}
                     >
                        <ChevronRightIcon />
                     </button>
                  </div>
               </div>
            </div>

            <div className="bb-dest-slider-wrap">
               <div className="bb-dest-slider" ref={sliderRef}>
                  {loopedRoutes.map((route, idx) => (
                     <Link
                        key={`${route.id}-${idx}`}
                        href={`/?from=${route.fromCode}&to=${route.toCode}`}
                        className="bb-dest-card"
                        aria-label={`${route.from} - ${route.to}`}
                     >
                        <div className="bb-dest-card__media">
                           <Image
                              src={route.img}
                              alt={`${route.from} - ${route.to}`}
                              className="bb-dest-card__img"
                              fill
                              sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 25vw"
                              loading="lazy"
                           />
                           <span className="bb-dest-card__overlay" aria-hidden="true" />
                        </div>
                        <div className="bb-dest-card__content">
                           <div className="bb-dest-card__top">
                              <span className="bb-dest-card__route-codes">
                                 {route.fromCode} <span className="bb-dest-card__arrow">→</span> {route.toCode}
                              </span>
                           </div>
                           <div className="bb-dest-card__bottom">
                              <h3 className="bb-dest-card__city">{route.to}</h3>
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>
            </div>
         </div>
      </section>
   )
}

export default Location
