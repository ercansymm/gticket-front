import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ödeme Başarısız | AtaBilet",
  robots: { index: false, follow: false },
};

import FailedClient from "./failed-client";

export default function FailedPage() {
  return <FailedClient />;
}
