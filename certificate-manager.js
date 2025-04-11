import { AUTH_CONFIG } from './certificateconfig.js';

class CertificateManager {
  constructor() {
    this.isVerified = false;
    this.currentCertificate = null;
    this.overlay = document.getElementById('certificate-manager-overlay');
    this.initEventListeners();
  }

  /* Overlay Control Methods */
  toggleOverlay() {
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

  /* ... (keep all other existing methods exactly the same) ... */

  initEventListeners() {
    // Certificate Manager Button Toggle
    document.getElementById('cert-manager-btn')?.addEventListener('click', () => {
      this.toggleOverlay();
    });

    // Close Overlay Button
    document.querySelector('.certificate-manager-close')?.addEventListener('click', () => {
      this.hideOverlay();
    });

    // Auth button
    document.getElementById('load-cert-data')?.addEventListener('click', () => {
      this.verifyCredentials();
    });

    // Generate certificate
    document.getElementById('generate-cert')?.addEventListener('click', () => {
      if (this.isVerified) {
        const cert = this.generateCertificate();
        this.showCertificate(cert);
      }
    });

    // Download certificate
    document.getElementById('download-cert')?.addEventListener('click', () => {
      if (this.currentCertificate) {
        this.downloadCertificate();
      }
    });
  }

  /* Add this new method for downloading */
  downloadCertificate() {
    if (!this.currentCertificate) return;
    // Implement your PDF download logic here
    console.log('Downloading certificate:', this.currentCertificate);
    // This would use jsPDF or similar to generate the PDF
  }
}

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  window.certManager = new CertificateManager();
});
