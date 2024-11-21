export const dotenvFormat = (o) => Object.entries(o ?? {})
  .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
  .join('\n');