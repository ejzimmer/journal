module.exports = {
  projects: [
    '<rootDir>/apps/journal',
    '<rootDir>/apps/amimono',
    '<rootDir>/packages/shared',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
