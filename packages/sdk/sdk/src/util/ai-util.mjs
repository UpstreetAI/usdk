let aiFetch = globalThis.fetch;
export const setAiFetch = (_aiFetch) => {
  aiFetch = _aiFetch;
};
export const getAiFetch = () => aiFetch;
