import { Fixture } from '@/lib/types';
import { getRelativeTime } from '@/lib/utils';
import { CalendarDays, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

interface MatchCardProps {
  fixture: Fixture;
  hasVideo?: boolean;
}

export function MatchCard({ fixture, hasVideo }: MatchCardProps) {
  const date = new Date(fixture.date);
  const formattedDate = date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh'
  });
  const formattedTime = date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  });
  const relativeTime = getRelativeTime(date);
  // Compare dates in Vietnam timezone
  const nowVietnam = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const dateVietnam = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const isPast = dateVietnam.getTime() < nowVietnam.getTime();

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
