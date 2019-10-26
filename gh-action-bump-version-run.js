#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const event = JSON.parse(fs.readFileSync('/github/workflow/event.json').toString())

let pkg = require(path.join(process.cwd(), 'package.json'))

const run = async () => {
  console.log('event:', event)
  let messages = event.commits.map(commit => commit.message + '\n' + commit.body)

  const commitMessage = 'version bump'
  const isVersionBump = messages.map(message => message.toLowerCase().includes(commitMessage)).includes(true)
  if (isVersionBump) {
    return
  }

  let version = 'patch'
  if (messages.map(message => message.includes('BREAKING CHANGE')).includes(true)) {
    version = 'major'
  } else if (messages.map(message => message.toLowerCase().startsWith('feat')).includes(true)) {
    version = 'minor'
  }

  const exec = str => {
    return process.stdout.write(execSync(str))
  }

  let current = pkg.version.toString()
  exec(`git checkout master`)
  exec(`npm version --allow-same-version=true --git-tag-version=false ${current} `)
  console.log('current:', current, '/', 'version:', version)
  let newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString()
  console.log('new version:', newVersion)
  exec(`git commit -a -m 'ci: ${commitMessage} ${newVersion}'`)

  const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`
  console.log('remoteRepo:', remoteRepo)

  exec(`git tag ${newVersion}`)
  exec(`git push "${remoteRepo}" --follow-tags`)
  exec(`git push "${remoteRepo}" --tags`)
}
run()
