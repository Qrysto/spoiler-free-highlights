'use client';

import { useState, useTransition } from 'react';
import { searchHighlights } from '@/actions/search-highlights';
import { Video } from '@/lib/types';
import { Play, Search, Loader2, Eye, Clock, User, Calendar } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';

interface SearchResultsProps {
  query: string;
  matchDate: string; // ISO string
  opponentName?: string;
}

function parseRelativeTime(timeStr: string): Date {
  const now = new Date();
  const num = parseInt(timeStr.match(/\d+/)?.[0] || '0');
  
  if (timeStr.includes('second')) now.setSeconds(now.getSeconds() - num);
  else if (timeStr.includes('minute')) now.setMinutes(now.getMinutes() - num);
  else if (timeStr.includes('hour')) now.setHours(now.getHours() - num);
  else if (timeStr.includes('day')) now.setDate(now.getDate() - num);
  else if (timeStr.includes('week')) now.setDate(now.getDate() - (num * 7));
  else if (timeStr.includes('month')) now.setMonth(now.getMonth() - num);
  else if (timeStr.includes('year')) now.setFullYear(now.getFullYear() - num);
  
  return now;
}

function formatTimeDifference(videoDateStr: string, matchDateStr: string): string {
  // videoDateStr is like "2 weeks ago"
  const videoDate = parseRelativeTime(videoDateStr);
  const matchDate = new Date(matchDateStr);
  
  const diffMs = videoDate.getTime() - matchDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < -24) {
    const days = Math.round(Math.abs(diffHours / 24));
    return `Posted ${days} day${days > 1 ? 's' : ''} before match`;
  } else if (diffHours < 0) {
    const hours = Math.round(Math.abs(diffHours));
    return `Posted ${hours} hour${hours > 1 ? 's' : ''} before match`;
  } else if (diffHours < 24) {
    const hours = Math.round(diffHours);
    if (hours === 0) return 'Posted shortly after match';
    return `Posted ${hours} hour${hours > 1 ? 's' : ''} after match`;
  } else {
    const days = Math.round(diffHours / 24);
    return `Posted ${days} day${days > 1 ? 's' : ''} after match`;
  }
}

export function SearchResults({ query, matchDate, opponentName }: SearchResultsProps) {
  const [results, setResults] = useState<Video[] | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    startTransition(async () => {
      const videos = await searchHighlights(query, opponentName, matchDate);
      setResults(videos);
    });
  };

  if (selectedVideoId) {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => setSelectedVideoId(null)}
          className="text-sm text-gray-400 hover:text-white underline"
        >
          ← Back to results
        </button>
        <VideoPlayer videoId={selectedVideoId} />
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800 dark:bg-gray-900 rounded-xl p-8 border border-gray-700 dark:border-gray-800">
      {!results && !isPending && (
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">Video not found</p>
          <p className="text-gray-500 mb-6">
            We couldn't automatically find a highlight video from the preferred channel.
          </p>
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            <Search size={18} />
            Search YouTube for Alternatives
          </button>
        </div>
      )}

      {isPending && (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Searching for highlights...</p>
        </div>
      )}

      {results && !isPending && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Alternative Results (Spoilers Hidden)
          </h3>
          
          {results.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">No videos found.</p>
          ) : (
            results.map((video) => {
              const timeDiff = formatTimeDifference(video.published, matchDate);
              const isSuspicious = timeDiff.includes('before');

              return (
                <div 
                  key={video.id}
                  onClick={() => setSelectedVideoId(video.id)}
                  className="flex items-center justify-between p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-600 group"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-red-400 font-medium group-hover:text-red-300">
                      <Play size={16} fill="currentColor" />
                      <span>Watch Video</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                          <User size={12} />
                          <span>{video.channel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{video.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                          <Eye size={12} />
                          <span>{video.views} views</span>
                      </div>
                      <div className={`flex items-center gap-1 ${isSuspicious ? 'text-yellow-500' : 'text-green-400'}`}>
                          <Calendar size={12} />
                          <span>{timeDiff}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                    Title Hidden
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
