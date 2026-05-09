import type { Metadata } from "next";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "AtaBilet hesabınıza giriş yapın.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginClient />;
}
