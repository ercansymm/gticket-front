import type { Metadata } from "next";
import PaymentClient from "./payment-client";

export const metadata: Metadata = {
  title: "Ödeme | AtaBilet",
  robots: { index: false, follow: false },
};

export default function PaymentPage() {
  return <PaymentClient />;
}
