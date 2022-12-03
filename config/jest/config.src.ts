export default {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}'
  ],
  coverageReporters: ['text', 'json-summary'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  preset: 'ts-jest',
  rootDir: process.cwd(),
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/config/jest/setupJest.ts'],
  testMatch: ['<rootDir>/src/**/*.test.ts?(x)'],
  transform: { '^.+\\.(js|tsx?)$': 'ts-jest' }
}
