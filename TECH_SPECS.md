# Technical Specifications

## Technology Stack

- **Framework:** Next.js 16.0.3 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Theming:** next-themes (dark mode support)
- **Runtime:** Node.js (Server Actions for data fetching)

## Dependencies

### Core
- `next` 16.0.3 - React framework with App Router
- `react` 19.2.0 - UI library
- `react-dom` 19.2.0 - React DOM renderer

### Data Fetching
- `fast-xml-parser` 5.3.2 - Parse YouTube RSS feeds
- `node-ical` 0.22.1 - Parse ICS calendar files
- `youtube-sr` 4.3.12 - YouTube search without API keys

### UI
- `lucide-react` 0.554.0 - Icon library
- `next-themes` 0.4.6 - Dark mode management
- `tailwindcss-animate` 1.0.7 - Animation utilities

## Data Architecture

### 1. Fixtures (Local JSON Storage)

**File:** `data/fixtures.json`

**Schema:**
```typescript
interface Fixture {
  id: string;           // Unique identifier from ICS
  date: string;         // ISO 8601 format
  opponent: string;     // Opponent team name
  homeTeam: string;     // Home team full name
  awayTeam: string;     // Away team full name
  competition: string;  // e.g., "Premier League"
  isHome: boolean;      // True if Man Utd is home team
  score?: string;       // Optional, not displayed in UI
}
```

**Update Mechanism:**
- Triggered by user clicking "Refresh Fixtures" button
- Fetches from ICS calendar sources via Server Action
- Validates data before overwriting file
- Revalidates Next.js cache after update

### 2. Video Data (YouTube RSS)

**Schema:**
```typescript
interface Video {
  id: string;           // YouTube video ID
  title: string;        // Full video title (hidden in UI)
  link: string;         // YouTube URL
  published: string;    // ISO 8601 publish date
  thumbnail?: string;   // Thumbnail URL (not displayed)
  // Extended fields for search results
  channel?: string;     // Channel name
  duration?: string;    // Video duration (e.g., "9:35")
  views?: string;       // View count (e.g., "346k")
}
```

**K+ Sports RSS Feed:**
- URL: `https://www.youtube.com/feeds/videos.xml?channel_id=UC9xeuekJd88ku9LDcmGdUOA`
- Cache: 1 minute revalidation
- Returns: Latest 15 videos from channel

**YouTube Search (Fallback):**
- Uses `youtube-sr` library
- Limit: 30 results, filtered to top 10
- Sorted by: View count (descending)

## Core Algorithms

### Video Matching Algorithm (`lib/matcher.ts`)

**Purpose:** Find K+ Sports videos that match a specific fixture

**Logic:**
1. **Time Window Filter:**
   - Video must be published between -1 hour before match and +12 hours after
   - Accounts for K+ typical upload speed (within hours of match end)

2. **Opponent Name Filter:**
   - Extract opponent name words (length > 2)
   - Normalize: lowercase, remove special characters
   - Check if video title contains any opponent word

3. **United Keywords Filter:**
   - Keywords: "manutd", "manchesterunited", "manunited", "mu"
   - Video title must contain at least one keyword

4. **Sorting:**
   - Sort matches by publish date (newest first)
   - Return all matches (not just first)

**Example:**
```typescript
// Match: Man United vs Everton, 2025-11-24T20:00:00Z
// Video: "Highlight Man United - Everton | ...", published 2025-11-24T23:10:00Z
// Result: ✅ Match (3.17 hours after, has "everton", has "manunited")
```

### Search Filtering Algorithm (`actions/search-highlights.ts`)

**Purpose:** Find relevant highlight videos across YouTube

**Filters:**
1. **Date Filter:**
   - Parse YouTube's relative time strings ("2 hours ago")
   - Accept videos from 7 days before to 48 hours after match
   - Rejects videos too old or too late

2. **Keyword Filter:**
   - Must contain opponent name words (excluding "United", "FC")
   - Must contain United keywords
   - Excludes: preview, prediction, fifa, pes, efootball

3. **Sorting:**
   - Sort by view count (descending)
   - Return top 10 results

## Component Architecture

### Pages

