import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Valley Somm — Wine Country Trip Survey',
  description: 'Help us understand what makes wine trips great (and what doesn\'t). 4-minute survey, enter to win a $50 gift card by Jan 20.',
  openGraph: {
    title: 'Wine Country Trip Survey',
    description: 'Help us understand what makes wine trips great. 4 minutes, anonymous, enter by Jan 20 to win a $50 gift card.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-12RY5VL0J6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-12RY5VL0J6');
          `}
        </Script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
