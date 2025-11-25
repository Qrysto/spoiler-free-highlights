/**
 * Utility functions for the application
 */

/**
 * Calculate relative time from a date to now
 * @param date - The date to compare
 * @returns A human-readable relative time string (e.g., "2 days ago", "in 3 hours")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMs < 0) {
    // Future match
    const absDays = Math.abs(diffDays);
    const absHours = Math.abs(diffHours);
    
    if (absDays > 0) {
      return `in ${absDays} day${absDays !== 1 ? 's' : ''}`;
    } else if (absHours > 0) {
      return `in ${absHours} hour${absHours !== 1 ? 's' : ''}`;
    } else {
      return 'starting soon';
    }
  } else {
    // Past match
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  }
}

