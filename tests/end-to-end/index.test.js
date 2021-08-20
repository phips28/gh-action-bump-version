const dotenv = require('dotenv');
const setupTestRepo = require('./setupTestRepo');
const yaml = require('js-yaml');
const { readFileSync } = require('fs');
const { writeFile, readFile, mkdir } = require('fs/promises');
const { resolve, join } = require('path');
const { cwd } = require('process');
const { default: git, push: gitPush } = require('./git');
const { getMostRecentWorkflowRun, getWorkflowRun } = require('./actionsApi');

dotenv.config();

const config = getTestConfig();

beforeAll(() => setupTestRepo(config.actionFiles));

config.suites.forEach((suite) => {
  const suiteYaml = yaml.dump(suite.yaml);
  describe(suite.name, () => {
    beforeAll(async () => {
      const pushYamlPath = join('.github', 'workflows', 'push.yml');
      await mkdir(join(cwd(), '.github', 'workflows'), { recursive: true });
      await writeFile(join(cwd(), pushYamlPath), suiteYaml);
      await git('add', pushYamlPath);
    });
    suite.tests.forEach((commit) => {
      test(commit.message, async () => {
        await generateReadMe(commit, suiteYaml);
        await git('commit', '--message', commit.message);

        const mostRecentDate = await getMostRecentWorkflowRunDate();
        await gitPush();

        const completedRun = await getCompletedRunAfter(mostRecentDate);
        expect(completedRun.conclusion).toBe('success');

        await git('pull');
        await assertExpectation(commit.expected);
      });
    });
  });
});

function getTestConfig() {
  const path = resolve(__dirname, './config.yaml');
  const buffer = readFileSync(path);
  const contents = buffer.toString();
  const config = yaml.load(contents);
  return config;
}

async function generateReadMe(commit, suiteYaml) {
  const readmePath = 'README.md';
  const readMeContents = [
    '# Test Details',
    '## .github/workflows/push.yml',
    '```YAML',
    yaml.dump(suiteYaml),
    '```',
    '## Message',
    commit.message,
    '## Expectation',
    `**Version:** ${commit.expected.version}`,
  ].join('\n');
  await writeFile(join(cwd(), readmePath), readMeContents);
  await git('add', readmePath);
}

async function getCompletedRunAfter(date) {
  const run = await pollFor(getMostRecentWorkflowRun, (run) => run !== null && new Date(run.created_at) > date);
  const completedRun = await pollFor(
    () => getWorkflowRun(run.id),
    (run) => run.status === 'completed',
  );
  return completedRun;
}

function pollFor(getResult, validateResult) {
  return new Promise((resolve, reject) => {
    pollAndRetry();

    async function pollAndRetry() {
      try {
        const result = await getResult();
        if (validateResult(result)) {
          resolve(result);
        } else {
          setTimeout(pollAndRetry, 1000);
        }
      } catch (error) {
        reject(error);
      }
    }
  });
}

async function getMostRecentWorkflowRunDate() {
  const run = await getMostRecentWorkflowRun();
  const date = run === null ? new Date(0) : new Date(run.created_at);
  return date;
}

async function assertExpectation({ version: expectedVersion, tag: expectedTag }) {
  if (expectedTag === undefined) {
    expectedTag = expectedVersion;
  }
  const [packageVersion, latestTag] = await Promise.all([getPackageJsonVersion(), getLatestTag()]);
  expect(packageVersion).toBe(expectedVersion);
  expect(latestTag).toBe(expectedTag);
}

async function getPackageJsonVersion() {
  const path = join(cwd(), 'package.json');
  const contents = await readFile(path);
  const json = JSON.parse(contents);
  return json.version;
}

async function getLatestTag() {
  const result = await git({ suppressOutput: true }, 'describe', '--tags', '--abbrev=0');
  return result.stdout;
}
