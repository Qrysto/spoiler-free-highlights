# Spoiler-Free United

A web application for watching Manchester United highlight videos without spoilers. View match fixtures, automatically find highlights from your preferred YouTube channel (K+ Sports Official), and watch videos with titles and scores hidden.

## Features

- 🔴 **Latest Match Spotlight**: Featured display of the most recent Manchester United match
- 📅 **Fixture List**: View past results and upcoming matches with relative time display
- 🎥 **Spoiler-Free Video Player**: Watch highlights without seeing titles, thumbnails, or scores
- 🔍 **Smart Video Matching**: Automatically finds highlight videos from K+ Sports Official channel
- 🔎 **Fallback Search**: If K+ videos aren't found, search across YouTube with spoiler protection
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 🔄 **Auto-Refresh**: Fixture data can be refreshed from public ICS calendar sources

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spolier-free-highlights
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### Data Sources

- **Fixtures**: Fetched from public ICS calendar sources (ics.fixtur.es, Sky Sports)
- **Highlights**: Primary source is K+ Sports Official YouTube channel RSS feed
- **Fallback Search**: Uses `youtube-sr` library for broader YouTube searches

### Spoiler Protection

- Video titles are truncated or hidden completely
- Thumbnails are not displayed
- YouTube player title bar is covered with a CSS overlay
- Match scores are never shown

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Theme**: next-themes for dark mode
- **Data**: Local JSON file + Server Actions

## Project Structure

```
├── actions/          # Server Actions (update fixtures, search highlights)
├── app/             # Next.js App Router pages
├── components/      # React components
├── data/            # Local JSON data storage
├── lib/             # Utility functions and types
├── public/          # Static assets
├── PRD.md           # Product Requirements Document
└── TECH_SPECS.md    # Technical Specifications
```

## Documentation

- [PRD.md](./PRD.md) - Product requirements and user stories
- [TECH_SPECS.md](./TECH_SPECS.md) - Technical architecture and decisions

## Development Notes

- Pages are dynamically rendered to ensure fresh data on every load
- RSS feed cache is set to 1 minute for up-to-date video listings
- Match IDs are URL-encoded to handle special characters

## License

This is a personal project for educational purposes.
