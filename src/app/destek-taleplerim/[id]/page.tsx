import type { Metadata } from "next";
import SupportTicketDetailClient from "./detail-client";

export const metadata: Metadata = {
  title: "Destek Talebi Detayı",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SupportTicketDetailClient ticketId={id} />;
}
