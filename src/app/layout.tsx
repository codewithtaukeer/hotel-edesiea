import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { HOTEL_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL("https://hoteledesiea.com"),
  title: `${HOTEL_INFO.name} | Pure Veg Restaurant & Luxury Stay in Pali, Raigad`,
  description:
    "Hotel Edesiea in Pali, Maharashtra near Shree Ballaleshwar Ganpati Temple. Luxury rooms, authentic pure-veg multi-cuisine dining, Maharashtrian Thali, and 24/7 hospitality.",
  keywords: [
    "Hotel Edesiea",
    "Pali Raigad Hotel",
    "Ballaleshwar Ganpati Temple Hotel",
    "Pure Veg Restaurant Pali",
    "Hotels near Ashtavinayak Pali",
    "Pali Lodge",
    "Edelisa Restaurant",
  ],
  openGraph: {
    title: `${HOTEL_INFO.name} — Authentic Flavors, Timeless Hospitality`,
    description:
      "Premier pure-vegetarian stay and fine dining near Shree Ballaleshwar Ganpati Temple, Pali.",
    url: "https://hoteledesiea.com",
    siteName: HOTEL_INFO.name,
    images: [
      {
        url: "/images/hotel-exterior-banner.png",
        width: 1200,
        height: 630,
        alt: "Hotel Edesiea Pali Facade",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo.png" />
      </head>
      <body className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0E1A2B] antialiased selection:bg-[#C59B27] selection:text-white">
        <LanguageProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <WhatsAppFloatingButton />
        </LanguageProvider>
      </body>
    </html>
  );
}
