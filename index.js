const { Toolkit } = require('actions-toolkit');
const { execSync } = require('child_process');

// Change working directory if user defined PACKAGEJSON_DIR
if (process.env.PACKAGEJSON_DIR) {
  process.env.GITHUB_WORKSPACE = `${process.env.GITHUB_WORKSPACE}/${process.env.PACKAGEJSON_DIR}`;
  process.chdir(process.env.GITHUB_WORKSPACE);
}

// Run your GitHub Action!
Toolkit.run(async (tools) => {
  const pkg = tools.getPackageJSON();
  const event = tools.context.payload;

  if (!event.commits) {
    console.log("Couldn't find any commits in this event, incrementing patch version...");
  }

  const messages = event.commits ? event.commits.map((commit) => commit.message + '\n' + commit.body) : [];

  const commitMessage = process.env['INPUT_COMMIT-MESSAGE'] || 'ci: version bump to {{version}}';
  console.log('messages:', messages);
  const commitMessageRegex = new RegExp(commitMessage.replace(/{{version}}/g, 'v\\d+\\.\\d+\\.\\d+'), 'ig');
  const isVersionBump = messages.find((message) => commitMessageRegex.test(message)) !== undefined;

  if (isVersionBump) {
    tools.exit.success('No action necessary!');
    return;
  }

  // input wordings for MAJOR, MINOR, PATCH, PRE-RELEASE
  const majorWords = process.env['INPUT_MAJOR-WORDING'].split(',');
  const minorWords = process.env['INPUT_MINOR-WORDING'].split(',');
  const patchWords = process.env['INPUT_PATCH-WORDING'].split(',');
  const preReleaseWords = process.env['INPUT_RC-WORDING'].split(',');

  // get default version bump
  let version = process.env.INPUT_DEFAULT;
  let foundWord = null;
  // get the pre-release prefix specified in action
  let preid = process.env.INPUT_PREID;

  // case: if wording for MAJOR found
  if (
    messages.some(
      (message) => /^([a-zA-Z]+)(\(.+\))?(\!)\:/.test(message) || majorWords.some((word) => message.includes(word)),
    )
  ) {
    version = 'major';
  }
  // case: if wording for MINOR found
  else if (messages.some((message) => minorWords.some((word) => message.includes(word)))) {
    version = 'minor';
  }
  // case: if wording for PATCH found
  else if (messages.some((message) => patchWords.some((word) => message.includes(word)))) {
    version = 'patch';
  }
  // case: if wording for PRE-RELEASE found
  else if (
    messages.some((message) =>
      preReleaseWords.some((word) => {
        if (message.includes(word)) {
          foundWord = word;
          return true;
        } else {
          return false;
        }
      }),
    )
  ) {
    preid = foundWord.split('-')[1];
    version = 'prerelease';
  }

  tools.log('preReleaseWords - ' + preReleaseWords);

  // case: if default=prerelease,
  // rc-wording is also set
  // and does not include any of rc-wording
  // then unset it and do not run
  if (
    version === 'prerelease' &&
    preReleaseWords !== '' &&
    !messages.some((message) => preReleaseWords.some((word) => message.includes(word)))
  ) {
    version = null;
  }

  // case: if default=prerelease, but rc-wording is NOT set
  if (version === 'prerelease' && preid) {
    version = 'prerelease';
    version = `${version} --preid=${preid}`;
  }

  // case: if nothing of the above matches
  if (version === null) {
    tools.exit.success('No version keywords found, skipping bump.');
    return;
  }

  // GIT logic
  try {
    const current = pkg.version.toString();
    // set git user
    await tools.runInWorkspace('git', [
      'config',
      'user.name',
      `"${process.env.GITHUB_USER || 'Automated Version Bump'}"`,
    ]);
    await tools.runInWorkspace('git', [
      'config',
      'user.email',
      `"${process.env.GITHUB_EMAIL || 'gh-action-bump-version@users.noreply.github.com'}"`,
    ]);

    let currentBranch = /refs\/[a-zA-Z]+\/(.*)/.exec(process.env.GITHUB_REF)[1];
    let isPullRequest = false;
    if (process.env.GITHUB_HEAD_REF) {
      // Comes from a pull request
      currentBranch = process.env.GITHUB_HEAD_REF;
      isPullRequest = true;
    }
    if (process.env['INPUT_TARGET-BRANCH']) {
      // We want to override the branch that we are pulling / pushing to
      currentBranch = process.env['INPUT_TARGET-BRANCH'];
    }
    console.log('currentBranch:', currentBranch);
    // do it in the current checked out github branch (DETACHED HEAD)
    // important for further usage of the package.json version
    await tools.runInWorkspace('npm', ['version', '--allow-same-version=true', '--git-tag-version=false', current]);
    console.log('current:', current, '/', 'version:', version);
    let newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim().replace(/^v/, '');
    newVersion = `${process.env['INPUT_TAG-PREFIX']}${newVersion}`;
    await tools.runInWorkspace('git', ['commit', '-a', '-m', commitMessage.replace(/{{version}}/g, newVersion)]);

    // now go to the actual branch to perform the same versioning
    if (isPullRequest) {
      // First fetch to get updated local version of branch
      await tools.runInWorkspace('git', ['fetch']);
    }
    await tools.runInWorkspace('git', ['checkout', currentBranch]);
    await tools.runInWorkspace('npm', ['version', '--allow-same-version=true', '--git-tag-version=false', current]);
    console.log('current:', current, '/', 'version:', version);
    newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim().replace(/^v/, '');
    newVersion = `${process.env['INPUT_TAG-PREFIX']}${newVersion}`;
    console.log(`::set-output name=newTag::${newVersion}`);
    try {
      // to support "actions/checkout@v1"
      await tools.runInWorkspace('git', ['commit', '-a', '-m', commitMessage.replace(/{{version}}/g, newVersion)]);
    } catch (e) {
      console.warn(
        'git commit failed because you are using "actions/checkout@v2"; ' +
          'but that doesnt matter because you dont need that git commit, thats only for "actions/checkout@v1"',
      );
    }

    const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;
    if (process.env['INPUT_SKIP-TAG'] !== 'true') {
      await tools.runInWorkspace('git', ['tag', newVersion]);
      await tools.runInWorkspace('git', ['push', remoteRepo, '--follow-tags']);
      await tools.runInWorkspace('git', ['push', remoteRepo, '--tags']);
    } else {
      await tools.runInWorkspace('git', ['push', remoteRepo]);
    }
  } catch (e) {
    tools.log.fatal(e);
    tools.exit.failure('Failed to bump version');
  }
  tools.exit.success('Version bumped!');
});
