const fetch = require('node-fetch');

class GitLabClient {
  constructor(token, baseUrl = 'https://gitlab.com/api/v4') {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  async getPipeline(projectId, pipelineId) {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/pipelines/${pipelineId}`,
      {
        headers: { 'PRIVATE-TOKEN': this.token }
      }
    );
    return response.json();
  }

  async getPipelineJobs(projectId, pipelineId) {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/pipelines/${pipelineId}/jobs`,
      {
        headers: { 'PRIVATE-TOKEN': this.token }
      }
    );
    return response.json();
  }

  async createMergeRequest(projectId, { title, description, sourceBranch, targetBranch = 'main' }) {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/merge_requests`,
      {
        method: 'POST',
        headers: {
          'PRIVATE-TOKEN': this.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_branch: sourceBranch,
          target_branch: targetBranch,
          title,
          description
        })
      }
    );
    return response.json();
  }

  async createBranch(projectId, branchName, sourceBranch = 'main') {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/repository/branches`,
      {
        method: 'POST',
        headers: {
          'PRIVATE-TOKEN': this.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branch: branchName,
          ref: sourceBranch
        })
      }
    );
    return response.json();
  }

  async commitFile(projectId, branch, filePath, content, commitMessage) {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/repository/commits`,
      {
        method: 'POST',
        headers: {
          'PRIVATE-TOKEN': this.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branch,
          commit_message: commitMessage,
          actions: [
            {
              action: 'update',
              file_path: filePath,
              content
            }
          ]
        })
      }
    );
    return response.json();
  }
}

module.exports = GitLabClient;