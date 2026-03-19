import type { Metadata } from "next";
import BookingCheckClient from "./booking-check-client";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Bilet Sorgula - PNR Sorgulama",
  description: "PNR kodunuz ve soyadınız ile bilet rezervasyonunuzu sorgulayın.",
  alternates: { canonical: "https://www.atabilet.com/bilet-sorgula" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "PNR kodu nedir?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PNR (Passenger Name Record) kodu, uçak bileti rezervasyonunuza özel 6 haneli bir koddur. Bu kod ile biletinizi sorgulayabilirsiniz.",
      },
    },
  ],
};

export default function BookingCheckPage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <BookingCheckClient />
    </>
  );
}
