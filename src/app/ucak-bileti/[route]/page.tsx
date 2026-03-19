import type { Metadata } from "next";
import FlightRouteClient from "./flight-route-client";
import JsonLd from "@/components/JsonLd";

export const revalidate = 3600; // 1 saat — fiyat bilgileri saatlik güncellenir

interface FlightRoutePageProps {
  params: Promise<{ route: string }>;
}

export async function generateMetadata({ params }: FlightRoutePageProps): Promise<Metadata> {
  const { route } = await params;
  // route format: istanbul-antalya or IST-AYT
  const parts = route.split("-");
  const kalkis = parts[0]?.charAt(0).toUpperCase() + parts[0]?.slice(1) || "";
  const varis = parts[1]?.charAt(0).toUpperCase() + parts[1]?.slice(1) || "";

  return {
    title: `${kalkis} - ${varis} Ucuz Uçak Bileti`,
    description: `${kalkis} - ${varis} arası en ucuz uçak bileti fiyatları. Karşılaştır, hemen al. AtaBilet ile uygun fiyatlı ${kalkis} ${varis} uçuşları.`,
    alternates: { canonical: `https://www.atabilet.com/ucak-bileti/${route}` },
    openGraph: {
      title: `${kalkis} → ${varis} Ucuz Uçak Bileti | AtaBilet`,
      description: `${kalkis} - ${varis} en ucuz uçak bileti fiyatları.`,
    },
  };
}

export default async function FlightRoutePage({ params }: FlightRoutePageProps) {
  const { route } = await params;
  const parts = route.split("-");
  const kalkis = parts[0]?.charAt(0).toUpperCase() + parts[0]?.slice(1) || "";
  const varis = parts[1]?.charAt(0).toUpperCase() + parts[1]?.slice(1) || "";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: "https://www.atabilet.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Uçak Bileti",
        item: "https://www.atabilet.com/ucak-bileti",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${kalkis} - ${varis}`,
        item: `https://www.atabilet.com/ucak-bileti/${route}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <FlightRouteClient kalkis={kalkis} varis={varis} />
    </>
  );
}
