const { Toolkit } = require('actions-toolkit')
const { execSync } = require('child_process')

// Run your GitHub Action!
Toolkit.run(async tools => {
  const pkg = tools.getPackageJSON()
  const event = tools.context.payload
  // console.log('event:', event)

  const messages = event.commits.map(commit => commit.message + '\n' + commit.body)

  const commitMessage = 'version bump to'
  const isVersionBump = messages.map(message => message.toLowerCase().includes(commitMessage)).includes(true)
  if (isVersionBump) {
    tools.exit.neutral('No _action_ necessary!')
    return
  }

  let version = 'patch'
  if (messages.map(message => message.includes('BREAKING CHANGE')).includes(true)) {
    version = 'major'
  } else if (messages.map(message => message.toLowerCase().startsWith('feat')).includes(true)) {
    version = 'minor'
  }

  try {
    const current = pkg.version.toString()
    // set git user
    await tools.runInWorkspace('git', ['config', 'user.name', '"Bump Version"'])
    await tools.runInWorkspace('git', ['config', 'user.email', '"gh-action-bump-version@users.noreply.github.com"'])

    await tools.runInWorkspace('git', ['checkout', 'master'])
    await tools.runInWorkspace('npm',
      ['version', '--allow-same-version=true', '--git-tag-version=false', current])
    console.log('current:', current, '/', 'version:', version)
    const newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim()
    console.log('new version:', newVersion)
    await tools.runInWorkspace('git', ['commit', '-a', '-m', `"ci: ${commitMessage} ${newVersion}"`])

    const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`
    console.log('remoteRepo:', remoteRepo)

    await tools.runInWorkspace('git', ['tag', '-a', newVersion])
    await tools.runInWorkspace('git', ['push', `"${remoteRepo}"`, '--follow-tags'])
    await tools.runInWorkspace('git', ['push', `"${remoteRepo}"`, '--tags'])
  } catch (e) {
    tools.log.fatal(e)
    tools.exit.failure('Failed to bump version')
  }
  tools.exit.success('Version bumped!')
})
