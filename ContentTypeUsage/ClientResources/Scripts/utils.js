/**
 * Escapes potentially unsafe HTML characters in a string.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formats a localized string by substituting {0}, {1}, … placeholders.
 * @param {string} template
 * @param {...*} args
 * @returns {string}
 */
export function formatString(template, ...args) {
  return args.reduce(
    (s, arg, i) => s.replace(new RegExp(`\\{${i}\\}`, 'gm'), arg),
    template
  );
}
