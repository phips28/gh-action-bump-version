const exec = require('./exec');

function git(options, ...params) {
  return exec('git', options, ...params);
}

module.exports = git;
