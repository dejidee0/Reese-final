import "./globals.css";
import { Inter } from "next/font/google";
import { ClientLayout } from "@/components/layout/client-layout";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  metadataBase: new URL("https://www.reeseblank.com"),
  title: "ReeseBlank - Luxury Streetwear",
  description:
    "The luxe vanguard of streetwear culture. Premium fashion drops, community battles, and AI-powered styling.",
  keywords: [
    "luxury streetwear",
    "ReeseBlank",
    "fashion drops",
    "AI stylist",
    "premium fashion",
    "Nigerian fashion",
  ],
  openGraph: {
    type: "website",
    url: "https://www.reeseblank.com",
    title: "ReeseBlank - Luxury Streetwear",
    description:
      "The luxe vanguard of streetwear culture. Premium fashion drops, community battles, and AI-powered styling.",
    siteName: "ReeseBlank",
    images: [
      {
        url: "https://your-domain.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "ReeseBlank - Luxury Streetwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReeseBlank - Luxury Streetwear",
    description:
      "Explore drops, battles, and style AI on ReeseBlank – the new face of Nigerian fashion.",
    images: ["https://your-domain.com/og-image.png"],
    site: "@reese_blank",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Paystack Script */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
        />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
