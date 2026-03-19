import type { Metadata } from "next";
import WishlistClient from "./wishlist-client";

export const metadata: Metadata = {
  title: "Favorilerim",
  description: "Favori uçuşlarınız ve ürünleriniz.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
