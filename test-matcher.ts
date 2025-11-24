import { fetchChannelVideos } from './lib/youtube';
import { findHighlightCandidates } from './lib/matcher';

async function testMatcher() {
  const videos = await fetchChannelVideos();
  
  console.log(`K+ RSS Feed has ${videos.length} videos.`);
  console.log('Date range:');
  if (videos.length > 0) {
    console.log('  Newest:', videos[0].published, '-', videos[0].title.substring(0, 50));
    console.log('  Oldest:', videos[videos.length - 1].published, '-', videos[videos.length - 1].title.substring(0, 50));
  }
  
  // Test with Tottenham match from Nov 8
  const tottenhamFixture = {
    id: 'test',
    date: '2025-11-08T12:30:00.000Z',
    opponent: 'Tottenham Hotspur',
    homeTeam: 'Tottenham Hotspur',
    awayTeam: 'Manchester United',
    competition: 'Premier League',
    isHome: false
  };
  
  const candidates = findHighlightCandidates(tottenhamFixture, videos);
  console.log(`\nMatches for Tottenham (Nov 8): ${candidates.length}`);
  candidates.forEach(v => console.log(`  - ${v.published}: ${v.title.substring(0, 60)}`));
}

testMatcher();

