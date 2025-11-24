import ical from 'node-ical';
import { Fixture } from './types';

const PRIMARY_ICS_URL = 'https://ics.fixtur.es/v2/manchester-united.ics';
const FALLBACK_ICS_URL = 'https://calendar.google.com/calendar/ical/manutd%40gmail.com/public/basic.ics'; // Just a placeholder/example if needed, but we'll stick to primary for now or use the Sky Sports one.

const SKY_SPORTS_ICS = 'https://www.skysports.com/calendars/football/fixtures/teams/manchester-united';

export async function fetchFixtures(): Promise<Fixture[]> {
  try {
    // Try primary source first
    const fixtures = await fetchAndParseICS(PRIMARY_ICS_URL);
    if (fixtures.length > 0) return fixtures;
    throw new Error('No fixtures found in primary source');
  } catch (error) {
    console.error('Primary source failed, trying fallback...', error);
    try {
      // Try fallback (Sky Sports needs webcal replaced with https if strictly webcal)
      // Sky sports link is usually webcal://...
      const fallbackUrl = SKY_SPORTS_ICS.replace('webcal://', 'https://');
      return await fetchAndParseICS(fallbackUrl);
    } catch (fallbackError) {
      console.error('Fallback source failed', fallbackError);
      return [];
    }
  }
}

async function fetchAndParseICS(url: string): Promise<Fixture[]> {
  const events = await ical.async.fromURL(url);
  const fixtures: Fixture[] = [];

  for (const key in events) {
    const event = events[key];
    if (event.type === 'VEVENT') {
      const summary = event.summary;
      const start = event.start;
      const uid = event.uid;

      if (!summary || !start) continue;

      const fixture = parseFixture(summary, start, uid);
      if (fixture) {
        fixtures.push(fixture);
      }
    }
  }

  // Sort by date descending (newest first) or ascending?
  // Usually for highlights we want newest first.
  return fixtures.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function parseFixture(summary: string, date: Date, uid: string): Fixture | null {
  // Summary formats: "Man Utd vs Everton" or "Man Utd - Everton" or "Everton v Man Utd"
  // We need to identify Man Utd and the opponent.
  
  const normalize = (s: string) => s.toLowerCase().trim();
  const isManUtd = (s: string) => s.includes('man utd') || s.includes('manchester united') || s.includes('man united');

  // Split by common separators
  let parts = summary.split(/\s+vs\.?\s+|\s+-\s+|\s+v\s+/i);
  
  if (parts.length < 2) {
    // Try to parse if it's just space separated? Unlikely for ICS summaries.
    return null;
  }

  const teamA = parts[0].trim();
  const teamB = parts[1].trim();

  let homeTeam = teamA;
  let awayTeam = teamB;
  let opponent = '';
  let isHome = false;

  if (isManUtd(normalize(teamA))) {
    isHome = true;
    opponent = teamB;
    homeTeam = 'Manchester United'; // Standardize name
    awayTeam = teamB;
  } else if (isManUtd(normalize(teamB))) {
    isHome = false;
    opponent = teamA;
    homeTeam = teamA;
    awayTeam = 'Manchester United';
  } else {
    // Man Utd not found in summary? Maybe not a match event.
    return null;
  }

  return {
    id: uid,
    date: date.toISOString(),
    opponent,
    homeTeam,
    awayTeam,
    competition: 'Unknown', // ICS often doesn't have competition in summary, might be in description
    isHome
  };
}

