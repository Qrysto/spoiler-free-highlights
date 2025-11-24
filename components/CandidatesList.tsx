'use client';

import { useState } from 'react';
import { Video } from '@/lib/types';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Play } from 'lucide-react';

interface CandidatesListProps {
  videos: Video[];
  defaultVideo: Video;
}

export function CandidatesList({ videos, defaultVideo }: CandidatesListProps) {
  const [selectedVideoId, setSelectedVideoId] = useState<string>(defaultVideo.id);
  const [revealCount, setRevealCount] = useState(16);

  // Deduplicate videos based on ID
  const uniqueVideos = videos.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  const handleSelectVideo = (id: string) => {
    setSelectedVideoId(id);
  };

  const toggleReveal = () => {
    setRevealCount(prev => prev >= 100 ? 16 : prev + 10);
  };

  // Helper to truncate title safely
  const getTruncatedTitle = (title: string) => {
    // Find first pipe '|'
    const pipeIndex = title.indexOf('|');
    const cutoff = pipeIndex !== -1 ? pipeIndex : revealCount;
    
    // If pipe is earlier than revealCount, use pipe index.
    // Otherwise use revealCount.
    // BUT user logic: "OR the first 16 characters, whichever comes first."
    // AND "increase or decrease... to reveal more".
    
    // Base logic: Math.min(first_pipe, reveal_count)
    let limit = revealCount;
    if (pipeIndex !== -1 && pipeIndex < limit) {
        // If pipe exists and is within current visibility range, we cut there?
        // Or does the user want to "unlock" past the pipe?
        // "titles cut off to the first | character ... OR the first 16 characters, whichever comes first"
        // This implies strict upper bound.
        limit = Math.min(limit, pipeIndex);
    }
    
    // However, if I click "Increase", I want to see MORE. 
    // So the "whichever comes first" logic applies to the *initial* state.
    // If I explicitly increase revealCount, I should be able to override the pipe?
    // Let's assume the pipe is a "soft" delimiter.
    
    // Let's implement strict logic requested: "first | OR first 16 chars".
    // Then the button increases the "16 chars" part.
    
    const effectiveLimit = (pipeIndex !== -1 && pipeIndex < revealCount) ? pipeIndex : revealCount;
    
    return title.substring(0, effectiveLimit) + (title.length > effectiveLimit ? '...' : '');
  };

  return (
    <div className="space-y-8">
      <VideoPlayer videoId={selectedVideoId} />

      {uniqueVideos.length > 1 && (
        <div className="bg-gray-800 dark:bg-gray-900 rounded-xl p-6 border border-gray-700 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Available Highlights ({uniqueVideos.length})
            </h3>
            <button 
              onClick={toggleReveal}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              {revealCount >= 100 ? 'Reset Titles' : 'Reveal More Text'}
            </button>
          </div>

          <div className="space-y-3">
            {uniqueVideos.map(video => {
              const isSelected = video.id === selectedVideoId;
              return (
                <button
                  key={video.id}
                  onClick={() => handleSelectVideo(video.id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors text-left group ${
                    isSelected 
                      ? 'bg-red-900/30 border border-red-700/50' 
                      : 'bg-gray-700/30 hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300 group-hover:bg-gray-500'
                  }`}>
                    <Play size={14} fill="currentColor" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isSelected ? 'text-red-200' : 'text-gray-300'}`}>
                      {getTruncatedTitle(video.title)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(video.published).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

