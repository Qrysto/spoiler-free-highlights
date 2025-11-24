import { Fixture, Video } from '@/lib/types';
import Link from 'next/link';
import { Play } from 'lucide-react';

interface HeroMatchProps {
  fixture: Fixture;
  video: Video | null;
}

export function HeroMatch({ fixture, video }: HeroMatchProps) {
  const date = new Date(fixture.date);

  return (
    <div className="bg-gradient-to-br from-red-700 to-red-900 text-white rounded-xl p-8 shadow-lg mb-10">
      <div className="text-red-200 text-sm font-medium mb-2 uppercase tracking-wider">
        Latest Match
      </div>
      
      <h1 className="text-3xl md:text-5xl font-bold mb-6">
        {fixture.homeTeam} <span className="text-red-300 mx-2">vs</span> {fixture.awayTeam}
      </h1>

      <div className="flex items-center gap-4 text-red-100 mb-8">
        <span>{date.toLocaleDateString('en-GB', { dateStyle: 'full' })}</span>
        <span>•</span>
        <span>{fixture.competition || 'Premier League'}</span>
      </div>

      {video ? (
        <Link 
          href={`/match/${fixture.id}`}
          className="inline-flex items-center gap-2 bg-white text-red-900 px-6 py-3 rounded-full font-bold text-lg hover:bg-red-50 transition-transform hover:scale-105"
        >
          <Play fill="currentColor" size={20} />
          Watch Highlights
        </Link>
      ) : (
        <Link 
          href={`/match/${fixture.id}`}
          className="inline-flex items-center gap-2 bg-red-800/50 border border-red-400/30 text-white px-6 py-3 rounded-full font-medium hover:bg-red-800 transition-colors"
        >
           Check Availability / Search
        </Link>
      )}
    </div>
  );
}

