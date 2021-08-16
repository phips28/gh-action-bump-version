const { default: fetch } = require('node-fetch');

async function clearWorkflowRuns() {
  const runs = await getWorkflowRuns();
  const basePath = getActionsBasePath();
  await Promise.all(runs.map((run) => api(`${basePath}/runs/${run.id}`, { method: 'DELETE' })));
}
exports.clearWorkflowRuns = clearWorkflowRuns;

async function getMostRecentWorkflowRun() {
  const runs = await getWorkflowRuns();
  if (runs.length === 0) {
    return null;
  }
  const mostRecentRun = runs.reduce((previous, current) => {
    const prevDate = new Date(previous.created_at);
    const currDate = new Date(current.created_at);
    if (prevDate < currDate) {
      return current;
    } else {
      return previous;
    }
  });
  return mostRecentRun;
}
exports.getMostRecentWorkflowRun = getMostRecentWorkflowRun;

async function getWorkflowRun(id) {
  const basePath = getActionsBasePath();
  const run = await api(`${basePath}/runs/${id}`);
  return run;
}
exports.getWorkflowRun = getWorkflowRun;

async function getWorkflowRuns() {
  const basePath = getActionsBasePath();
  const result = await api(`${basePath}/runs`);
  return result.workflow_runs || [];
}

function getActionsBasePath() {
  const repoUrl = process.env.TEST_REPO;
  const match = /\/([^/]*)\/([^/]*)\.git$/.exec(repoUrl);
  const owner = match[1];
  const repo = match[2];
  return `repos/${owner}/${repo}/actions`;
}

async function api(path, options) {
  options = options || {};
  const username = process.env.GITHUB_ACTOR;
  const token = process.env.TEST_TOKEN;
  const response = await fetch(`https://api.github.com/${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${token}`, 'ascii').toString('base64')}`,
      accept: 'application/vnd.github.v3+json',
      'User-Agent': username,
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const responseText = await response.text();
  if (responseText.length > 0) {
    return JSON.parse(responseText);
  }
}
