export const blob2img = (blob: Blob) => new Promise<HTMLImageElement>((accept, reject) => {
  const img = new Image();
  img.onload = () => {
    accept(img);
    cleanup();
  };
  img.onerror = err => {
    reject(err);
    cleanup();
  };
  const src = URL.createObjectURL(blob);
  img.src = src;
  const cleanup = () => {
    URL.revokeObjectURL(src);
  };
});