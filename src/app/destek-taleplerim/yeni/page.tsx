import type { Metadata } from "next";
import NewSupportTicketClient from "./new-client";

export const metadata: Metadata = {
  title: "Yeni Destek Talebi",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <NewSupportTicketClient />;
}
