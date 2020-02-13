const { Toolkit } = require('actions-toolkit')
const { execSync } = require('child_process')

// Change working directory if user defined PACKAGEJSON_DIR
if (process.env.PACKAGEJSON_DIR) {
  process.chdir(`${process.env.GITHUB_WORKSPACE}/${process.env.PACKAGEJSON_DIR}`)
}

// Run your GitHub Action!
Toolkit.run(async tools => {
  const pkg = tools.getPackageJSON()
  const current = pkg.version.toString()
  const event = tools.context.payload

  const messages = event.commits.map(commit => commit.message + '\n' + commit.body)

  const isVersionBump = messages.map(message => message.toLowerCase().includes(current)).includes(true)
  if (isVersionBump) {
    tools.exit.success('No action necessary!')
    return
  }

  let version = 'patch'
  if (messages.map(message => message.toLowerCase().startsWith('major')).includes(true)) {
    version = 'major'
  } else if (messages.map(message => message.toLowerCase().startsWith('minor')).includes(true)) {
    version = 'minor'
  }

  try {
    // set git user
    await tools.runInWorkspace('git', ['config', 'user.name', '"Automated Version Bump"'])
    await tools.runInWorkspace('git', ['config', 'user.email', '"fpr-public@users.noreply.github.com"'])

    const currentBranch = /refs\/[a-zA-Z]+\/(.*)/.exec(process.env.GITHUB_REF)[1]
    console.log('currentBranch:', currentBranch)

    // do it in the current checked out github branch (DETACHED HEAD)
    // important for further usage of the package.json version
    await tools.runInWorkspace('npm',
      ['version', '--allow-same-version=true', '--git-tag-version=false', current])
    console.log('current:', current, '/', 'version:', version)
    let newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim()
    await tools.runInWorkspace('git', ['commit', '-a', '-m', newVersion])

    // now go to the actual branch to perform the same versioning
    await tools.runInWorkspace('git', ['checkout', currentBranch])
    await tools.runInWorkspace('npm',
      ['version', '--allow-same-version=true', '--git-tag-version=false', current])
    console.log('current:', current, '/', 'version:', version)
    newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim()
    newVersion = `${process.env['INPUT_TAG-PREFIX']}${newVersion}`
    console.log('new version:', newVersion)
    await tools.runInWorkspace('git', ['commit', '-a', '-m', newVersion])

    const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`
    // console.log(Buffer.from(remoteRepo).toString('base64'))
    await tools.runInWorkspace('git', ['tag', newVersion])
    await tools.runInWorkspace('git', ['push', remoteRepo, '--follow-tags'])
    await tools.runInWorkspace('git', ['push', remoteRepo, '--tags'])
  } catch (e) {
    tools.log.fatal(e)
    tools.exit.failure('Failed to bump version')
  }
  tools.exit.success('Version bumped!')
})
