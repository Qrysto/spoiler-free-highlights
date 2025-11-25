import { Fixture, Video } from "./types";

/**
 * Finds all videos from K+ Sports that match a specific fixture
 * Uses strict filtering: opponent name, United keywords, and time window
 * @param fixture - The match fixture to find videos for
 * @param videos - Array of videos from K+ Sports channel
 * @returns Array of matching videos, sorted by publish date (newest first)
 */
export function findHighlightCandidates(
  fixture: Fixture,
  videos: Video[]
): Video[] {
  if (!videos.length) return [];

  const fixtureDate = new Date(fixture.date);

  // Normalize strings for comparison
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Split opponent into words to handle multi-word names like "Nottingham Forest"
  const opponentWords = fixture.opponent
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length > 2);

  const unitedKeywords = ["manutd", "manchesterunited", "manunited", "mu"];

  // Filter videos that are relevant
  const candidates = videos.filter((video) => {
    const videoDate = new Date(video.published);

    // Stricter date check: Video must be published within a small window around the match
    // K+ typically uploads within hours after the match ends
    const diffTime = videoDate.getTime() - fixtureDate.getTime();
    const diffHours = diffTime / (1000 * 3600);

    // Allow: From 1 hour before match (rare, but maybe early upload) to 12 hours after
    if (diffHours < -1 || diffHours > 12) return false;

    const titleNorm = normalize(video.title);

    // Must contain at least one word from opponent name
    const hasOpponent = opponentWords.some((word) =>
      titleNorm.includes(normalize(word))
    );
    if (!hasOpponent) return false;

    // Must contain United keyword
    const hasUnited = unitedKeywords.some((k) => titleNorm.includes(k));
    if (!hasUnited) return false;

    return true;
  });

  // Sort by publish date (newest first, most likely to be the highlight)
  return candidates.sort(
    (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
  );
}

export function findHighlightVideo(
  fixture: Fixture,
  videos: Video[]
): Video | null {
  const candidates = findHighlightCandidates(fixture, videos);
  return candidates.length > 0 ? candidates[0] : null;
}
