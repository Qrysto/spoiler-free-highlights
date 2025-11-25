# Product Requirements Document (PRD)

## Project Overview

**Project Name:** Spoiler-Free United  
**Goal:** A personal web application to watch Manchester United match highlights without spoilers (scores, thumbnails, titles).  
**Target User:** The developer (personal use), specifically a Manchester United fan who misses live games.

## Core Features

### 1. Spoiler-Free Experience

- **No Scores:** Match results are never displayed on the listing or player
- **No Spoilers in Metadata:** Video thumbnails and titles are hidden or truncated
- **Safe Listing:** UI presents matches as "Team A vs Team B" with dates and times only
- **Hidden Video Titles:** YouTube player title bar is covered with a CSS overlay
- **Controlled Title Reveal:** For K+ videos, titles can be partially revealed with adjustable character limits

### 2. Highlight Video Integration

#### Primary Source: K+ Sports Official
- **Channel:** [@KplusSportsOfficial](https://www.youtube.com/@KplusSportsOfficial)
- **Method:** RSS feed (no API key required)
- **Matching:** Smart algorithm that filters by:
  - Opponent name keywords
  - Manchester United keywords (Man Utd, MU, Manchester United, Man United)
  - Time window (-1 to +12 hours from match time)
- **Multiple Results:** Shows all matching videos from K+ with title truncation
- **Title Reveal Control:** Users can increase/decrease revealed characters (default: 16 chars or up to first `|` character)

#### Fallback: YouTube Search
- **Trigger:** When K+ channel has no matching videos
- **Library:** `youtube-sr` for broader search
- **Filters:**
  - Date range: 7 days before to 48 hours after match
  - Keywords: Opponent name + United keywords
  - Excludes: Preview, prediction, FIFA/PES gameplay videos
- **Display:** Shows channel name, duration, views, and relative upload time
- **Spoiler Protection:** Titles and thumbnails remain hidden

### 3. Fixture Management

- **Data Source:** Hybrid approach
  - Primary storage: Local `data/fixtures.json` file
  - Updater: "Refresh Fixtures" button fetches from public ICS calendars
  - Sources: ics.fixtur.es (primary), Sky Sports (fallback)
- **Latest Match Spotlight:** Hero section prominently displays the most recent match
- **Match Lists:**
  - Recent Results: Past matches sorted by date
  - Upcoming Fixtures: Future matches sorted by date
- **Relative Time Display:** Shows "2 days ago", "in 3 hours", etc. for all matches
- **Competition Display:** Shows Premier League (or detected competition) for each match

### 4. User Interface

- **Dark Mode:** Toggle between light and dark themes with persistent preference
- **Responsive Design:** Works on desktop and mobile devices
- **Match Cards:** Display:
  - Date and time (formatted and relative)
  - Home/Away indicator (Old Trafford or Away)
  - Team names with United highlighted in red
  - Action buttons (Watch Highlights or Search Highlights)
- **Video Player:**
  - Click-to-reveal overlay before playback
  - CSS overlay hides YouTube title bar during playback
  - Spoiler-free mode indicator

## User Flows

### Flow 1: Watch Latest Match Highlights (K+ Available)
1. User opens the app
2. Sees hero section with latest match (e.g., "Manchester United vs Everton")
3. Clicks "Watch Highlights" button
4. Navigates to match page
5. Sees multiple K+ video options with partially hidden titles
6. Can adjust title reveal slider to see more/less
7. Clicks on preferred video
8. Video player shows "Click to Reveal" overlay
9. Clicks to start playback with title bar hidden

### Flow 2: Search for Highlights (K+ Not Available)
1. User opens the app
2. Sees match card with "Search Highlights" button
3. Clicks button and navigates to match page
4. Sees "Video not found" message
5. Clicks "Search YouTube for Alternatives" button
6. System searches and displays results with:
   - Channel name, duration, views
   - Relative upload time (e.g., "Posted 3 hours after match")
   - Hidden titles/thumbnails
7. User selects a video
8. Video plays with spoiler protection

### Flow 3: Refresh Fixture Data
1. User clicks "Refresh Fixtures" button in header
2. System fetches latest data from ICS sources
3. Updates `fixtures.json` with new/updated matches
4. Page reloads showing updated fixture list
5. Success/error message displayed

### Flow 4: Toggle Dark Mode
1. User clicks theme toggle button in header
2. UI switches between light and dark themes
3. Preference is saved and persists across sessions

## Technical Constraints

- **No Paid APIs:** Must use free, public data sources only
- **No Complex Scraping:** Use RSS/ICS feeds, avoid fragile HTML scraping
- **Personal Use:** Optimized for single user, not production scale
- **Fresh Data:** Minimal caching to ensure latest videos are available
- **No Spoilers:** All UI elements must prevent accidental score/result reveals

## Success Criteria

- ✅ User can watch highlights without seeing scores
- ✅ Videos from K+ Sports are automatically found and matched
- ✅ Fallback search works when K+ doesn't have videos
- ✅ Fixture data stays reasonably up-to-date
- ✅ UI is clean, fast, and spoiler-free
- ✅ Works on both light and dark modes
- ✅ Relative time displays help user understand match recency
