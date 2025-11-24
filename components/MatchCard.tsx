import { Fixture } from '@/lib/types';
import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';

interface MatchCardProps {
  fixture: Fixture;
  hasVideo?: boolean;
}

export function MatchCard({ fixture, hasVideo }: MatchCardProps) {
  const date = new Date(fixture.date);
  const formattedDate = date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <CalendarDays size={14} />
          <span>{formattedDate} • {formattedTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span>{fixture.isHome ? 'Old Trafford' : 'Away'}</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1 mb-4">
        <div className={`text-lg font-semibold ${fixture.homeTeam.includes('United') ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
          {fixture.homeTeam}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">vs</div>
        <div className={`text-lg font-semibold ${fixture.awayTeam.includes('United') ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
          {fixture.awayTeam}
        </div>
      </div>

      {hasVideo ? (
        <Link 
          href={`/match/${fixture.id}`}
          className="block w-full text-center bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium transition-colors"
        >
          Watch Highlights
        </Link>
      ) : (
        <Link 
          href={`/match/${fixture.id}`}
          className="block w-full text-center border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-md font-medium transition-colors"
        >
          Search Highlights
        </Link>
      )}
    </div>
  );
}

