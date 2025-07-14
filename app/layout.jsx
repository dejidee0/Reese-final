import "./globals.css";
import { Inter } from "next/font/google";
import { ClientLayout } from "@/components/layout/client-layout";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ReeseBlanks - Luxury Streetwear",
  description:
    "The luxe vanguard of streetwear culture. Premium fashion drops, community battles, and AI-powered styling.",
  keywords: "luxury streetwear, fashion, drops, community, AI stylist",
  openGraph: {
    title: "ReeseBlanks - Luxury Streetwear",
    description: "The luxe vanguard of streetwear culture",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Paystack Script (client-side only) */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
        />

        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
