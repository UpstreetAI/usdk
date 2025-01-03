/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  testMatch: [
    '**/test/?(*.)+(spec|test).[jt]s?(x)',
  ],
};