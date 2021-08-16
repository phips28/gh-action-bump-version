const { existsSync } = require('fs');
const { rm, mkdir, copyFile, stat } = require('fs/promises');
const { chdir, cwd } = require('process');
const { resolve, join, dirname } = require('path');
const exec = require('./exec');
const git = require('./git');
const glob = require('tiny-glob');
const { clearWorkflowRuns } = require('./actionsApi');

module.exports = async function setupTestRepo(actionFileGlobPaths) {
  const testRepoPath = resolve(__dirname, '..', '..', 'test-repo');
  if (existsSync(testRepoPath)) {
    await rm(testRepoPath, { recursive: true, force: true });
  }
  await mkdir(testRepoPath);
  chdir(testRepoPath);
  await Promise.all([clearWorkflowRuns(), createNpmPackage(), copyActionFiles(actionFileGlobPaths)]);
  await git('init');
  await addRemote();
  await deleteTags();
  await git('add', '.');
  await git('commit', '-m', 'created package.json');
  await git('push', '-fu', 'origin', 'main');
};

function createNpmPackage() {
  return exec('npm', 'init', '-y');
}

async function addRemote() {
  const testRepoUrl = process.env.TEST_REPO;
  const username = process.env.TEST_USER;
  const token = process.env.TEST_TOKEN;
  const authUrl = testRepoUrl.replace(/^https:\/\//, `https://${username}:${token}@`);
  await git('remote', 'add', 'origin', authUrl);
}

async function copyActionFiles(globPaths) {
  const actionFolder = join(cwd(), 'action');
  await mkdir(actionFolder);
  const projectRoot = join(__dirname, '..', '..');
  const globResults = await Promise.all(globPaths.map((path) => glob(path, { cwd: projectRoot })));
  const relativeFilePaths = await Promise.all([...new Set(globResults.flat())]);
  const folders = [...new Set(relativeFilePaths.map(dirname))].filter((path) => path !== '.');
  if (folders.length > 0) {
    await Promise.all(folders.map((folder) => mkdir(join(actionFolder, folder), { recursive: true })));
  }
  await Promise.all(
    relativeFilePaths.map(async (path) => {
      const sourcePath = join(projectRoot, path);
      const fileStat = await stat(sourcePath);
      if (fileStat.isFile()) {
        return copyFile(sourcePath, join(actionFolder, path));
      }
    }),
  );
}

async function deleteTags() {
  const listTagsResult = await git({ suppressOutput: true }, 'ls-remote', '--tags', 'origin');
  if (listTagsResult.stdout) {
    const lines = listTagsResult.stdout.split('\n');
    const tags = lines.map((line) => line.split('\t')[1]);
    for (const tag of tags) {
      await git('push', 'origin', '--delete', tag);
    }
  }
}
