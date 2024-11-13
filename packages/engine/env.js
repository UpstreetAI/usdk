export const isProd = import.meta.env?.MODE === 'production';
export const isWorker = !globalThis.window;
export const isMultiplayer = isProd || !!import.meta.env?.VITE_MULTIPLAYER;
