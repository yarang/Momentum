/**
 * Date Utilities
 *
 * Utility functions for date formatting and manipulation.
 */

/**
 * Format a timestamp to a relative time string (e.g., "2 hours ago")
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string
 */
export function formatDistanceToNow(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else if (weeks < 4) {
    return `${weeks}w ago`;
  } else if (months < 12) {
    return `${months}mo ago`;
  } else {
    return `${years}y ago`;
  }
}

/**
 * Format a timestamp to a date string
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a timestamp to a time string
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a timestamp to a date and time string
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} at ${formatTime(timestamp)}`;
}

/**
 * Check if a date is in the past
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns True if the date is in the past
 */
export function isPast(timestamp: number): boolean {
  return timestamp < Date.now();
}

/**
 * Check if a date is within the next 24 hours
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns True if the date is within the next 24 hours
 */
export function isDueSoon(timestamp: number): boolean {
  const dayInMs = 24 * 60 * 60 * 1000;
  return timestamp > Date.now() && timestamp <= Date.now() + dayInMs;
}

/**
 * Check if a date is overdue
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns True if the date is overdue
 */
export function isOverdue(timestamp: number): boolean {
  return timestamp < Date.now();
}
