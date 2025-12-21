import './globals.css'

export const metadata = {
  title: 'ValleySomm — Wine Country Trip Survey',
  description: 'Help us understand what makes wine trips great (and what doesn\'t). Your AI sommelier for unforgettable Yadkin Valley wine adventures.',
  openGraph: {
    title: 'ValleySomm — Wine Country Trip Survey',
    description: 'Help us understand what makes wine trips great. 4 minutes, anonymous, enter by Jan 20 to win a $50 gift card.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
        <head>
            <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-12RY5VL0J6"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-12RY5VL0J6');
</script>
</head>
      <body className="antialiased font-body">{children}</body>
    </html>
  )
}
