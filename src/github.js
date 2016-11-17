const GitHubApi = require('github-api');

module.exports = new GitHubApi({
    token: process.env.GITHUB_TOKEN,
});
