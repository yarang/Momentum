/**
 * Jest Configuration for Momentum
 *
 * Test framework configuration with React Native preset,
 * coverage thresholds, and module path mapping.
 *
 * @see https://jestjs.io/docs/configuration
 */

module.exports = {
  // Use React Native preset
  preset: 'react-native',

  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Transform ignore patterns - exclude node_modules from transformation
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage|uuid)/)',
  ],

  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/core/(.*)$': '<rootDir>/src/core/$1',
    '^@/features/(.*)$': '<rootDir>/src/features/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@/navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',

    // Mock native modules
    '^react-native-vector-icons$': '<rootDir>/__mocks__/react-native-vector-icons.js',
    '^react-native-push-notification$': '<rootDir>/__mocks__/react-native-push-notification.js',
  },

  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Coverage collection settings
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/index.ts',
  ],

  // Coverage thresholds (phase 1: aim for 50%, phase 2: 80%)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
  ],

  // Module directories
  moduleDirectories: ['node_modules', 'src'],

  // Clear mocks automatically between every test
  clearMocks: true,

  // Reset modules automatically between tests
  resetModules: true,
};
