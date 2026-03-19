"use client";

import HomeOne from "@/components/homes/home-one";

interface FlightRouteClientProps {
  kalkis: string;
  varis: string;
}

export default function FlightRouteClient({ kalkis, varis }: FlightRouteClientProps) {
  // kalkis/varis can be used to pre-fill the search form
  void kalkis;
  void varis;
  return <HomeOne />;
}
