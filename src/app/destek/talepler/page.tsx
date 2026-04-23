import type { Metadata } from "next";
import GuestTicketsClient from "./tickets-client";

export const metadata: Metadata = {
  title: "Destek Taleplerim - Misafir | GBilet",
};

export default function Page() {
  return <GuestTicketsClient />;
}
