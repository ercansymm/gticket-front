import { useTranslation } from "../../../context/LanguageContext";

interface BenefitStep {
   id: number;
   icon: string;
   titleKey: "stepSearch" | "stepSelect" | "stepBuy";
   descKey: "stepSearchDesc" | "stepSelectDesc" | "stepBuyDesc";
}

const steps: BenefitStep[] = [
   { id: 1, icon: "fa-solid fa-magnifying-glass", titleKey: "stepSearch", descKey: "stepSearchDesc" },
   { id: 2, icon: "fa-solid fa-code-compare", titleKey: "stepSelect", descKey: "stepSelectDesc" },
   { id: 3, icon: "fa-solid fa-credit-card", titleKey: "stepBuy", descKey: "stepBuyDesc" },
];

/** AtaBilet — "Nasıl Çalışır?" 3 adımlık süreç bölümü. */
const Process = () => {
   const { t } = useTranslation();

   return (
      <section aria-label={t.howItWorks} className="bb-section">
         <div className="container">
            <div className="text-center mb-40">
                     <h2 className="bb-section-title">{t.howItWorks}</h2>
            </div>
            <div className="row">
               <div className="col-12">
                  <ol className="bb-benefits-list">
                     {steps.map((step) => (
                        <li key={step.id} className="bb-benefits-list__item">
                           <div className="bb-benefits-list__icon-wrap">
                              <span className="bb-benefits-list__step">{step.id}</span>
                              <i className={step.icon}></i>
                           </div>
                           <h3 className="bb-benefits-list__title">{t[step.titleKey]}</h3>
                           <p className="bb-benefits-list__desc">{t[step.descKey]}</p>
                        </li>
                     ))}
                  </ol>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Process
