import type { Metadata } from "next";
import CartClient from "./cart-client";

export const metadata: Metadata = {
  title: "Sepet",
  description: "Alışveriş sepetiniz.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartClient />;
}
