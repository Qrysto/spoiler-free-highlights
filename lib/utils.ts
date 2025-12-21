/**
 * Utility functions for the application
 */

/**
 * Calculate relative time from a date to now (comparing times as displayed in Vietnam timezone)
 * @param date - The date to compare
 * @returns A human-readable relative time string (e.g., "2 days ago", "in 3 hours")
 */
export function getRelativeTime(date: Date): string {
  // Get current time and input date as strings in Vietnam timezone, then parse back to compare
  // This ensures we're comparing the "local" representation in Vietnam timezone
  const now = new Date();
  const nowVietnamStr = now.toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const dateVietnamStr = date.toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Parse the Vietnam timezone strings back to Date objects for comparison
  // Format is "MM/DD/YYYY, HH:mm:ss"
  const parseVietnamDate = (str: string) => {
    const [datePart, timePart] = str.split(", ");
    const [month, day, year] = datePart.split("/").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const nowVietnam = parseVietnamDate(nowVietnamStr);
  const dateVietnam = parseVietnamDate(dateVietnamStr);
  const diffMs = nowVietnam.getTime() - dateVietnam.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    // Future match
    const absDays = Math.abs(diffDays);
    const absHours = Math.abs(diffHours);

    if (absDays > 0) {
      return `in ${absDays} day${absDays !== 1 ? "s" : ""}`;
    } else if (absHours > 0) {
      return `in ${absHours} hour${absHours !== 1 ? "s" : ""}`;
    } else {
      return "starting soon";
    }
  } else {
    // Past match
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    } else {
      return "just now";
    }
  }
}
