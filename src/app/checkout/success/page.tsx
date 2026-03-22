import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bilet Kesildi | AtaBilet",
  robots: { index: false, follow: false },
};

import SuccessClient from "./success-client";

export default function SuccessPage() {
  return <SuccessClient />;
}
