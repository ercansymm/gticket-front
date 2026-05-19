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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <head>
        {/* FontAwesome lives in public/assets/css and references ../fonts via relative paths */}
        <link rel="stylesheet" href="/assets/css/fontawesome-all.min.css" />
      </head>
      <body suppressHydrationWarning>
        {/* Add bb-home class to body BEFORE header renders to prevent dark blue flash on refresh */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(location.pathname==='/'||location.pathname===''){document.body.classList.add('bb-home');}}catch(e){}})();`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
