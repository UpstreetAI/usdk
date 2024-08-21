import {UPDATE_METHODS} from '../update-types.mjs';

export const handlesMethod = method => {
  return [
    UPDATE_METHODS.VIDEO,
  ].includes(method);
};