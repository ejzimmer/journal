'use strict';

const path = require('path');

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));
    return {
      code: `module.exports = { __esModule: true, default: ${assetFilename} };`,
    };
  },
};
