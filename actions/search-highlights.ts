'use server';

import YouTube from 'youtube-sr';
import { Video } from '@/lib/types';

export async function searchHighlights(query: string): Promise<Video[]> {
  try {
    console.log(`Searching YouTube for: ${query}`);
    // Fetch 5 results, focused on videos
    const results = await YouTube.search(query, { 
      limit: 5,
      type: 'video',
      safeSearch: true 
    });

    return results.map(v => ({
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

