# Technical Specifications

## Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Runtime:** Node.js (Server Actions)

## Data Architecture

### 1. Fixtures (JSON)
**File:** `data/fixtures.json`
**Schema:**
```typescript
interface Fixture {
  id: string;
  date: string; // ISO 8601
  opponent: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  isHome: boolean;
}
```

### 2. Calendar Fetching (ICS)
**Library:** `node-ical` (or custom regex parser if lighter).
**Source URLs:**
- Primary: `https://ics.fixtur.es/v2/manchester-united.ics` (or similar validated URL).
- Fallback: `webcal://www.skysports.com/calendars/football/fixtures/teams/manchester-united` (converted to https).

### 3. Video Fetching (RSS)
**Source:** `https://www.youtube.com/feeds/videos.xml?channel_id=UC9xeuekJd88ku9LDcmGdUOA`
**Process:**
1. Fetch XML.
2. Parse to JSON (using `fast-xml-parser` or similar).
3. Filter for relevant videos.
4. **Matching Algorithm:**
   - Normalize strings (lowercase, remove accents).
   - Check if video title contains "Man Utd" OR "Manchester United" AND "Opponent Name".

## Components Structure

### `app/page.tsx`
- Fetches `fixtures.json`.
- Calls `getLatestVideo()` (server-side).
- Renders `<HeroMatch match={latest} video={video} />`.
- Renders `<FixtureList matches={others} />`.

### `components/HeroMatch.tsx`
- Large card.
- "Reveal" button if video exists.

### `components/VideoPlayer.tsx`
- `iframe` based.
- URL: `https://www.youtube.com/embed/{videoId}?rel=0&modestbranding=1&controls=1&showinfo=0`

### `actions/update-fixtures.ts`
- Server Action.
- Fetches ICS.
- Parses.
- Writes to `data/fixtures.json`.
- Revalidates path `/`.

## Directory Structure
```
/
├── app/
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── MatchCard.tsx
│   ├── VideoPlayer.tsx
│   └── RefreshButton.tsx
├── lib/
│   ├── ics.ts        # Calendar logic
│   ├── youtube.ts    # RSS logic
│   └── matcher.ts    # Business logic
├── data/
│   └── fixtures.json
└── public/
```

