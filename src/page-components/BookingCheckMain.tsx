import HeaderOne from "../layouts/headers/HeaderOne"
import TrustBar from "../components/homes/home-one/TrustBar"
import FooterOne from "../layouts/footers/FooterOne"
import { useState } from "react"
import { useTranslation } from "../context/LanguageContext"

const turkishToEnglishUpper = (value: string): string => {
   const charMap: Record<string, string> = {
      'ş': 'S', 'Ş': 'S',
      'ç': 'C', 'Ç': 'C',
      'ğ': 'G', 'Ğ': 'G',
      'ı': 'I', 'İ': 'I',
      'ö': 'O', 'Ö': 'O',
      'ü': 'U', 'Ü': 'U',
      'â': 'A', 'Â': 'A',
      'î': 'I', 'Î': 'I',
      'û': 'U', 'Û': 'U',
      'i': 'I',
   };
   return value
      .split('')
      .map(char => charMap[char] || char)
      .join('')
      .toUpperCase();
};

const BookingCheckMain = () => {
   const { t } = useTranslation();
   const [pnr, setPnr] = useState("");
   const [surname, setSurname] = useState("");
   const [errors, setErrors] = useState<Record<string, string>>({});

   const handlePnrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = turkishToEnglishUpper(e.target.value);
      value = value.replace(/[^A-Z0-9]/g, '');
      setPnr(value);
   };

   const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = turkishToEnglishUpper(e.target.value);
      value = value.replace(/[^A-Z\s]/g, '');
      setSurname(value);
   };

   const validate = (): boolean => {
      const errs: Record<string, string> = {};
      if (!pnr.trim()) errs.pnr = t.enterPnr;
      if (!surname.trim()) errs.surname = t.enterLastName;
      setErrors(errs);
      return Object.keys(errs).length === 0;
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      // TODO: API call to check booking status
   };

   return (
      <>
         <TrustBar />
         <HeaderOne />
         <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", background: "#f8f9fa" }}>
            <div className="bb-booking-check-card">
               <h1 className="bb-booking-check-card__title">{t.bookingCheckTitle}</h1>
               <form onSubmit={handleSubmit}>
                  <div className="bb-flight-form__field" style={{ marginBottom: 16 }}>
                     <label className="bb-flight-form__label">{t.pnrCode}</label>
                     <input
                        type="text"
                        className={`bb-flight-form__input ${errors.pnr ? "bb-flight-form__input--error" : ""}`}
                        placeholder={t.pnrPlaceholder}
                        value={pnr}
                        onChange={handlePnrChange}
                        maxLength={10}
                        autoComplete="off"
                     />
                     {errors.pnr && <span className="bb-flight-form__error">{errors.pnr}</span>}
                  </div>
                  <div className="bb-flight-form__field" style={{ marginBottom: 16 }}>
                     <label className="bb-flight-form__label">{t.lastName}</label>
                     <input
                        type="text"
                        className={`bb-flight-form__input ${errors.surname ? "bb-flight-form__input--error" : ""}`}
                        placeholder={t.lastNamePlaceholder}
                        value={surname}
                        onChange={handleSurnameChange}
                        autoComplete="off"
                     />
                     {errors.surname && <span className="bb-flight-form__error">{errors.surname}</span>}
                  </div>
                  <button type="submit" className="bb-flight-form__submit" data-event="booking_check" style={{ width: "100%" }}>
                     <i className="fa-solid fa-magnifying-glass"></i> {t.query}
                  </button>
               </form>
            </div>
         </main>
         <FooterOne />
      </>
   )
}

export default BookingCheckMain
