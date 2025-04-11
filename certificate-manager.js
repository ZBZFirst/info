import { AUTH_CONFIG } from './certificateconfig.js';

class CertificateManager {
  constructor() {
    this.isVerified = false;
    this.currentCertificate = null;
    this.initEventListeners();
  }

  /* Core Authentication Methods */
  async verifyCredentials() {
    try {
      const { publicKey, githubToken } = this.getAuthInputs();
      this.validateInputs(publicKey, githubToken);
      
      this.showStatus('Verifying with LockBox...', 'loading');
      
      const isValid = await this.verifyAgainstGitHub(publicKey, githubToken);
      if (!isValid) throw new Error('Invalid credentials');

      this.handleVerificationSuccess();
    } catch (error) {
      this.handleVerificationError(error);
    }
  }

  async verifyAgainstGitHub(publicKey, token) {
    const { REPO_OWNER, REPO_NAME, AUTH_FILE } = AUTH_CONFIG;
    
    try {
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
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const csvData = await response.text();
      return this.validatePublicKey(csvData, publicKey);
    } catch (error) {
      console.error('GitHub verification failed:', error);
      throw new Error('Could not access verification file');
    }
  }

  /* Helper Methods */
  getAuthInputs() {
    return {
      publicKey: document.getElementById('public-key').value.trim(),
      githubToken: document.getElementById('github-token').value.trim()
    };
  }

  validateInputs(publicKey, token) {
    if (!publicKey || !token) {
      throw new Error('Both public key and token are required');
    }
  }

  validatePublicKey(csvData, publicKey) {
    // Simple CSV check - adjust based on your testauth.csv format
    return csvData.includes(publicKey);
  }

  handleVerificationSuccess() {
    this.isVerified = true;
    this.showStatus('✓ Verified successfully', 'success');
    this.toggleCertificateGeneration(true);
  }

  handleVerificationError(error) {
    this.isVerified = false;
    this.showStatus(`✗ ${error.message}`, 'error');
    this.toggleCertificateGeneration(false);
  }

  /* Certificate Generation */
  generateCertificate(userData) {
    if (!this.isVerified) {
      throw new Error('User not verified');
    }

    this.currentCertificate = {
      id: `cert-${Date.now()}`,
      name: userData?.name || 'Verified User',
      date: new Date().toLocaleDateString(),
      score: userData?.score || '100%',
      timestamp: Date.now(),
      verified: true
    };

    this.saveCertificate(this.currentCertificate);
    return this.currentCertificate;
  }

  saveCertificate(cert) {
    // Implement your certificate storage logic here
    console.log('Certificate saved:', cert);
  }

  /* UI Methods */
  showStatus(message, type) {
    const statusEl = document.getElementById('cert-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `cert-status ${type}`;
    }
  }

  toggleCertificateGeneration(enabled) {
    const genBtn = document.getElementById('generate-cert');
    if (genBtn) {
      genBtn.disabled = !enabled;
    }
  }

  initEventListeners() {
    document.getElementById('load-cert-data')?.addEventListener('click', () => {
      this.verifyCredentials();
    });

    document.getElementById('generate-cert')?.addEventListener('click', () => {
      if (this.isVerified) {
        const cert = this.generateCertificate();
        this.showCertificate(cert);
      }
    });
  }

  showCertificate(cert) {
    const certDisplay = document.getElementById('certificate-display');
    if (certDisplay) {
      certDisplay.innerHTML = `
        <div class="cert-preview">
          <h3>${cert.name}</h3>
          <p>Date: ${cert.date}</p>
          <p>Score: ${cert.score}</p>
          <p class="cert-id">ID: ${cert.id}</p>
          <p class="verified-badge"><i class="fas fa-check-circle"></i> Verified</p>
        </div>
      `;
    }
  }
}

// Initialize
window.certManager = new CertificateManager();
