const createProjectConfig = require('../../jest/createProjectConfig');

module.exports = {
  ...createProjectConfig(__dirname, 'amimono'),
  roots: ['<rootDir>/src'],
};
