const dotenv = require('dotenv');
const setupTestRepo = require('./setupTestRepo');
const yaml = require('js-yaml');
const { readFileSync } = require('fs');
const { writeFile, readFile, mkdir } = require('fs/promises');
const { resolve, join } = require('path');
const { cwd } = require('process');
const git = require('./git');
const { getMostRecentWorkflowRun, getWorkflowRun } = require('./actionsApi');

dotenv.config();

const config = getTestConfig();

beforeAll(() => setupTestRepo(config['action-files']));

config.suites.forEach((suite) => {
  describe(suite.name, () => {
    const pushYamlPath = join('.github', 'workflows', 'push.yml');
    const readmePath = 'README.md';
    suite.commits.forEach((commit) => {
      test(commit.message, async () => {
        await mkdir(join(cwd(), '.github', 'workflows'), { recursive: true });
        await writeFile(join(cwd(), pushYamlPath), yaml.dump(suite.yaml));
        await git('add', pushYamlPath);

        await writeFile(join(cwd(), readmePath), commit.message);
        await git('add', readmePath);
        await git('commit', '-m', commit.message);

        const mostRecentRun = await getMostRecentWorkflowRun();
        const mostRecentDate = mostRecentRun === null ? new Date(0) : new Date(mostRecentRun.created_at);
        await git('push', '-f');
        const run = await new Promise((resolve, reject) => {
          pollForNewRun();

          async function pollForNewRun() {
            try {
              const run = await getMostRecentWorkflowRun();
              const runDate = run === null ? new Date(0) : new Date(run.created_at);
              if (runDate > mostRecentDate) {
                resolve(run);
              } else {
                setTimeout(pollForNewRun, 1000);
              }
            } catch (error) {
              reject(error);
            }
          }
        });
        const completedRun = await new Promise((resolve, reject) => {
          pollForRunCompletion(run.id);

          async function pollForRunCompletion(id) {
            try {
              const run = await getWorkflowRun(id);
              if (run.status === 'completed') {
                resolve(run);
              } else {
                setTimeout(() => pollForRunCompletion(id), 1000);
              }
            } catch (error) {
              reject(error);
            }
          }
        });
        expect(completedRun.conclusion).toBe('success');
        await git('pull');
        const version = await getPackageJsonVersion();
        expect(version).toBe(commit['expected-version']);
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

async function getPackageJsonVersion() {
  const path = join(cwd(), 'package.json');
  const contents = await readFile(path);
  const json = JSON.parse(contents);
  return json.version;
}
