import { useState } from "react";
import BannerFormOne from "../../common/banner-form/BannerFormOne";
import HotelSearchForm from "../../common/banner-form/HotelSearchForm";
import { useTranslation } from "../../../context/LanguageContext";

type TabType = "flight" | "hotel";

/** AtaBilet — Ana arama hero alanı. Sekmeli yapıda uçuş ve otel arama formları. */
const Banner = () => {
   const { t } = useTranslation();
   const [activeTab, setActiveTab] = useState<TabType>("flight");

   return (
      <section aria-label={t.searchFlight} className="bb-search-hero" style={{ backgroundImage: `url(/assets/img/hero/tu/banner.jpg)` }}>
         <div className="bb-search-hero__overlay"></div>
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-10">
                  <div className="bb-hero-content text-center">
                     <h1 className="bb-hero-title">{t.heroTitle}</h1>
                     <div className="bb-search-tabs">
                        <div className="bb-search-tabs__nav" role="tablist">
                           <button
                              role="tab"
                              aria-selected={activeTab === "flight"}
                              className={`bb-search-tabs__btn ${activeTab === "flight" ? "bb-search-tabs__btn--active" : ""}`}
                              onClick={() => setActiveTab("flight")}
                              type="button"
                           >
                              <i className="fa-solid fa-plane"></i> {t.flight}
                           </button>
                           <button
                              role="tab"
                              aria-selected={activeTab === "hotel"}
                              className={`bb-search-tabs__btn ${activeTab === "hotel" ? "bb-search-tabs__btn--active" : ""}`}
                              onClick={() => setActiveTab("hotel")}
                              type="button"
                           >
                              <i className="fa-solid fa-hotel"></i> {t.hotel}
                           </button>
                        </div>
                        <div className="bb-search-tabs__content" role="tabpanel">
                           {activeTab === "flight" && <BannerFormOne />}
                           {activeTab === "hotel" && <HotelSearchForm />}
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
