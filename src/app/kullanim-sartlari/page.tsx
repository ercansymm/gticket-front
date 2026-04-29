import type { Metadata } from "next";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import TrustBar from "@/components/homes/home-one/TrustBar";

export const metadata: Metadata = {
  title: "Kullanım Şartları | AtaBilet",
  description: "AtaBilet kullanım şartları.",
};

export default function KullanimSartlariPage() {
  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main className="ab-legal-page">
        <div className="container">
          <div className="ab-legal-page__inner">
            <h1>Kullanım Şartları</h1>
            <p className="ab-legal-page__placeholder">
              Bu sayfanın içeriği yakında eklenecektir.
            </p>
          </div>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
