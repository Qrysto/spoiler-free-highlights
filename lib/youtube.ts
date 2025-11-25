import { XMLParser } from 'fast-xml-parser';
import { Video } from './types';

const CHANNEL_ID = 'UC9xeuekJd88ku9LDcmGdUOA';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export async function fetchChannelVideos(): Promise<Video[]> {
  try {
    const response = await fetch(RSS_URL, { next: { revalidate: 60 } }); // Cache for 1 minute
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: ''
    });
    const result = parser.parse(xmlText);

    const entries = result.feed?.entry;
    if (!entries) return [];

    // entries can be an array or a single object if only one video
    const entriesArray = Array.isArray(entries) ? entries : [entries];

    return entriesArray.map((entry: any) => ({
      id: entry['yt:videoId'],
      title: entry.title,
      link: entry.link?.href,
      published: entry.published,
    }));
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}