**`app/page.tsx`** (Home/Dashboard)
- Export: `dynamic = 'force-dynamic'` (no static caching)
- Fetches: Local fixtures + K+ RSS videos
- Displays: Hero match, recent results, upcoming fixtures
- Components: `<HeroMatch>`, `<MatchCard>`, `<RefreshButton>`, `<ThemeToggle>`

**`app/match/[id]/page.tsx`** (Match Detail)
- Export: `dynamic = 'force-dynamic'` (always fresh data)
- Params: Match ID (URL-decoded to handle special characters)
- Logic:
  1. Load fixture by ID
  2. Fetch K+ videos
  3. Find matching candidates
  4. If matches found: Show `<MultipleResults>`
  5. If no matches: Show `<SearchResults>` with fallback search
- Components: `<MultipleResults>`, `<SearchResults>`, `<VideoPlayer>`

### Components

**`components/HeroMatch.tsx`**
- Props: `fixture`, `video`
- Displays: Latest match in hero section
- Features: Relative time, competition badge, action button
- Styling: Red gradient background, large typography

**`components/MatchCard.tsx`**
- Props: `fixture`, `hasVideo`
- Displays: Individual match in list view
- Features: Date/time, relative time, home/away indicator
- Action: "Watch Highlights" or "Search Highlights" button

**`components/MultipleResults.tsx`** (K+ Videos)
- Props: `videos[]`
- Features:
  - Title truncation (at `|` or configurable char limit)
  - Reveal slider (↑/↓ buttons to show more/less)
  - Video selection
  - Integrates `<VideoPlayer>`
- Spoiler Protection: Titles partially hidden, no thumbnails

**`components/SearchResults.tsx`** (YouTube Search)
- Props: `query`, `matchDate`, `opponentName`
- Features:
  - "Search YouTube" button
  - Loading state
  - Result list with metadata (channel, duration, views, upload time)
  - Video selection
  - Integrates `<VideoPlayer>`
- Spoiler Protection: Titles/thumbnails completely hidden

**`components/VideoPlayer.tsx`**
- Props: `videoId`
- States: `isPlaying` (boolean)
- Before Play: "Click to Reveal" overlay with play button
- During Play:
  - YouTube iframe with autoplay
  - CSS overlay (`h-[60px]`, `z-20`) covers title bar
  - Parameters: `autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`

**`components/RefreshButton.tsx`**
- Triggers: `updateFixtures()` Server Action
- States: Loading, success, error
- Revalidates: Home page after update

**`components/theme-toggle.tsx`**
- Uses: `next-themes` hook
- Toggles: light/dark mode
- Icon: Sun/Moon with smooth transition
- Persists: User preference in localStorage

### Server Actions

**`actions/update-fixtures.ts`**
- Function: `updateFixtures()`
- Process:
  1. Call `fetchFixtures()` from `lib/ics.ts`
  2. Validate: Check for non-empty array
  3. Write: Save to `data/fixtures.json`
  4. Revalidate: Clear Next.js cache for `/`
- Returns: `{ success: boolean, message: string }`

**`actions/search-highlights.ts`**
- Function: `searchHighlights(query, opponentName?, matchDate?)`
- Process:
  1. Search YouTube using `youtube-sr`
  2. Filter by date range (if matchDate provided)
  3. Filter by keywords (if opponentName provided)
  4. Sort by views
  5. Format and return top 10
- Returns: `Video[]`

### Library Modules

**`lib/ics.ts`** - ICS Calendar Parsing
- Function: `fetchFixtures()`
- Sources:
  - Primary: `https://ics.fixtur.es/v2/manchester-united.ics`
  - Fallback: Sky Sports calendar
- Process:
  1. Fetch ICS file
  2. Parse with `node-ical`
  3. Extract VEVENT entries
  4. Parse summary for team names
  5. Determine home/away
  6. Sort by date (descending)
- Returns: `Fixture[]`

**`lib/youtube.ts`** - YouTube RSS Fetching
- Function: `fetchChannelVideos()`
- Cache: 60 seconds revalidation
- Process:
  1. Fetch RSS XML
  2. Parse with `fast-xml-parser`
  3. Extract video entries
  4. Map to `Video` objects
- Returns: `Video[]`

