/**
 * Format numeric value as Indian Rupees with proper comma delimiters
 * e.g., 129999 -> "₹1,29,999"
 */
export function formatPrice(num) {
  const value = Number(num) || 0;
  return '₹' + value.toLocaleString('en-IN');
}

/**
 * Format string or date object into standard readable Indian calendar format
 * e.g., "Day, DD Month YYYY"
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';
  const dateObj = new Date(dateInput);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return dateObj.toLocaleDateString('en-IN', options);
}

/**
 * Truncates text fields cleanly with ellipsis marker
 */
export function truncateText(text, length = 60) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
