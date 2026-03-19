import type { Metadata } from "next";
import HomePageClient from "../page-client";

export const metadata: Metadata = {
  title: "Ucuz Uçak Bileti Ara",
  description: "En uygun uçak bileti fiyatları. Tüm havayollarını karşılaştırın.",
  alternates: { canonical: "https://www.atabilet.com/ucak-bileti" },
};

export default function UcakBiletiPage() {
  return <HomePageClient />;
}
