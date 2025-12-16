import { Metadata } from 'next';
import TrailPageClient from './TrailPageClient';
import { getTrailById } from '@/lib/db/trails';

type Props = {
  params: { id: string };
};

// Server-side metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
const trail = await getTrailById(params.id);

    if (!response.ok) {
      return {
        title: 'Trail Not Found | Valley Somm',
        description: 'This wine trail could not be found.',
      };
    }

    const trail = await response.json();

    const wineryNames = trail.stops?.map((s: any) => s.winery.name).join(', ') || '';

    return {
      title: `${trail.trailName} | Valley Somm`,
      description: `${trail.summary} Featuring ${wineryNames}`,
      openGraph: {
        title: trail.trailName,
        description: trail.summary,
        type: 'article',
        url: `/trails/${params.id}`,
        images: [
          {
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: trail.trailName,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: trail.trailName,
        description: trail.summary,
        images: ['/og-image.jpg'],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Valley Somm Wine Trails',
      description: 'AI-powered wine trail planning for Yadkin Valley',
    };
  }
}

// Server component that renders the client component
export default function TrailPage({ params }: Props) {
  return <TrailPageClient params={params} />;
}
