export const isImageType = (type: string) => {
  return type.startsWith('image/');
}
export const isAudioType = (type: string) => {
  return type.startsWith('audio/');
}
export const isVideoType = (type: string) => {
  return type.startsWith('video/');
}