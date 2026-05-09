import type { Metadata } from "next";
import FaqClient from "./faq-client";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: "AtaBilet hakkında sıkça sorulan sorular ve cevapları.",
  alternates: { canonical: "https://www.atabilet.com/sss" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Uçak bileti nasıl satın alınır?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AtaBilet üzerinden uçuş araması yaparak, size uygun uçuşu seçip güvenli ödeme ile biletinizi satın alabilirsiniz.",
      },
    },
    {
      "@type": "Question",
      name: "Bilet iptali nasıl yapılır?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bilet iptali için müşteri hizmetlerimizi arayabilir veya hesabınız üzerinden iptal işlemi gerçekleştirebilirsiniz.",
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <FaqClient />
    </>
  );
}
