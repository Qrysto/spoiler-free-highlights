import { Fixture, Video } from "@/lib/types";
import { getRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { Play, Clock } from "lucide-react";

interface HeroMatchProps {
  fixture: Fixture;
  video: Video | null;
}

export function HeroMatch({ fixture, video }: HeroMatchProps) {
  const date = new Date(fixture.date);
  const relativeTime = getRelativeTime(date);
  // Compare dates in Vietnam timezone
  const nowVietnam = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
  const dateVietnam = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
  const isPast = dateVietnam.getTime() < nowVietnam.getTime();

  return (
    <div className="bg-gradient-to-br from-red-700 to-red-900 text-white rounded-xl p-8 shadow-lg mb-10">
      <div className="text-red-200 text-sm font-medium mb-2 uppercase tracking-wider">
        Latest Match
      </div>

      <h1 className="text-3xl md:text-5xl font-bold mb-6">
        {fixture.homeTeam} <span className="text-red-300 mx-2">vs</span>{" "}
        {fixture.awayTeam}
      </h1>

      <div className="flex items-center gap-4 text-red-100 mb-4">
        <span>
          {date.toLocaleDateString("vi-VN", {
            dateStyle: "full",
            timeZone: "Asia/Ho_Chi_Minh",
          })}
        </span>
        <span>•</span>
        <span>{fixture.competition || "Premier League"}</span>
      </div>

      <div className="flex items-center gap-2 mb-8">
        <Clock
          size={16}
          className={isPast ? "text-red-200" : "text-blue-300"}
        />
        <span
          className={`text-sm font-medium ${
            isPast ? "text-red-200" : "text-blue-300"
          }`}
        >
          {relativeTime}
        </span>
      </div>

      {video ? (
        <Link
          href={`/match/${fixture.id}`}
          className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 text-red-900 dark:text-red-100 px-6 py-3 rounded-full font-bold text-lg hover:bg-red-50 dark:hover:bg-gray-800 transition-transform hover:scale-105 shadow-lg"
        >
          <Play fill="currentColor" size={20} />
          Watch Highlights
        </Link>
      ) : (
        <Link
          href={`/match/${fixture.id}`}
          className="inline-flex items-center gap-2 bg-red-800/50 border border-red-400/30 text-white px-6 py-3 rounded-full font-medium hover:bg-red-800 transition-colors"
        >
          Check Availability / Search
        </Link>
      )}
    </div>
  );
}
