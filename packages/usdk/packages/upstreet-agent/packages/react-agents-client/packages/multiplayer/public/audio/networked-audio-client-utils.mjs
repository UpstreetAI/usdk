import {UPDATE_METHODS} from '../update-types.mjs';

export const handlesMethod = method => {
  return [
    UPDATE_METHODS.AUDIO,
    UPDATE_METHODS.AUDIO_START,
    UPDATE_METHODS.AUDIO_END,
  ].includes(method);
};