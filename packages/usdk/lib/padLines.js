/**
 * Pad each line of a string.
 */
export function padLines( string, count = 0, padString = ' ') {
  return string.replace(/^/gm, padString.repeat(count));
}
