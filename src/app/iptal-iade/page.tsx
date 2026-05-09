import type { Metadata } from "next";
import IptalIadeClient from "./iptal-iade-client";

export const metadata: Metadata = {
  title: "İptal / İade İşlemleri - AtaBilet",
  description:
    "Uçak biletinizi iptal ettirin veya iade talebinizi oluşturun. PNR kodunuzla biletinizi sorgulayıp destek talebinizi açın.",
  alternates: { canonical: "https://www.atabilet.com/iptal-iade" },
};

export default function IptalIadePage() {
  return <IptalIadeClient />;
}
