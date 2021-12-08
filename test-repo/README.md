# Test Details
## .github/workflows/push.yml
```YAML
|
  name: Bump Version (Target Branch)
  'on':
    push:
      branches:
        - main
  jobs:
    bump-version:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - run: git branch other-branch
        - id: version-bump
          uses: ./action
          env:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          with:
            target-branch: other-branch

```
## Message
no keywords
## Expectation
- **Version:** 4.1.3
- **Branch:** other-branch