import type { Metadata } from "next";
import SearchResultsClient from "./search-results-client";

export const metadata: Metadata = {
  title: "Uçuş Arama Sonuçları",
  description: "En uygun fiyatlı uçuş seçeneklerini karşılaştırın.",
  robots: { index: false, follow: true },
};

export default function SearchResultsPage() {
  return <SearchResultsClient />;
}
