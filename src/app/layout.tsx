import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import "@/styles/index.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.atabilet.com"),
  title: {
    default: "AtaBilet — Ucuz Uçak Bileti | Uçuş Ara, Karşılaştır, Satın Al",
    template: "%s | AtaBilet",
  },
  description:
    "En uygun uçak bileti fiyatları AtaBilet'te. Yurt içi ve yurt dışı uçuşları karşılaştırın, online satın alın. 7/24 destek.",
  keywords: [
    "ucuz uçak bileti",
    "uçak bileti",
    "bilet ara",
    "online bilet",
    "AtaBilet",
    "ucuz bilet",
    "uçuş ara",
  ],
  authors: [{ name: "AtaBilet" }],
  creator: "AtaBilet",
  publisher: "AtaBilet",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://www.atabilet.com",
    siteName: "AtaBilet",
    title: "AtaBilet — Ucuz Uçak Bileti Ara",
    description:
      "En uygun uçak bileti fiyatları. Karşılaştır, satın al.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "AtaBilet" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AtaBilet — Ucuz Uçak Bileti",
    description: "En uygun uçak bileti fiyatları. Karşılaştır, satın al.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://www.atabilet.com",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
