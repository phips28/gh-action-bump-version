# Test Details
## .github/workflows/push.yml
```YAML
|
  name: Bump Version (Skip Push)
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
            skip-push: true

```
## Message
skip pushing the bumped version commit
## Expectation
- **Version:** 4.1.4
- **Message:** skip pushing the bumped version commit