import type { Metadata } from "next";
import AboutClient from "./about-client";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "AtaBilet hakkında bilgi edinin. Misyonumuz, vizyonumuz ve ekibimiz.",
  alternates: { canonical: "https://www.atabilet.com/hakkimizda" },
};

export default function AboutPage() {
  return <AboutClient />;
}
