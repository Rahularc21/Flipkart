/**
 * Formats a raw numeric price value into the standard Indian Rupee (INR) format.
 * Example: 2499 -> ₹2,499
 */
export function formatPrice(price) {
  if (price === undefined || price === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Strips raw date strings into standard Indian local date formats.
 * Example: "2026-05-23T15:30:00.000Z" -> "May 23, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Truncates text fields to prevent line overflows on grid views.
 */
export function truncateText(text, limit = 60) {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.substring(0, limit) + '...';
}
