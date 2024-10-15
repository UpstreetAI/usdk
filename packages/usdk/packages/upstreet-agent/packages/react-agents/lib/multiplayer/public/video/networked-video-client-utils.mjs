import {UPDATE_METHODS} from '../update-types.mjs';

export const handlesMethod = method => {
  return [
    UPDATE_METHODS.VIDEO,
    UPDATE_METHODS.VIDEO_START,
    UPDATE_METHODS.VIDEO_END,
  ].includes(method);
};