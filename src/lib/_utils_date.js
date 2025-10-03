// src/lib/_utils_date.js

/**
 * Formats an ISO date string (like "YYYY-MM-DD") into a readable locale string.
 * This helper is crucial for displaying dates across the app (Matters, Dashboard).
 * @param {string | null} isoDate - The date string in 'YYYY-MM-DD' format.
 * @returns {string} The formatted date string (e.g., "15 Dec 2024") or '—'.
 */
export function format(isoDate) {
  if (!isoDate) return '—'
  try {
    // Append 'T00:00:00' to treat the date as local time to prevent timezone issues
    const d = new Date(isoDate + 'T00:00:00')
    return d.toLocaleDateString(undefined, {
      year: 'numeric', 
      month: 'short', 
      day: '2-digit'
    })
  } catch {
    // Fallback if the date is invalid
    return isoDate
  }
}