import YouTube from 'youtube-sr';

async function testSearch() {
  const videos = await YouTube.search('Manchester United vs Tottenham highlight', { limit: 1, type: 'video' });
  console.log(JSON.stringify(videos[0], null, 2));
}

testSearch();

