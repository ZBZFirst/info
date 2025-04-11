import { AUTH_CONFIG } from './certificateconfig.js';

class CertificateManager {
  constructor() {
    this.isVerified = false;
    this.currentCertificate = null;
    this.overlay = null; // Initialize as null
    this.initEventListeners();
  }

  initOverlay() {
    this.overlay = document.getElementById('certificate-manager-overlay');
    if (!this.overlay) {
      console.error('Certificate manager overlay element not found');
    }
  }

  toggleOverlay() {
    if (!this.overlay) return;
    this.overlay.classList.toggle('active');
    if (this.overlay.classList.contains('active')) {
      this.resetForm();
    }
  }

  showOverlay() {
    this.overlay.classList.add('active');
    this.resetForm();
  }

  hideOverlay() {
    this.overlay.classList.remove('active');
  }

  resetForm() {
    this.showStatus('', '');
    document.getElementById('certificate-display').innerHTML = '';
    document.getElementById('generate-cert').disabled = true;
  }

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


  initEventListeners() {
    document.getElementById('cert-manager-btn')?.addEventListener('click', () => {
      this.toggleOverlay();
    });

    document.querySelector('.certificate-manager-close')?.addEventListener('click', () => {
      this.hideOverlay();
    });

    document.getElementById('load-cert-data')?.addEventListener('click', () => {
      this.verifyCredentials();
    });

    document.getElementById('generate-cert')?.addEventListener('click', () => {
      if (this.isVerified) {
        const cert = this.generateCertificate();
        this.showCertificate(cert);
      }
    });

    document.getElementById('download-cert')?.addEventListener('click', () => {
      if (this.currentCertificate) {
        this.downloadCertificate();
      }
    });
  }

  downloadCertificate() {
    if (!this.currentCertificate) return;
    console.log('Downloading certificate:', this.currentCertificate);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.certManager = new CertificateManager();
  window.certManager.initOverlay(); // Initialize overlay after DOM loads

});
