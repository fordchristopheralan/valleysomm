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

<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1392125219061950');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1392125219061950&ev=PageView&noscript=1"
/></noscript>

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
