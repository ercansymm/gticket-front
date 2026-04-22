import type { Metadata } from "next";
import DestekTalebiClient from "./destek-talebi-client";

export const metadata: Metadata = {
  title: "Destek Talebi",
  description: "AtaBilet destek talepleriniz.",
  robots: { index: false, follow: false },
};

export default function DestekTalebiPage() {
  return <DestekTalebiClient />;
}
