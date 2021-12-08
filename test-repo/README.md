# Test Details
## .github/workflows/push.yml
```YAML
|
  name: Bump Version (Skip Commit)
  'on':
    push: null
  jobs:
    bump-version:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - id: version-bump
          uses: ./action
          env:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          with:
            skip-commit: true

```
## Message
no keywords
## Expectation
- **Version:** 4.1.4
- **Message:** ci: version bump to 4.1.3