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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Valley Somm - AI-Powered Yadkin Valley Wine Trails',
    template: '%s | Valley Somm'
  },
  description: 'Create personalized wine trails through North Carolina\'s Yadkin Valley in under 2 minutes. AI-powered recommendations matching your taste, schedule, and preferences.',
  keywords: [
    'Yadkin Valley wineries',
    'North Carolina wine trails',
    'wine tasting NC',
    'Yadkin Valley wine tours',
    'AI wine recommendations',
    'personalized wine trail',
    'NC wine country',
    'Elkin NC wineries',
    'Mount Airy wineries'
  ],
  authors: [{ name: 'Valley Somm' }],
  creator: 'Valley Somm',
  publisher: 'Valley Somm',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Valley Somm',
    title: 'Valley Somm - AI-Powered Yadkin Valley Wine Trails',
    description: 'Create personalized wine trails through North Carolina\'s Yadkin Valley in under 2 minutes.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Valley Somm - Yadkin Valley Wine Trails',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Valley Somm - AI-Powered Wine Trails',
    description: 'Personalized Yadkin Valley wine trails in under 2 minutes',
    images: ['/og-image.jpg'],
    creator: '@valleysomm',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
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