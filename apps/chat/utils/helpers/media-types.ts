export const isImageType = (type: string) => {
  return !!type && type.startsWith('image/');
}
export const isAudioType = (type: string) => {
  return !!type && type.startsWith('audio/');
}
export const isVideoType = (type: string) => {
  return !!type && type.startsWith('video/');
}