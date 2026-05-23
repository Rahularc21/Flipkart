/**
 * Utility to generate a stable, readable Flipkart-style order ID
 * Returns "FK-" followed by 8 random alphanumeric/uppercase characters.
 */
export function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 8; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FK-${randomStr}`;
}
