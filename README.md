## gh-action-bump-version

GitHub Action for automated npm version bump.

This Action bumps the version in package.json and pushes it back to the repo. 
It is meant to be used on every successful merge to master but 
you'll need to configured that workflow yourself. You can look to the
[`.github/workflows/push.yml`](./.github/workflows/push.yml) file in this project as an example.

**Attention**

Make sure you use the `actions/checkout@v2` action!

### Workflow

* Based on the commit messages, increment the version from the latest release.
  * If the string "BREAKING CHANGE" or "major" is found anywhere in any of the commit messages or descriptions the major 
    version will be incremented.
  * If a commit message begins with the string "feat" or includes "minor" then the minor version will be increased. This works
    for most common commit metadata for feature additions: `"feat: new API"` and `"feature: new API"`.
  * All other changes will increment the patch version.
* Push the bumped npm version in package.json back into the repo.
* Push a tag for the new version back into the repo.

### Usage:
**tag-prefix:** Prefix that is used for the git tag  (optional). Example:
```yaml
- name:  'Automated Version Bump'
  uses:  'phips28/gh-action-bump-version@master'
  with:
    tag-prefix:  ''
```
**PACKAGEJSON_DIR:** Param to parse the location of the desired package.json (optional). Example:
```yaml
- name:  'Automated Version Bump'
  uses:  'phips28/gh-action-bump-version@master'
  env:
    PACKAGEJSON_DIR:  'frontend'
```
