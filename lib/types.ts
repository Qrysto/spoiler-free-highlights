export interface Fixture {
  id: string;
  date: string; // ISO 8601 string
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
  published: string; // ISO date
  thumbnail?: string; // We might fetch it but not show it
}
