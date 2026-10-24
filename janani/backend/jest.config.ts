import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: ['src/services/**/*.ts', 'src/lib/**/*.ts'],
  coverageThreshold: { global: { lines: 80 } },
  setupFilesAfterEnv: [],
  testTimeout: 15000,
};

export default config;
