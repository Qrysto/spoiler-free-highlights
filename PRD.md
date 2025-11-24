# Product Requirements Document (PRD)

## Project Overview
**Project Name:** Spoiler-Free Highlights
**Goal:** A personal web application to watch Manchester United match highlights without spoilers (scores, thumbnails, titles).
**Target User:** The developer (personal use), specifically a Manchester United fan who misses live games.

## Core Features

### 1. Spoiler-Free Experience
- **No Scores:** Match results must not be shown on the listing or player.
- **No Spoilers in Metadata:** Video thumbnails and titles must be hidden or replaced.
- **"Safe" Listing:** The UI should present matches as "Man Utd vs Opponent" only.

### 2. Highlight Video Integration
- **Source:** YouTube.
- **Preferred Channel:** [@KplusSportsOfficial](https://www.youtube.com/@KplusSportsOfficial).
- **Method:** Use public RSS feed (No API Key required).
- **Matching:** Automatically find the correct video for a fixture.

### 3. Fixture Management
- **Data Source:** Hybrid approach.
    - Primary: Local `data/fixtures.json` file.
    - Updater: Script/Button to fetch from public ICS calendars (e.g., fixtur.es).
- **Spotlight:** prominent display of the *latest* match.
- **History/Future:** List of recent past matches and upcoming fixtures.

## User Flow
1. **Landing:** User opens the app.
2. **Dashboard:** Sees the "Latest Match" card (e.g., "Man Utd vs Everton").
3. **Action:** User clicks "Watch Highlights".
4. **Viewing:** A modal or page opens with the YouTube video embedded.
    - The embed is stripped of related videos and info.
    - A generic overlay prevents seeing the initial YouTube thumbnail.
5. **Maintenance:** If data is stale, User clicks "Refresh Fixtures" to pull fresh data.

## Constraints
- **No Paid APIs:** Must use free, public data sources.
- **No Complex Scraping:** Avoid fragile HTML scraping; use RSS/ICS.
- **Tech Stack:** Next.js 14 (App Router), Tailwind CSS.

