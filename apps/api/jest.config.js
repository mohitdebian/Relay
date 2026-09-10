/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  clearMocks: true,
  moduleNameMapper: {
    '^jwks-rsa$': '<rootDir>/__mocks__/jwks-rsa.js'
  },
};
