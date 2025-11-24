import { Fixture, Video } from './types';

export function findHighlightVideo(fixture: Fixture, videos: Video[]): Video | null {
  if (!videos.length) return null;

  const fixtureDate = new Date(fixture.date);
  const matchDateStr = fixtureDate.toISOString().split('T')[0]; // YYYY-MM-DD

  // Normalize strings for comparison
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const opponentNorm = normalize(fixture.opponent);
  const unitedKeywords = ['manutd', 'manchesterunited', 'manunited', 'united', 'mu'];

  // Filter videos that are relevant
  const candidates = videos.filter(video => {
    const videoDate = new Date(video.published);
    
    // Check if video was published AFTER or ON the match date
    // Allow a small buffer (e.g., match started late night, video published early morning)
    // Actually, let's just say video must be published within -1 day (rare) to +3 days of match.
    const diffTime = videoDate.getTime() - fixtureDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (diffDays < -0.5 || diffDays > 3) return false;

    const titleNorm = normalize(video.title);

    // Must contain opponent name
    if (!titleNorm.includes(opponentNorm)) {
        // Try partial match if opponent name is long? 
        // For now strict inclusion of normalized string.
        // E.g. "Crystal Palace" -> "crystalpalace"
        return false;
    }

    // Must contain United keyword
    const hasUnited = unitedKeywords.some(k => titleNorm.includes(k));
    if (!hasUnited) return false;

    return true;
  });

  // If multiple candidates, pick the one closest to match time? Or just the first one found?
  // Usually there's only one "Highlight" video.
  // We might want to prefer "Highlights" or "Goals" in title?
  // User wants "Highlight video".
  
  // Sort by publish date (earliest valid video usually is the highlight? or latest?)
  // Let's just return the first one for now.
  return candidates.length > 0 ? candidates[0] : null;
}

