import { Fixture } from '@/lib/types';
import { CalendarDays, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

interface MatchCardProps {
  fixture: Fixture;
  hasVideo?: boolean;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMs < 0) {
    // Future match
    const absDays = Math.abs(diffDays);
    const absHours = Math.abs(diffHours);
    
    if (absDays > 0) {
      return `in ${absDays} day${absDays !== 1 ? 's' : ''}`;
    } else if (absHours > 0) {
      return `in ${absHours} hour${absHours !== 1 ? 's' : ''}`;
    } else {
      return 'starting soon';
    }
  } else {
    // Past match
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  }
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
  const relativeTime = getRelativeTime(date);
  const isPast = date.getTime() < Date.now();

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} />
          <span>{formattedDate} • {formattedTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span>{fixture.isHome ? 'Old Trafford' : 'Away'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className={isPast ? 'text-gray-400' : 'text-blue-500'} />
        <span className={`text-xs font-medium ${isPast ? 'text-gray-500 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
          {relativeTime}
        </span>
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
