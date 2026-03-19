import type { Metadata } from "next";
import RegisterClient from "./register-client";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  description: "AtaBilet'e ücretsiz kayıt olun ve avantajlardan yararlanın.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
