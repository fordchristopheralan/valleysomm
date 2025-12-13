import Image from 'next/image';
import { Playfair_Display, Montserrat } from 'next/font/google';
import MapSection from '@/components/MapSection';
import WineryDirectory from '@/components/WineryDirectory';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'] });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '600'] });

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F0E1] text-[#333333]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/hero.jpg"  // Replace with a real Yadkin image URL (e.g., upload to /public or Unsplash)
          alt="Rolling vineyards of Yadkin Valley"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className={`${playfair.className} text-6xl md:text-8xl text-[#F5F0E1] mb-6 drop-shadow-lg`}>
            Valley Somm
          </h1>
          <p className={`${montserrat.className} text-xl md:text-3xl text-[#F5F0E1] mb-10 drop-shadow`}>
            Your AI Sommelier for Yadkin Valley & Beyond
          </p>
          <button className="bg-[#6B2737] text-[#F5F0E1] px-10 py-5 rounded-full text-lg font-semibold hover:bg-[#D4A017] transition shadow-lg">
            Join the Waitlist
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className={`${playfair.className} text-5xl mb-12 text-[#6B2737]`}>
          Discover Wine Country Smarter
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h3 className={`${montserrat.className} text-2xl font-bold mb-4 text-[#3A5F3F]`}>AI Recommendations</h3>
            <p>Personalized winery and wine suggestions tailored to your tastes.</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h3 className={`${montserrat.className} text-2xl font-bold mb-4 text-[#3A5F3F]`}>Interactive Trails</h3>
            <p>Explore Yadkin Valley with real-time maps, events, and routes.</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h3 className={`${montserrat.className} text-2xl font-bold mb-4 text-[#3A5F3F]`}>Virtual Sommelier</h3>
            <p>Chat for expert pairings, history, and hidden gems.</p>
          </div>
        </div>
      </section>

      {/* Winery Map Section */}


<center>
<MapSection />
</center>

      {/* Winery Directory Section */}

<center>
<WineryDirectory />
</center>

      {/* Footer */}
      <footer className="bg-[#6B2737] text-[#F5F0E1] py-10 text-center">
        <p>&copy; 2025 Valley Somm. All rights reserved.</p>
      </footer>
    </main>
  );
}