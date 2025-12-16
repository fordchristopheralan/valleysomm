import { Metadata } from 'next';
import { getTrailById } from '@/lib/db/trails';
import TrailPageClient from './TrailPageClient';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const trail = await getTrailById(params.id);

    if (!trail) {
      return {
        title: 'Trail Not Found | Valley Somm',
        description: 'This wine trail could not be found.',
      };
    }

    const wineryNames = trail.wineries
      ?.map((w: any) => w.name)
      .join(', ') || '';

    return {
      title: `${trail.trailName} | Valley Somm`,
      description: `${trail.summary} ${wineryNames ? `Featuring ${wineryNames}` : ''}`,
      openGraph: {
        title: trail.trailName,
        description: trail.summary,
        type: 'article',
        url: `/trails/${params.id}`,
        siteName: 'Valley Somm',
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

export default function TrailPage({ params }: Props) {
  return <TrailPageClient params={params} />;
}