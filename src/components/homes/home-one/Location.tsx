import { useEffect, useState } from 'react';
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
   { id: 1, from: "İstanbul", fromCode: "IST", to: "Antalya", toCode: "AYT", price: "899", img: "/assets/img/cities/antalya.jpg" },
   { id: 2, from: "İstanbul", fromCode: "IST", to: "İzmir", toCode: "ADB", price: "749", img: "/assets/img/cities/izmir.jpg" },
   { id: 3, from: "Ankara", fromCode: "ESB", to: "İstanbul", toCode: "IST", price: "649", img: "/assets/img/cities/istanbul.jpg" },
   { id: 4, from: "İstanbul", fromCode: "IST", to: "Trabzon", toCode: "TZX", price: "799", img: "/assets/img/cities/trabzon.jpg" },
   { id: 5, from: "İstanbul", fromCode: "IST", to: "Bodrum", toCode: "BJV", price: "949", img: "/assets/img/cities/bodrum.jpg" },
   { id: 6, from: "Ankara", fromCode: "ESB", to: "Antalya", toCode: "AYT", price: "849", img: "/assets/img/cities/antalya.jpg" },
];

/** Havalimanı kodundan şehir ismi bul (API'den gelmezse AirportData fallback) */
const getCityName = (code: string, lang: 'tr' | 'en' = 'tr'): string => {
   const airport = airportData.find(a => a.code === code);
   if (!airport) return code;
   return lang === 'tr' ? airport.cityTr : airport.cityEn;
};

/** Varış şehrine göre görsel seç — şehir kodu eşleşmezse fallback döner */
const cityImageMap: Record<string, string> = {
   AYT: '/assets/img/cities/antalya.jpg',
   ADB: '/assets/img/cities/izmir.jpg',
   IST: '/assets/img/cities/istanbul.jpg',
   SAW: '/assets/img/cities/istanbul.jpg',
   TZX: '/assets/img/cities/trabzon.jpg',
   BJV: '/assets/img/cities/bodrum.jpg',
   ESB: '/assets/img/cities/ankara.jpg',
};

const fallbackImages = [
   '/assets/img/cities/istanbul.jpg',
   '/assets/img/cities/antalya.jpg',
   '/assets/img/cities/izmir.jpg',
   '/assets/img/cities/bodrum.jpg',
];

const getRouteImage = (toCode: string, index: number): string => {
   return cityImageMap[toCode] || fallbackImages[index % fallbackImages.length];
};

/** AtaBilet — Popüler uçuş hatları. Bento grid magazine layout. */
const Location = () => {
   const { t, lang } = useTranslation();
   const [routes, setRoutes] = useState<RouteItem[]>(staticRoutes);

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

   const isTr = lang === "tr";
   const items = routes.slice(0, 5);
   const [hero, ...rest] = items;

   const renderCard = (route: RouteItem, isHero?: boolean) => (
      <Link
         key={route.id}
         href={`/?from=${route.fromCode}&to=${route.toCode}`}
         className={`bb-dest-card${isHero ? ' bb-dest-card--hero' : ''}`}
         aria-label={`${route.from} - ${route.to}`}
      >
         <div className="bb-dest-card__media">
            <Image
               src={route.img}
               alt={`${route.from} - ${route.to}`}
               className="bb-dest-card__img"
               fill
               sizes={isHero ? '(max-width: 992px) 100vw, 50vw' : '(max-width: 992px) 50vw, 25vw'}
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
   );

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
               <Link href="/search-results" className="bb-blog-section__all-link">
                  {isTr ? 'Tümünü gör' : 'View all'} <i className="fa-solid fa-arrow-right"></i>
               </Link>
            </div>

            <div className="bb-dest-grid">
               {hero && renderCard(hero, true)}
               <div className="bb-dest-grid__rest">
                  {rest.map((r) => renderCard(r))}
               </div>
            </div>
         </div>
      </section>
   )
}

export default Location
