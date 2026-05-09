import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "../../context/LanguageContext";

const COOKIE_KEY = "bb_cookie_consent";

/** AtaBilet — KVKK uyumlu çerez bildirimi banner'ı. localStorage ile kalıcı onay. */
const CookieConsent = () => {
   const { t } = useTranslation();
   const [visible, setVisible] = useState(false);

   useEffect(() => {
      try {
         if (!localStorage.getItem(COOKIE_KEY)) {
            setVisible(true);
         }
      } catch {
         setVisible(true);
      }
   }, []);

   const handleAccept = () => {
      try {
         localStorage.setItem(COOKIE_KEY, "accepted");
      } catch { /* quota exceeded — silently fail */ }
      setVisible(false);
   };

   if (!visible) return null;

   return (
      <div className="bb-cookie-consent" role="alert">
         <div className="container">
            <div className="bb-cookie-consent__inner">
               <p className="bb-cookie-consent__text">
                  {t.cookieMessage} <Link href="/cerez-politikasi" className="bb-cookie-consent__link">{t.cookiePolicyLink}</Link> {t.cookieMessageEnd}
               </p>
               <div className="bb-cookie-consent__actions">
                  <button onClick={handleAccept} className="bb-cookie-consent__accept" type="button">{t.accept}</button>
                  <Link href="/cerez-politikasi" className="bb-cookie-consent__details">{t.moreInfo}</Link>
               </div>
            </div>
         </div>
      </div>
   );
};

export default CookieConsent;
