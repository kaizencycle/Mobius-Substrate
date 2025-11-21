/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  setupFilesAfterEnv: [],
  clearMocks: true,
  moduleNameMapper: {
    '^nanoid$': '<rootDir>/test/mocks/nanoid.ts',
  },
};

