import { getLocalFixtures } from '@/lib/data';
import { fetchChannelVideos } from '@/lib/youtube';
import { findHighlightVideo } from '@/lib/matcher';
import { VideoPlayer } from '@/components/VideoPlayer';
import { SearchResults } from '@/components/SearchResults';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const fixtures = await getLocalFixtures();
  const fixture = fixtures.find(f => f.id === decodedId);

  if (!fixture) {
    notFound();
  }

  const videos = await fetchChannelVideos();
  const video = findHighlightVideo(fixture, videos);

  const date = new Date(fixture.date);

  return (
    <main className="min-h-screen bg-gray-900 dark:bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Fixtures
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {fixture.homeTeam} <span className="text-red-500">vs</span> {fixture.awayTeam}
          </h1>
          <div className="flex items-center gap-4 text-gray-400">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} />
              <span>{date.toLocaleDateString('en-GB', { dateStyle: 'full' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>{fixture.isHome ? 'Old Trafford' : 'Away'}</span>
            </div>
          </div>
        </div>

        {video ? (
          <VideoPlayer videoId={video.id} />
        ) : (
          <SearchResults 
            query={`Man United vs ${fixture.opponent} highlight`} 
            matchDate={fixture.date}
            opponentName={fixture.opponent}
          />
        )}
      </div>
    </main>
  );
}
