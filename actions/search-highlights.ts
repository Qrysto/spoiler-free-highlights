'use server';

import YouTube from 'youtube-sr';
import { Video } from '@/lib/types';

// Helper to parse relative time string to Date
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

export async function searchHighlights(query: string, opponentName?: string, matchDate?: string): Promise<Video[]> {
  try {
    console.log(`Searching YouTube for: ${query}`);
    
    // Fetch MORE results to enable stricter date filtering
    const results = await YouTube.search(query, { 
      limit: 30, 
      type: 'video',
      safeSearch: true 
    });

    let filtered = results;

    // 1. Date Filtering (Corrected)
    if (matchDate) {
      const matchTime = new Date(matchDate).getTime();
      
      filtered = filtered.filter(v => {
        if (!v.uploadedAt) return false; // Keep videos without date just in case? No, safer to remove.
        
        const videoTime = parseRelativeTime(v.uploadedAt).getTime();
        const diff = videoTime - matchTime;
        
        // The issue with "relative time" from YouTube is it's imprecise.
        // "2 weeks ago" could be 14 days ago OR 20 days ago (rounded down).
        // "1 month ago" could be 30 days or 50 days.
        
        // If match was "2 weeks ago" (Nov 8 vs today Nov 24), 
        // a video posted "2 weeks ago" is highly likely to be the one.
        // But my previous logic: `diff < -2h` (video older than match) might be flagging it 
        // if "2 weeks ago" (video) is slightly "older" than "Nov 8" (match).
        
        // FIX: Be much more lenient with "past" videos because relative time is rounded.
        // If a video says "2 weeks ago" and match was 16 days ago, diff is negative (video seems older).
        // But it's likely the right video.
        
        // Instead of strict "after match", let's just ensure it's NOT from the FAR future (impossible)
        // or the FAR past (e.g. 1 year ago for a match yesterday).
        
        // Allow window: [MatchTime - 4 days, MatchTime + 4 days] 
        // This covers "preview" videos (which we filter by title later) 
        // and highlights posted slightly later.
        // The "2 weeks ago" rounding error is the main culprit. 
        
        const fourDaysMs = 4 * 24 * 60 * 60 * 1000;
        
        // Actually, simple check: 
        // Is the video timestamp within REASONABLE range of match date?
        // If video says "1 year ago" and match was "today", clearly wrong.
        
        // Check if video is wildly older than match (e.g. more than 7 days before match)
        const isWayTooOld = diff < -(7 * 24 * 60 * 60 * 1000);
        
        // Check if video is wildly newer than match? 
        // If match was 1 year ago, and video is "1 hour ago", it's spam/fake.
        // But usually we search for recent matches.
        // Let's just filter out "Way Too Old".
        
        if (isWayTooOld) return false;
        
        return true;
      });
    }

    // 2. Keyword Filtering
    if (opponentName) {
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const unitedKeywords = ['manutd', 'manchester', 'manunited', 'mu', 'reddevils', 'mufc']; 

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
      channel: v.channel?.name || 'N/A',
      duration: v.durationFormatted || 'N/A',
      views: v.views ? `${(v.views / 1000).toFixed(1)}k` : '0'
    }));
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}
