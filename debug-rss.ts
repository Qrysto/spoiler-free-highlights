import { fetchChannelVideos } from './lib/youtube';

async function run() {
  console.log('Fetching videos...');
  const videos = await fetchChannelVideos();
  console.log(`Found ${videos.length} videos.`);
  
  videos.forEach(v => {
    console.log(`- [${v.published}] ${v.title}`);
  });
}

run();

