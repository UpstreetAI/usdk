export const isGuid = (guid) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(guid);
};
export const makeZeroGuid = () => '00000000-0000-0000-0000-000000000000';
