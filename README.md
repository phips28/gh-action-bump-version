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
  * If the string "BREAKING CHANGE", "major" or the Attention pattern `refactor!: drop support for Node 6` is found anywhere in any of the commit messages or descriptions the major 
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

**skip-tag:** The tag is not added to the git repository  (optional). Example:
```yaml
- name:  'Automated Version Bump'
  uses:  'phips28/gh-action-bump-version@master'
  with:
    skip-tag:  'true'
```

**wording:** Customize the messages that trigger the version bump. It must be a string, case sensitive, coma separated  (optional). Example:
```yaml
- name:  'Automated Version Bump'
  uses:  'phips28/gh-action-bump-version@master'
  with:
    minor-wording:  'add,Adds,new'
    major-wording:  'MAJOR,cut-major'
```

**PACKAGEJSON_DIR:** Param to parse the location of the desired package.json (optional). Example:
```yaml
- name:  'Automated Version Bump'
  uses:  'phips28/gh-action-bump-version@master'
  env:
    PACKAGEJSON_DIR:  'frontend'
```
