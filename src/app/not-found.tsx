import type { Metadata } from "next";
import ErrorPageClient from "./not-found-client";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı",
  description: "Aradığınız sayfa bulunamadı.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <ErrorPageClient />;
}
