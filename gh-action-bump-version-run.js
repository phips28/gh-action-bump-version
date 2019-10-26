#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const event = JSON.parse(fs.readFileSync('/github/workflow/event.json').toString())

let pkg = require(path.join(process.cwd(), 'package.json'))

const run = async () => {
  if (!process.env.NPM_AUTH_TOKEN) throw new Error('gh-action-bump-version requires NPM_AUTH_TOKEN')

  let messages = event.commits.map(commit => commit.message + '\n' + commit.body)

  let version = 'patch'
  if (messages.map(message => message.includes('BREAKING CHANGE')).includes(true)) {
    version = 'major'
  } else if (messages.map(message => message.toLowerCase().startsWith('feat')).includes(true)) {
    version = 'minor'
  }

  const exec = str => process.stdout.write(execSync(str))

  let current = execSync(`npm view ${pkg.name} version`).toString()
  exec(`npm version --allow-same-version=true --git-tag-version=false ${current} `)
  console.log('current:', current, '/', 'version:', version)
  let newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString()
  console.log('new version:', newVersion)
  exec(`git checkout package.json`) // cleanup
  exec(`git tag ${newVersion}`)
  exec(`git push gh-action-bump-version --tags`)
}
run()
