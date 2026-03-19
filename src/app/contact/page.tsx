import type { Metadata } from "next";
import ContactClient from "./contact-client";

export const metadata: Metadata = {
  title: "İletişim",
  description: "AtaBilet ile iletişime geçin. Sorularınız ve önerileriniz için bize ulaşın.",
  alternates: { canonical: "https://www.atabilet.com/contact" },
};

export default function ContactPage() {
  return <ContactClient />;
}
