export interface Fixture {
  id: string;
  date: string;
  opponent: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  isHome: boolean;
  score?: string;
}

export interface Video {
  id: string;
  title: string;
  link: string;
  published: string;
  thumbnail?: string;
  // Extended fields for search results
  channel?: string;
  duration?: string;
  views?: string;
}
