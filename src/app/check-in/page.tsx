import type { Metadata } from "next";
import CheckInClient from "./check-in-client";

export const metadata: Metadata = {
  title: "Online Check-in - AtaBilet",
  description:
    "Uçuşunuzdan önce online check-in yapın, havalimanında zaman kazanın. PNR kodunuzla check-in durumunuzu sorgulayın.",
  alternates: { canonical: "https://www.atabilet.com/check-in" },
};

export default function CheckInPage() {
  return <CheckInClient />;
}
