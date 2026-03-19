import { useState } from "react";
import { useTranslation } from "../../../context/LanguageContext";

/** AtaBilet — Bilet sorgulama formu. */
const PnrQueryForm = () => {
   const { t } = useTranslation();

   const [pnr, setPnr] = useState("");
   const [surname, setSurname] = useState("");
   const [errors, setErrors] = useState<Record<string, string>>({});

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
   };

   return (
      <form role="search" aria-label={t.pnrQuery} onSubmit={handleSubmit} className="bb-flight-form">
         <div className="bb-flight-form__fields bb-flight-form__fields--pnr">
            <div className="bb-flight-form__field">
               <label className="bb-flight-form__label">{t.pnrCode}</label>
               <input
                  type="text"
                  className={`bb-flight-form__input ${errors.pnr ? "bb-flight-form__input--error" : ""}`}
                  placeholder={t.pnrPlaceholder}
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value.toUpperCase())}
                  maxLength={10}
                  autoComplete="off"
               />
               {errors.pnr && <span className="bb-flight-form__error">{errors.pnr}</span>}
            </div>

            <div className="bb-flight-form__field">
               <label className="bb-flight-form__label">{t.lastName}</label>
               <input
                  type="text"
                  className={`bb-flight-form__input ${errors.surname ? "bb-flight-form__input--error" : ""}`}
                  placeholder={t.lastNamePlaceholder}
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  autoComplete="off"
               />
               {errors.surname && <span className="bb-flight-form__error">{errors.surname}</span>}
            </div>

            <div className="bb-flight-form__field bb-flight-form__field--submit">
               <button type="submit" className="bb-flight-form__submit" data-event="pnr_query" data-action="click">
                  <i className="fa-solid fa-magnifying-glass"></i> {t.query}
               </button>
            </div>
         </div>
      </form>
   );
};

export default PnrQueryForm;
