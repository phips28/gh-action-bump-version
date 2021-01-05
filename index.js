const { Toolkit } = require('actions-toolkit')
const { execSync } = require('child_process')
const fs = require('fs')

// Change working directory if user defined PACKAGEJSON_DIR
if (process.env.PACKAGEJSON_DIR) {
  process.env.GITHUB_WORKSPACE = `${process.env.GITHUB_WORKSPACE}/${process.env.PACKAGEJSON_DIR}`
  process.chdir(process.env.GITHUB_WORKSPACE)
}

// Run your GitHub Action!
Toolkit.run(async tools => {
  const pkg = tools.getPackageJSON()
  const event = tools.context.payload

  if (!event.commits) {
    console.log('Couldn\'t find any commits in this event, incrementing patch version...')
  }

  const messages = event.commits ? event.commits.map(commit => commit.message + '\n' + commit.body) : []

  const commitMessage = 'version bump to'
  console.log('messages:', messages)
  const isVersionBump = messages.map(message => message.toLowerCase().includes(commitMessage)).includes(true)
  if (isVersionBump) {
    tools.exit.success('No action necessary!')
    return
  }

  const majorWords = process.env['INPUT_MAJOR-WORDING'].split(',')
  const minorWords = process.env['INPUT_MINOR-WORDING'].split(',')
  const preReleaseWords = process.env['INPUT_RC-WORDING'].split(',')

  // if patch words aren't specified, any commit message qualifies as a patch
  const patchWords = process.env['INPUT_PATCH-WORDING'] ? process.env['INPUT_PATCH-WORDING'].split(',') : null

  let version = process.env.INPUT_DEFAULT || 'patch'
  let foundWord = null

  if (messages.some(
    message => /^([a-zA-Z]+)(\(.+\))?(\!)\:/.test(message) || majorWords.some(word => message.includes(word)))) {
    version = 'major'
  } else if (messages.some(message => minorWords.some(word => message.includes(word)))) {
    version = 'minor'
  } else if (messages.some(message => preReleaseWords.some(word => {
    if (message.includes(word)) {
      foundWord = word
      return true
    } else {
      return false
    }
  }
  ))) {
    const preid = foundWord.split('-')[1]
    version = `prerelease --preid=${preid}`
  } else if (Array.isArray(patchWords) && patchWords.length) {
    if (!messages.some(message => patchWords.some(word => message.includes(word)))) {
      version = null
    }
  }

  if (version === null) {
    tools.exit.success('No version keywords found, skipping bump.')
    return
  }

  try {
    tools.log.info('Generating release')

    const current = pkg.version.toString()
    // set git user
    await tools.runInWorkspace('git',
      ['config', 'user.name', `"${process.env.GITHUB_USER || 'Automated Version Bump'}"`])
    await tools.runInWorkspace('git',
      ['config', 'user.email', `"${process.env.GITHUB_EMAIL || 'gh-action-bump-version@users.noreply.github.com'}"`])

    let currentBranch = /refs\/[a-zA-Z]+\/(.*)/.exec(process.env.GITHUB_REF)[1]
    let isPullRequest = false
    if (process.env.GITHUB_HEAD_REF) {
      // Comes from a pull request
      currentBranch = process.env.GITHUB_HEAD_REF
      isPullRequest = true
    }
    if (process.env['INPUT_TARGET-BRANCH']) {
      // We want to override the branch that we are pulling / pushing to
      currentBranch = process.env['INPUT_TARGET-BRANCH']
    }

    if (isPullRequest) {
      console.log('generating patch file')
      const diff = await tools.runInWorkspace('git', ['diff', '-p', `${process.env.GITHUB_BASE_REF}..${process.env.GITHUB_HEAD_REF}`])
      const patchFile = diff.stdout
      await tools.runInWorkspace('mkdir', '-p', 'patches/stubs/main')
      fs.writeFileSync(`${tools.workspace()}/patches/stubs/main/${current}.patch`, patchFile)
    }

    console.log('currentBranch:', currentBranch)
    // do it in the current checked out github branch (DETACHED HEAD)
    // important for further usage of the package.json version
    await tools.runInWorkspace('npm',
      ['version', '--allow-same-version=true', '--git-tag-version=false', current])
    console.log('current:', current, '/', 'version:', version)
    let newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim()

    console.log('creating patch:', `${process.env['INPUT_TAG-PREFIX']}${current}`, `${process.env['INPUT_TAG-PREFIX']}${newVersion.replace('v', '')}`)

    await tools.runInWorkspace('git', ['commit', '-a', '-m', `ci: ${commitMessage} ${newVersion}`])

    // now go to the actual branch to perform the same versioning
    if (isPullRequest) {
      // First fetch to get updated local version of branch
      await tools.runInWorkspace('git', ['fetch'])
    }
    await tools.runInWorkspace('git', ['checkout', currentBranch])
    await tools.runInWorkspace('npm',
      ['version', '--allow-same-version=true', '--git-tag-version=false', current])
    console.log('current:', current, '/', 'version:', version)
    newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim()
    newVersion = `${process.env['INPUT_TAG-PREFIX']}${newVersion}`
    console.log('new version:', newVersion)
    console.log(`::set-output name=newTag::${newVersion}`)
    try {
      // to support "actions/checkout@v1"
      await tools.runInWorkspace('git', ['commit', '-a', '-m', `ci: ${commitMessage} ${newVersion}`])
    } catch (e) {
      console.warn('git commit failed because you are using "actions/checkout@v2"; ' +
        'but that doesnt matter because you dont need that git commit, thats only for "actions/checkout@v1"')
    }

    const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`
    if (process.env['INPUT_SKIP-TAG'] !== 'true') {
      await tools.runInWorkspace('git', ['tag', newVersion])
      await tools.runInWorkspace('git', ['push', remoteRepo, '--follow-tags'])
      await tools.runInWorkspace('git', ['push', remoteRepo, '--tags'])
    } else {
      await tools.runInWorkspace('git', ['push', remoteRepo])
    }
  } catch (e) {
    tools.log.fatal(e)
    tools.exit.failure('Failed to bump version')
  }
  tools.exit.success('Version bumped!')
})
