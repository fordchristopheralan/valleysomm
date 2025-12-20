import './globals.css'

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
      <body className="antialiased">{children}</body>
    </html>
  )
}
