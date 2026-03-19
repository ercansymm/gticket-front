import { useEffect, useRef, useState } from "react";
import Flatpickr from "react-flatpickr";
import { Turkish } from "flatpickr/dist/l10n/tr.js";
import { useTranslation } from "../../../context/LanguageContext";

interface GuestCounts {
   rooms: number;
   adults: number;
   children: number;
}

/** AtaBilet — Otel arama formu. */
const HotelSearchForm = () => {
   const { t, lang } = useTranslation();

   const [city, setCity] = useState("");
   const [cityOpen, setCityOpen] = useState(false);
   const [citySearch, setCitySearch] = useState("");
   const [checkIn, setCheckIn] = useState<Date>(new Date());
   const [checkOut, setCheckOut] = useState<Date>(new Date(Date.now() + 86400000));
   const [guestOpen, setGuestOpen] = useState(false);
   const [guests, setGuests] = useState<GuestCounts>({ rooms: 1, adults: 2, children: 0 });
   const [errors, setErrors] = useState<Record<string, string>>({});

   const cityRef = useRef<HTMLDivElement>(null);
   const guestRef = useRef<HTMLDivElement>(null);

   const cities = ["İstanbul", "Ankara", "Antalya", "İzmir", "Bodrum", "Trabzon", "Kapadokya", "Fethiye"];

   const flatpickrLocale = lang === "tr" ? Turkish : undefined;

   useEffect(() => {
      const handler = (e: MouseEvent) => {
         if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
         if (guestRef.current && !guestRef.current.contains(e.target as Node)) setGuestOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, []);

   const filteredCities = cities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));

   const updateGuest = (key: keyof GuestCounts, delta: number) => {
      const limits: Record<keyof GuestCounts, [number, number]> = {
         rooms: [1, 9],
         adults: [1, 9],
         children: [0, 6],
      };
      setGuests(prev => {
         const [min, max] = limits[key];
         return { ...prev, [key]: Math.min(max, Math.max(min, prev[key] + delta)) };
      });
   };

   const validate = (): boolean => {
      const errs: Record<string, string> = {};
      if (!city) errs.city = t.selectCity;
      if (checkOut <= checkIn) errs.checkOut = t.checkOutError;
      setErrors(errs);
      return Object.keys(errs).length === 0;
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
   };

   const fpBase = {
      dateFormat: "d/m/Y",
      minDate: "today" as const,
      locale: flatpickrLocale,
      showMonths: window.innerWidth >= 768 ? 2 : 1,
   };

   return (
      <form role="search" aria-label={t.searchHotel} onSubmit={handleSubmit} className="bb-flight-form">
         <div className="bb-flight-form__fields">
            {/* Şehir / Otel */}
            <div ref={cityRef} className="bb-flight-form__field bb-flight-form__field--airport">
               <label className="bb-flight-form__label">{t.cityOrHotel}</label>
               <input
                  type="text"
                  className={`bb-flight-form__input ${errors.city ? "bb-flight-form__input--error" : ""}`}
                  placeholder={t.whereAreYouGoing}
                  value={cityOpen ? citySearch : city}
                  onChange={(e) => { setCitySearch(e.target.value); setCityOpen(true); }}
                  onFocus={() => { setCityOpen(true); setCitySearch(""); }}
                  autoComplete="off"
               />
               {errors.city && <span className="bb-flight-form__error">{errors.city}</span>}
               {cityOpen && (
                  <ul className="bb-flight-form__dropdown">
                     {filteredCities.map(c => (
                        <li key={c} onClick={() => { setCity(c); setCityOpen(false); setCitySearch(""); }}>
                           <i className="fa-solid fa-location-dot"></i> {c}
                        </li>
                     ))}
                     {filteredCities.length === 0 && <li className="bb-flight-form__no-result">{t.noResult}</li>}
                  </ul>
               )}
            </div>

            {/* Giriş Tarihi */}
            <div className="bb-flight-form__field">
               <label className="bb-flight-form__label">{t.checkIn}</label>
               <Flatpickr
                  value={checkIn}
                  onChange={([date]) => { if (date) setCheckIn(date); }}
                  options={fpBase}
                  className="bb-flight-form__input"
                  placeholder={t.selectDate}
               />
            </div>

            {/* Çıkış Tarihi */}
            <div className="bb-flight-form__field">
               <label className="bb-flight-form__label">{t.checkOut}</label>
               <Flatpickr
                  value={checkOut}
                  onChange={([date]) => { if (date) setCheckOut(date); }}
                  options={{ ...fpBase, minDate: checkIn }}
                  className={`bb-flight-form__input ${errors.checkOut ? "bb-flight-form__input--error" : ""}`}
                  placeholder={t.selectDate}
               />
               {errors.checkOut && <span className="bb-flight-form__error">{errors.checkOut}</span>}
            </div>

            {/* Oda & Kişi */}
            <div ref={guestRef} className="bb-flight-form__field bb-flight-form__field--pax">
               <label className="bb-flight-form__label">{t.room} / {t.guest}</label>
               <button type="button" className="bb-flight-form__input bb-flight-form__pax-toggle" onClick={() => setGuestOpen(prev => !prev)} aria-expanded={guestOpen} aria-haspopup="dialog">
                  {guests.rooms} {t.room}, {guests.adults + guests.children} {t.guest}
                  <i className="fa-solid fa-chevron-down"></i>
               </button>
               {guestOpen && (
                  <div className="bb-flight-form__pax-dropdown">
                     {([
                        { key: "rooms" as const, label: t.room },
                        { key: "adults" as const, label: t.adult },
                        { key: "children" as const, label: t.child },
                     ]).map(({ key, label }) => (
                        <div key={key} className="bb-pax-row">
                           <span className="bb-pax-label">{label}</span>
                           <div className="bb-pax-controls">
                              <button type="button" onClick={() => updateGuest(key, -1)} aria-label={`${label} ${t.decrease}`}>−</button>
                              <span>{guests[key]}</span>
                              <button type="button" onClick={() => updateGuest(key, 1)} aria-label={`${label} ${t.increase}`}>+</button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Ara butonu */}
            <div className="bb-flight-form__field bb-flight-form__field--submit">
               <button type="submit" className="bb-flight-form__submit" data-event="hotel_search" data-action="click">
                  <i className="fa-solid fa-magnifying-glass"></i> {t.searchHotel}
               </button>
            </div>
         </div>
      </form>
   );
};

export default HotelSearchForm;
