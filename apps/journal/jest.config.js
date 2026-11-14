const createProjectConfig = require('../../jest/createProjectConfig');

module.exports = {
  ...createProjectConfig(__dirname, 'journal'),
  roots: ['<rootDir>/src'],
};
