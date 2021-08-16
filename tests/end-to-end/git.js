const exec = require('./exec');

module.exports = function git(options, ...params) {
  return exec('git', options, ...params);
};
