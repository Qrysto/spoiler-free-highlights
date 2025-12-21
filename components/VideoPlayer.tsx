"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPlaying || !containerRef.current || !iframeRef.current) {
      setIsFullscreen(false);
      return;
    }

    const container = containerRef.current;
    const iframe = iframeRef.current;

    const checkFullscreen = () => {
      const fullscreenEl =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      const isFs = !!fullscreenEl;

      // If our container is fullscreen, that's what we want - just update state
      if (isFs && fullscreenEl === container) {
        setIsFullscreen(true);
        return; // Don't interfere with our own fullscreen
      }

      // If iframe itself went fullscreen (not the container), intercept it
      if (isFs && fullscreenEl === iframe) {
        // Exit iframe fullscreen immediately
        const exitFullscreen = () => {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
          } else if ((document as any).mozCancelFullScreen) {
            (document as any).mozCancelFullScreen();
          } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
          }
        };

        exitFullscreen();

        // Then make our container fullscreen after a brief delay
        setTimeout(() => {
          if (container.requestFullscreen) {
            container.requestFullscreen().catch(() => {});
          } else if ((container as any).webkitRequestFullscreen) {
            (container as any).webkitRequestFullscreen();
          } else if ((container as any).mozRequestFullScreen) {
            (container as any).mozRequestFullScreen();
          } else if ((container as any).msRequestFullscreen) {
            (container as any).msRequestFullscreen();
          }
        }, 50);
        return;
      }

      // Update fullscreen state
      setIsFullscreen(isFs);
    };

    const handleFullscreenChange = () => {
      setTimeout(checkFullscreen, 10);
    };

    // Check initial state
    checkFullscreen();

    // Listen for all fullscreen change events (cross-browser)
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // Also check more frequently to catch iframe fullscreen attempts quickly
    const interval = setInterval(checkFullscreen, 100);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
      clearInterval(interval);
      setIsFullscreen(false);
    };
  }, [isPlaying]);

  const handleContainerFullscreen = async () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    try {
      if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).mozRequestFullScreen) {
        (container as any).mozRequestFullScreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
    } catch (err) {
      console.error("Error entering fullscreen:", err);
    }
  };

  if (isPlaying) {
    return (
      <>
        <div
          ref={containerRef}
          className="video-player-container relative w-full bg-black overflow-hidden shadow-2xl group rounded-xl"
          style={{ paddingTop: "56.25%" }}
        >
          {/* 
            The "Magic" Overlay for normal mode:
            This div sits ON TOP of the iframe's top bar.
            It blocks clicks on the title (so you can't open it on YT easily)
            and covers the text with a black gradient.
            pointer-events-none ensures you can still click play/pause in the center/bottom,
            but we use a specific height to just cover the top title bar.
          */}
          {/* Overlay for normal mode */}
          {!isFullscreen && (
            <div
              className="absolute top-0 left-0 right-0 bg-black pointer-events-none"
              style={{ height: "60px", zIndex: 999999 }}
            />
          )}

          {/* Overlay for fullscreen mode - MUST be inside fullscreen container */}
          {isFullscreen && (
            <div
              className="absolute top-0 left-0 right-0 bg-black pointer-events-none fullscreen-title-overlay"
              style={{
                height: "120px",
                zIndex: 2147483647,
                width: "100%",
              }}
            />
          )}

          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=0`}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ marginTop: "-1px", zIndex: 1 }} // Lower z-index than overlay
          />

          {/* Custom fullscreen button */}
          {!isFullscreen && (
            <button
              onClick={handleContainerFullscreen}
              className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white p-2 rounded z-30 transition-colors"
              title="Enter fullscreen (spoiler-free)"
              aria-label="Enter fullscreen"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          )}

          {/* Exit fullscreen button (shown in fullscreen mode) */}
          {isFullscreen && (
            <button
              onClick={async () => {
                if (document.exitFullscreen) {
                  await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                  (document as any).webkitExitFullscreen();
                } else if ((document as any).mozCancelFullScreen) {
                  (document as any).mozCancelFullScreen();
                } else if ((document as any).msExitFullscreen) {
                  (document as any).msExitFullscreen();
                }
              }}
              className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white p-2 rounded z-30 transition-colors"
              title="Exit fullscreen"
              aria-label="Exit fullscreen"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            </button>
          )}
        </div>
      </>
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
        <p className="font-medium text-lg text-gray-200">
          Click to Reveal Highlights
        </p>
        <p className="text-sm text-gray-400 mt-2">Spoiler-free mode active</p>
      </div>
    </div>
  );
}
