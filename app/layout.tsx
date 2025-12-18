import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valley Somm - Plan Your Perfect Yadkin Valley Wine Trip",
  description:
    "AI-powered wine trip planning for North Carolina's Yadkin Valley. Get personalized winery recommendations and optimized itineraries in minutes.",
  keywords: [
    "Yadkin Valley",
    "wine trip",
    "winery tour",
    "North Carolina wine",
    "wine tasting",
    "trip planner",
  ],
  openGraph: {
    title: "Valley Somm - Your AI Wine Trip Planner",
    description:
      "Plan your perfect Yadkin Valley wine adventure with personalized AI recommendations.",
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
      <body className="min-h-screen bg-cream antialiased">{children}</body>
    </html>
  );
}
