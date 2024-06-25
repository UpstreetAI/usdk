const validResponses = [
  'y',
  'yes',
]


export function isYes(text) {
  return validResponses.includes(String(text).toLowerCase());
}
