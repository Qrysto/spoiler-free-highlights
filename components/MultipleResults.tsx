"use client";

import { useState } from "react";
import { Video } from "@/lib/types";
import { Play, ChevronUp, ChevronDown } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";

interface MultipleResultsProps {
  videos: Video[];
}

function truncateTitle(title: string, maxChars: number): string {
  // K+ channel uses | to separate parts (e.g., "TEAM1 - TEAM2 | DETAILS | LEAGUE")
  // We want to cut at the first |, or at maxChars, whichever comes first
  const pipeIndex = title.indexOf("|");

  if (pipeIndex > 0 && pipeIndex < maxChars) {
    return title.substring(0, pipeIndex).trim();
  }

  return title.substring(0, maxChars);
}

export function MultipleResults({ videos }: MultipleResultsProps) {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [revealLength, setRevealLength] = useState(16);

  const increaseReveal = () =>
    setRevealLength((prev) => Math.min(prev + 10, 200));
  const decreaseReveal = () =>
    setRevealLength((prev) => Math.max(prev - 10, 10));

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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Found {videos.length} possible highlight
          {videos.length !== 1 ? "s" : ""}
        </h3>
        <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-md">
          <button
            onClick={decreaseReveal}
            disabled={revealLength <= 10}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed text-gray-300"
            title="Show less of title"
          >
            <ChevronDown size={16} />
          </button>
          <span className="text-xs text-gray-400 px-2 min-w-[60px] text-center">
            {revealLength} chars
          </span>
          <button
            onClick={increaseReveal}
            disabled={revealLength >= 200}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed text-gray-300"
            title="Show more of title"
          >
            <ChevronUp size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {videos.map((video) => {
          const truncated = truncateTitle(video.title, revealLength);
          const isFullTitle = truncated === video.title;

          return (
            <div
              key={video.id}
              onClick={() => setSelectedVideoId(video.id)}
              className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-700 hover:border-gray-600 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 text-red-400 font-medium group-hover:text-red-300 mb-2">
                  <Play size={16} fill="currentColor" />
                  <span>Watch Video</span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-gray-300">
                    {truncated}
                    {!isFullTitle && "..."}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>K+ Sports Official</span>
                  <span>•</span>
                  <span>
                    {new Date(video.published).toLocaleString("vi-VN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Ho_Chi_Minh",
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
