import { AUTH_CONFIG } from './certificateconfig.js';

class CertificateManager {
  constructor() {
    this.authSettings = {
      publicKey: '',
      githubToken: '',
      secretNames: AUTH_CONFIG.SECRET_NAMES
    };
    this.initEventListeners();
  }

  async verifyCredentials() {
    const { publicKey, githubToken } = this.getInputValues();
    
    if (!this.validateInputs(publicKey, githubToken)) {
      return;
    }

    this.showStatus('Verifying credentials...', 'loading');

    try {
      const isValid = await this.verifyWithGitHub(publicKey, githubToken);
      isValid ? this.handleSuccess() : this.handleFailure();
    } catch (error) {
      this.showStatus(`Error: ${error.message}`, 'error');
    }
  }

  async verifyWithGitHub(publicKey, token) {
    const { REPO_OWNER, REPO_NAME, AUTH_FILE } = AUTH_CONFIG;
    
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${AUTH_FILE}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3.raw'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to access repository');
    }

    const content = await response.text();
    return content.includes(publicKey);
  }

  // Helper methods
  getInputValues() {
    return {
      publicKey: document.getElementById('public-key').value.trim(),
      githubToken: document.getElementById('github-token').value.trim()
    };
  }

  validateInputs(publicKey, token) {
    if (!publicKey || !token) {
      this.showStatus('Both fields are required', 'error');
      return false;
    }
    return true;
  }

  handleSuccess() {
    this.showStatus('Access granted!', 'success');
    // Only enable certificate generation after quiz completion
    document.getElementById('generate-cert').disabled = false;
  }

  handleFailure() {
    this.showStatus('Invalid credentials', 'error');
  }

  showStatus(message, type) {
    const statusEl = document.getElementById('cert-status');
    statusEl.textContent = message;
    statusEl.className = `cert-status ${type}`;
  }

  initEventListeners() {
    document.getElementById('load-cert-data').addEventListener('click', () => {
      this.verifyCredentials();
    });
  }
}

window.certManager = new CertificateManager();
