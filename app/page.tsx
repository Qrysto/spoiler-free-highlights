import { getLocalFixtures } from "@/lib/data";
import { fetchChannelVideos } from "@/lib/youtube";
import { findHighlightVideo } from "@/lib/matcher";
import { HeroMatch } from "@/components/HeroMatch";
import { MatchCard } from "@/components/MatchCard";
import { RefreshButton } from "@/components/RefreshButton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Fixture } from "@/lib/types";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

export default async function Home() {
  const fixtures = await getLocalFixtures();
  const videos = await fetchChannelVideos();

  // Get current time in Vietnam timezone
  const now = new Date();
  const nowVietnam = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  // Sort all fixtures by date descending
  const sortedFixtures = [...fixtures].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Past matches (played before now in Vietnam timezone)
  const pastMatches = sortedFixtures.filter((f) => {
    const fixtureDate = new Date(f.date);
    const fixtureVietnam = new Date(
      fixtureDate.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    return fixtureVietnam.getTime() < nowVietnam.getTime();
  });

  // Upcoming matches (played after now in Vietnam timezone, sorted ascending for display?)
  // Usually fixtures list is sorted by date.
  const upcomingMatches = sortedFixtures
    .filter((f) => {
      const fixtureDate = new Date(f.date);
      const fixtureVietnam = new Date(
        fixtureDate.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
      );
      return fixtureVietnam.getTime() >= nowVietnam.getTime();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const latestMatch = pastMatches[0];
  const latestVideo = latestMatch
    ? findHighlightVideo(latestMatch, videos)
    : null;

  // Other past matches (excluding the latest one)
  const recentMatches = pastMatches.slice(1, 7); // Show last 6 matches

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Spoiler-Free United
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <RefreshButton />
          </div>
        </div>

        {latestMatch ? (
          <HeroMatch fixture={latestMatch} video={latestVideo} />
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-10">
            <p className="text-gray-500 dark:text-gray-400">
              No recent matches found. Try refreshing the schedule.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Recent Results
            </h2>
            <div className="space-y-4">
              {recentMatches.length > 0 ? (
                recentMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    fixture={match}
                    hasVideo={!!findHighlightVideo(match, videos)}
                  />
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No other recent matches.
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Upcoming Fixtures
            </h2>
            <div className="space-y-4">
              {upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => (
                  <MatchCard key={match.id} fixture={match} />
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No upcoming fixtures scheduled.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