**`lib/matcher.ts`** - Video Matching Logic
- Function: `findHighlightCandidates(fixture, videos)`
- Algorithm: See "Video Matching Algorithm" above
- Returns: `Video[]` (sorted by date)

**`lib/data.ts`** - Local Data Access
- Function: `getLocalFixtures()`
- Reads: `data/fixtures.json`
- Returns: `Fixture[]` (empty array on error)

**`lib/utils.ts`** - Utility Functions
- Function: `getRelativeTime(date)`
- Returns: Human-readable relative time string
- Examples: "2 days ago", "in 3 hours", "just now"

**`lib/types.ts`** - TypeScript Interfaces
- Exports: `Fixture`, `Video`
- Shared across entire application

## Styling & Theming

### Tailwind CSS v4 Configuration

**`app/globals.css`:**
```css
@import "tailwindcss";
@plugin "tailwindcss-animate";

@variant dark (&:where(.dark, .dark *));

:root {
  --background: #ffffff;
  --foreground: #171717;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}
```

### Color Scheme

**Light Mode:**
- Background: White/Gray-50
- Text: Gray-900
- Accents: Red-600 (Man United), Blue-600 (upcoming)

**Dark Mode:**
- Background: Black/Gray-900
- Text: Gray-100
- Accents: Red-400 (Man United), Blue-400 (upcoming)

### Responsive Design
- Mobile-first approach
- Breakpoints: `md:` (768px+) for larger screens
- Flexible grid layouts for match cards

## Performance Optimizations

1. **Dynamic Rendering:**
   - Pages use `force-dynamic` to bypass static generation
   - Ensures users always see latest data

2. **Minimal Caching:**
   - RSS feed: 1 minute cache
   - Balances freshness with API rate limits

3. **Efficient Matching:**
   - String normalization done once per video
   - Early returns in filter functions
   - Sorted results prevent unnecessary processing

4. **Code Splitting:**
   - Client components marked with `'use client'`
   - Server components default (lighter initial bundle)

## Security & Privacy

- **No User Data:** Application stores no user information
- **No Tracking:** No analytics or tracking scripts
- **Public APIs Only:** All data from public RSS/ICS feeds
- **No Authentication:** Personal use, no login required

## Development Workflow

1. **Local Development:** `npm run dev` (port 3000)
2. **Type Checking:** TypeScript strict mode enabled
3. **Linting:** ESLint with Next.js config
4. **Git Workflow:** Descriptive commits, clean history

## Directory Structure

```
spolier-free-highlights/
├── actions/
│   ├── search-highlights.ts    # YouTube search Server Action
│   └── update-fixtures.ts      # ICS fetch Server Action
├── app/
│   ├── globals.css             # Tailwind + theme config
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx                # Home page (dashboard)
│   └── match/[id]/
│       └── page.tsx            # Match detail page
├── components/
│   ├── HeroMatch.tsx           # Latest match hero section
│   ├── MatchCard.tsx           # Individual match card
│   ├── MultipleResults.tsx     # K+ video list with reveal
│   ├── RefreshButton.tsx       # Fixture refresh trigger
│   ├── SearchResults.tsx       # YouTube search fallback
│   ├── theme-provider.tsx      # next-themes wrapper
│   ├── theme-toggle.tsx        # Dark mode toggle button
│   └── VideoPlayer.tsx         # Spoiler-free video embed
├── data/
│   └── fixtures.json           # Local fixture storage (5591 lines)
├── lib/
│   ├── data.ts                 # Local data access
│   ├── ics.ts                  # ICS calendar parsing
│   ├── matcher.ts              # Video matching algorithm
│   ├── types.ts                # TypeScript interfaces
│   ├── utils.ts                # Shared utilities
│   └── youtube.ts              # RSS feed fetching
├── public/                     # Static assets
├── PRD.md                      # Product requirements
├── TECH_SPECS.md               # This document
├── README.md                   # Project documentation
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript config
```

## Future Enhancements (Not Implemented)

- Multi-team support (currently Man United only)
- User preferences (preferred channels, default reveal length)
- Video quality selection
- Offline mode with cached videos
- Push notifications for new highlights
- Match statistics (without spoilers)
