import recursiveCopy from 'recursive-copy';

export const recursiveCopyAll = async (src, dst) => recursiveCopy(src, dst, {
  dot: true,
  junk: true,
});