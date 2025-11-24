'use server';

import YouTube from 'youtube-sr';
import { Video } from '@/lib/types';

export async function searchHighlights(query: string, opponentName?: string, matchDate?: string): Promise<Video[]> {
  try {
    console.log(`Searching YouTube for: ${query}`);
    // Fetch more results to allow for filtering
    const results = await YouTube.search(query, { 
      limit: 20,
      type: 'video',
      safeSearch: true 
    });

    let filtered = results;

    if (opponentName) {
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const oppNorm = normalize(opponentName);
      
      // Logic: If opponent has "United" in name, we cannot rely on "united" keyword alone for Man Utd.
      // We need strictly "man" or "mu" or "reddevils".
      const opponentHasUnited = oppNorm.includes('united');

      const unitedKeywords = opponentHasUnited 
        ? ['manutd', 'manchester', 'manunited', 'mu', 'reddevils', 'mufc']
        : ['manutd', 'manchesterunited', 'manunited', 'united', 'mu', 'reddevils', 'mufc'];

      filtered = filtered.filter(v => {
        if (!v.title) return false;
        const titleNorm = normalize(v.title);

        // Check for opponent name
        // We split into words to handle "Nottingham Forest" -> "nottingham" or "forest"
        const oppWords = opponentName.toLowerCase().split(' ').filter(w => w.length > 2);
        // We also ignore common generic words if they appear in opponent name (e.g. "FC", "City" - wait, City is important for Man City vs Leicester City)
        // But "United" is common. If opponent is "Newcastle United", matching just "United" is bad.
        // So we filter out "united" from opponent words if we are using it for matching.
        const oppWordsForMatching = oppWords.filter(w => w !== 'united' && w !== 'fc' && w !== 'afc');
        
        const hasOpponent = oppWordsForMatching.some(word => titleNorm.includes(normalize(word)));
        
        if (!hasOpponent) return false;

        // Check for Manchester United
        const hasUnited = unitedKeywords.some(k => titleNorm.includes(k));
        if (!hasUnited) return false;

        // Exclude obvious junk
        if (titleNorm.includes('preview') || titleNorm.includes('prediction') || titleNorm.includes('fifa') || titleNorm.includes('pes') || titleNorm.includes('efootball')) {
          return false;
        }

        return true;
      });
    }

    // Sort by views (descending) to get the most popular/likely official highlights
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));

    return filtered.slice(0, 10).map(v => ({
      id: v.id || '',
      title: v.title || '', // We keep title in data but UI hides it
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
