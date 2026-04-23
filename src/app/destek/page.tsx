import type { Metadata } from "next";
import LookupClient from "./lookup-client";

export const metadata: Metadata = {
  title: "Destek - Misafir Girişi | GBilet",
  description: "PNR ve soyadınız ile destek talebi oluşturabilirsiniz.",
};

export default function Page() {
  return <LookupClient />;
}
