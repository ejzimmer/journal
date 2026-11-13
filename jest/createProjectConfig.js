const path = require('path');

module.exports = function createProjectConfig(projectDir, displayName) {
  return {
    displayName,
    rootDir: projectDir,
    roots: ['<rootDir>'],
    collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}', '!**/*.d.ts'],
    setupFiles: ['react-app-polyfill/jsdom'],
    setupFilesAfterEnv: [
      path.resolve(__dirname, '../packages/shared/setupTests.ts'),
    ],
    testMatch: [
      '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/**/*.{spec,test}.{js,jsx,ts,tsx}',
    ],
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/build/'],
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': path.resolve(
        __dirname,
        'babelTransform.js',
      ),
      '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': path.resolve(
        __dirname,
        'fileTransform.js',
      ),
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
      '^.+\\.module\\.(css|sass|scss)$',
    ],
    modulePaths: [],
    moduleNameMapper: {
      '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
      '^.+\\.css$': path.resolve(__dirname, 'CSSStub.js'),
    },
    moduleFileExtensions: [
      'web.js',
      'js',
      'web.ts',
      'ts',
      'web.tsx',
      'tsx',
      'json',
      'web.jsx',
      'jsx',
      'node',
    ],
    resetMocks: true,
  };
};
