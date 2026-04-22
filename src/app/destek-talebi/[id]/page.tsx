import type { Metadata } from "next";
import DestekTalebiDetailClient from "./detail-client";

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
  return <DestekTalebiDetailClient ticketId={id} />;
}
