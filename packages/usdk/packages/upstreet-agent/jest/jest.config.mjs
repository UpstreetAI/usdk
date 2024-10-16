export default {
  preset: 'ts-jest',
  transform: {},
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  setupFilesAfterEnv: ['./jest.setup.mjs'],
};
