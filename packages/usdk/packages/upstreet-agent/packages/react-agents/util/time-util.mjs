import jsAgo from 'js-ago';

export const timeAgo = (timestamp) => {
  const timestampInSeconds = Math.floor(timestamp.getTime() / 1000); // convert the timestamp to seconds since Unix epoch for better processing

  // get the current time in seconds for when this function is called
  const now = new Date();
  const nowInSeconds = Math.floor(now.getTime() / 1000);

  // ensure the timestamp is not in the future
  const adjustedTimestampInSeconds = Math.min(timestampInSeconds, nowInSeconds);

  console.log('adjustedTimestampInSeconds', adjustedTimestampInSeconds);
  console.log('jsAgo', jsAgo);
  return jsAgo.default(adjustedTimestampInSeconds, { format: 'short' });
}