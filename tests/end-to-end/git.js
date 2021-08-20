const exec = require('./exec');

function git(options, ...params) {
  return exec('git', options, ...params);
}

let firstCommit = true;
function push() {
  if (firstCommit) {
    firstCommit = false;
    return git('push', '--force', '--set-upstream', 'origin', 'main');
  } else {
    return git('push');
  }
}

module.exports = {
  push,
  default: git,
};
