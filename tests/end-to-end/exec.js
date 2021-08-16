const execa = require('execa');

module.exports = async function exec(command, options, ...params) {
  let suppressOutput;
  if (typeof options === 'object') {
    suppressOutput = options.suppressOutput;
  } else {
    params.unshift(options);
    suppressOutput = false;
  }
  const subprocess = execa(command, params);
  if (!suppressOutput) {
    subprocess.stdout.pipe(process.stdout);
  }
  return await subprocess;
};
