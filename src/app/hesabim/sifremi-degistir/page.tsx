import type { Metadata } from "next";
import ChangePasswordClient from "./change-password-client";

export const metadata: Metadata = {
  title: "Şifremi Değiştir | Atabilet",
  description: "Hesap şifrenizi güvenli bir şekilde değiştirin.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ChangePasswordClient />;
}
