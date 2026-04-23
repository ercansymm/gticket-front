import type { Metadata } from "next";
import GuestDetailClient from "./detail-client";

export const metadata: Metadata = {
  title: "Destek Talebi - Misafir | GBilet",
};

export default function Page() {
  return <GuestDetailClient />;
}
