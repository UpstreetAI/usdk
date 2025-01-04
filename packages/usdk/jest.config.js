/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transformIgnorePatterns: [],
  testMatch: [
    '**/test/?(*.)+(spec|test).[jt]s?(x)',
  ],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};