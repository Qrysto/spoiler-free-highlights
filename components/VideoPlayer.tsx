'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-2xl group">
        {/* 
          The "Magic" Overlay:
          This div sits ON TOP of the iframe's top bar.
          It blocks clicks on the title (so you can't open it on YT easily)
          and covers the text with a black gradient.
          pointer-events-none ensures you can still click play/pause in the center/bottom,
          but we use a specific height to just cover the top title bar.
        */}
        <div className="absolute top-0 left-0 right-0 h-[60px] bg-black z-20 pointer-events-none" />
        
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`}
          className="absolute top-0 left-0 w-full h-full border-0 z-10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ marginTop: '-1px' }} // Small tweak to ensure no white bleed
        />
      </div>
    );
  }

  return (
    <div 
      onClick={() => setIsPlaying(true)}
      className="relative w-full pt-[56.25%] bg-gray-900 rounded-xl overflow-hidden shadow-xl cursor-pointer group"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
          <Play fill="white" size={32} className="ml-1" />
        </div>
        <p className="font-medium text-lg text-gray-200">Click to Reveal Highlights</p>
        <p className="text-sm text-gray-400 mt-2">Spoiler-free mode active</p>
      </div>
    </div>
  );
}
