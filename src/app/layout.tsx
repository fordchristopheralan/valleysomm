import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "600"],
});

export const metadata = {
  title: 'Valley Somm - AI Wine Trail Guide for Yadkin Valley',
  description: 'Get a personalized wine trail in Yadkin Valley, NC. Answer 5 questions and discover your perfect wine tasting route.',
  openGraph: {
    title: 'Valley Somm - Your AI Wine Trail Guide',
    description: 'Personalized wine trails for Yadkin Valley',
    url: 'https://www.valleysomm.com',
    siteName: 'Valley Somm',
    images: ['/hero.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Leaflet CSS CDN - Latest stable as of Dec 2025 */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${playfair.variable} ${montserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}