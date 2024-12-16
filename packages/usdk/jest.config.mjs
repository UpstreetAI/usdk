export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.mjs'],
  transform: {},
  moduleFileExtensions: ['js', 'mjs', 'json'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.mjs$': '$1.mjs'
  }
};
