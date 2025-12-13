import Image from 'next/image';
import { wineries } from '@/data/wineries';

export default function WineryDirectory() {
  return (
    <section className="py-20 px-6 bg-white">
      <h2 className="text-5xl text-center mb-12 text-[#6B2737] font-playfair">
        Yadkin Valley Winery Directory
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {wineries.map((winery) => (
          <div
            key={winery.id}
            className="bg-[#F5F0E1] rounded-lg shadow-xl overflow-hidden flex flex-col h-full hover:shadow-2xl transition"
          >
            {/* Image Container with Fallback */}
            <div className="relative w-full h-64">
              {winery.photoUrl ? (
                <Image
                  src={winery.photoUrl}
                  alt={`${winery.name} - Yadkin Valley winery`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}  // Optional: load lazily unless top cards
                />
              ) : null}
              {/* Fallback placeholder - always rendered, but covered by valid image */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-400 rounded-t-lg">
                <span className="text-gray-500 text-lg font-medium">No image available</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold text-[#6B2737] mb-3">
                {winery.name}
              </h3>
              <p className="text-gray-700 mb-6 flex-grow">
                {winery.description}
              </p>
              <a
                href={winery.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#6B2737] text-[#F5F0E1] px-6 py-3 rounded-full hover:bg-[#D4A017] transition text-center font-medium"
              >
                Visit Website →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}