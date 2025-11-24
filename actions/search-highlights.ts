'use server';

import YouTube from 'youtube-sr';
import { Video } from '@/lib/types';

// Helper to parse relative time string to Date
function parseRelativeTime(timeStr: string): Date {
  const now = new Date();
  // "2 weeks ago", "1 month ago", "3 days ago"
  // youtube-sr returns relative time from NOW (when search is run)
  
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

export async function searchHighlights(query: string, opponentName?: string, matchDate?: string): Promise<Video[]> {
  try {
    console.log(`Searching YouTube for: ${query}`);
    
    // Fetch MORE results to enable stricter date filtering
    const results = await YouTube.search(query, { 
      limit: 30, // Increased limit
      type: 'video',
      safeSearch: true 
    });

    let filtered = results;

    // 1. Date Filtering (Crucial)
    if (matchDate) {
      const matchTime = new Date(matchDate).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      // Allow videos from 2 hours before match (rare pre-match stuff, but maybe lineup?) 
      // to 36 hours after match (highlights usually immediate).
      // Actually, highlights are POST match. 
      // Let's filter: Must be posted AFTER match start (or very close to it).
      // And within 48 hours AFTER match.
      
      filtered = filtered.filter(v => {
        if (!v.uploadedAt) return false;
        const videoTime = parseRelativeTime(v.uploadedAt).getTime();
        
        // Diff: VideoTime - MatchTime
        const diff = videoTime - matchTime;
        
        // video must be AFTER match start (diff > 0) or slightly before (-2 hours)
        // AND video must be within 36 hours after match
        // const hoursDiff = diff / (1000 * 3600);
        
        // Relaxed logic: 
        // - Exclude anything posted MORE than 12 hours BEFORE match (definitely old preview).
        // - Exclude anything posted MORE than 48 hours AFTER match (old news, or wrong match).
        
        // Wait, if we search for "Man Utd vs Tottenham", and the match was YESTERDAY.
        // A video from "2 years ago" (diff = -huge) should be removed.
        
        // Acceptable window: [MatchTime - 2h, MatchTime + 48h]
        const isTooOld = diff < -(2 * 60 * 60 * 1000); // Posted more than 2h before match
        const isTooLate = diff > (48 * 60 * 60 * 1000); // Posted more than 48h after match (likely analysis or wrong match)

        if (isTooOld || isTooLate) return false;
        
        return true;
      });
    }

    // 2. Keyword Filtering
    if (opponentName) {
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const unitedKeywords = ['manutd', 'manchester', 'manunited', 'mu', 'reddevils', 'mufc']; // Removed strict 'united' logic, simplified

      filtered = filtered.filter(v => {
        if (!v.title) return false;
        const titleNorm = normalize(v.title);

        // Check for opponent name (simplified)
        const oppWords = opponentName.toLowerCase().split(' ').filter(w => w.length > 2 && w !== 'united' && w !== 'fc');
        const hasOpponent = oppWords.some(word => titleNorm.includes(normalize(word)));
        if (!hasOpponent) return false;

        // Check for Man United keywords
        const hasUnited = unitedKeywords.some(k => titleNorm.includes(k));
        if (!hasUnited) return false;

        // Exclude junk
        if (titleNorm.includes('preview') || titleNorm.includes('prediction') || titleNorm.includes('fifa') || titleNorm.includes('pes') || titleNorm.includes('efootball')) {
          return false;
        }

        return true;
      });
    }

    // Sort by views (descending)
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));

    return filtered.slice(0, 10).map(v => ({
      id: v.id || '',
      title: v.title || '',
      link: v.url || '',
      published: v.uploadedAt || '',
      thumbnail: v.thumbnail?.url || undefined,
      channel: v.channel?.name || 'Unknown Channel',
      duration: v.durationFormatted || 'Unknown',
      views: v.views ? `${(v.views / 1000).toFixed(1)}k` : '0'
    }));
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}
