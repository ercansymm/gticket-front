import { useState } from "react";
import BannerFormOne from "../../common/banner-form/BannerFormOne";
import { useTranslation } from "../../../context/LanguageContext";

type TabType = "flight" | "hotel" | "bus";

const tabs: { id: TabType; icon: string; labelKey: "flight" | "hotel" | "bus" }[] = [
   { id: "flight", icon: "fa-solid fa-plane", labelKey: "flight" },
   { id: "hotel", icon: "fa-solid fa-hotel", labelKey: "hotel" },
   { id: "bus", icon: "fa-solid fa-bus", labelKey: "bus" },
];

/** AtaBilet — Ana arama hero alanı. Sekmeli yapıda uçuş ve otel arama formları. */
const Banner = () => {
   const { t } = useTranslation();
   const [activeTab, setActiveTab] = useState<TabType>("flight");

   return (
      <section aria-label={t.searchFlight} className="bb-search-hero">
         <div className="bb-search-hero__overlay"></div>
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-12">
                  <div className="bb-hero-content text-center">

                     <h1 className="bb-hero-title">{t.heroTitle}</h1>
                     <div className="bb-search-tabs">
                        <div className="bb-search-tabs__nav" role="tablist">
                           {tabs.map((tab) => {
                              const isActive = activeTab === tab.id;
                              return (
                                 <button
                                    key={tab.id}
                                    role="tab"
                                    aria-selected={isActive}
                                    className={`bb-search-tabs__btn ${isActive ? "bb-search-tabs__btn--active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    type="button"
                                 >
                                    <i className={tab.icon}></i>
                                    <span>{t[tab.labelKey]}</span>
                                 </button>
                              );
                           })}
                        </div>
                        <div className="bb-search-tabs__content" role="tabpanel">
                           {activeTab === "flight" && <BannerFormOne />}
                           {activeTab !== "flight" && (
                              <div className="bb-coming-soon">
                                 <i className={tabs.find(tb => tb.id === activeTab)?.icon || "fa-solid fa-clock"}></i>
                                 <h3>{t.comingSoon}</h3>
                                 <p>{t.comingSoonDesc}</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Banner
