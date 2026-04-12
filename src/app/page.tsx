// Bu satır test2 branch'inden eklendi - conflict testi

//burada test 1 de herhangi bir şey eklemedik bakalım sadece burası eklenecek mi var olan hangi şeyi silecek yada silmeyecek
// İsmail test commiti - bu satır PR testi için eklendi
// 5. satırda bir test yapıldı conflict için eklenecek. 

//  ercanın mergeinden sonra benim kodlarım gidecekmi sağlaması 
//doğrusunu yazdım leaderim

//ismail e mail branchindeyken test
import type { Metadata } from "next";
import HomePageClient from "./page-client";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Ucuz Uçak Bileti | Uçuş Ara, Karşılaştır, Satın Al",
  description:
    "En uygun uçak bileti fiyatları AtaBilet'te. Yurt içi ve yurt dışı uçuşları karşılaştırın, online satın alın. 7/24 destek.",
  alternates: {
    canonical: "https://www.atabilet.com",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AtaBilet",
  url: "https://www.atabilet.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.atabilet.com/search-results?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AtaBilet",
  url: "https://www.atabilet.com",
  logo: "https://www.atabilet.com/assets/img/logo/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Turkish", "English"],
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={organizationJsonLd} />
      <HomePageClient />
    </>
  );
}
