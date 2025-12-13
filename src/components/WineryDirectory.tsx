import { playfair } from '@/app/layout'; // If needed, or use className

export default function WineryDirectory() {
  return (
    <section className="py-20 px-6 bg-white">
      <h2 className="text-5xl text-center mb-12 text-[#6B2737] font-playfair">
        Yadkin Valley Winery Directory
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {wineries.map((winery) => (
          <div key={winery.id} className="bg-[#F5F0E1] rounded-lg shadow-xl p-6 hover:shadow-2xl transition">
            <h3 className="text-2xl font-bold text-[#6B2737] mb-2">{winery.name}</h3>
            <p className="text-gray-700 mb-4">{winery.description}</p>
            <a
              href={winery.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#6B2737] text-[#F5F0E1] px-6 py-3 rounded-full hover:bg-[#D4A017] transition"
            >
              Visit Website →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}