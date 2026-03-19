import type { Metadata } from "next";
import PricingClient from "./pricing-client";

export const metadata: Metadata = {
  title: "Fiyatlandırma",
  description: "AtaBilet hizmet fiyatları ve paketleri.",
  alternates: { canonical: "https://www.atabilet.com/pricing" },
};

export default function PricingPage() {
  return <PricingClient />;
}
