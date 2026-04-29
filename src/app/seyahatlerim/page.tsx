import type { Metadata } from "next";
import SeyahatlerimClient from "./seyahatlerim-client";

export const metadata: Metadata = {
  title: "Seyahatlerim | AtaBilet",
  description: "Geçmiş ve aktif uçuş rezervasyonlarınızı görüntüleyin.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SeyahatlerimClient />;
}
