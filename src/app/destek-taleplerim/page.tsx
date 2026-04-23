import type { Metadata } from "next";
import SupportTicketsListClient from "./list-client";

export const metadata: Metadata = {
  title: "Destek Taleplerim",
  description: "Açtığınız destek taleplerini ve mesajlarını görüntüleyin.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SupportTicketsListClient />;
}
