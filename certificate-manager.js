import { AUTH_CONFIG } from './certificateconfig.js';

class CertificateManager {
  constructor() {
    this.isVerified = false;
    this.currentCertificate = null;
    this.overlay = document.getElementById('certificate-manager-overlay');
    this.initEventListeners();
  }

  /* UI Control Methods */
  toggleOverlay() {
    if (!this.overlay) {
      console.error('Overlay element not found');
      return;
    }
    this.overlay.classList.toggle('active');
    if (this.overlay.classList.contains('active')) {
      this.resetForm();
    }
  }

  showOverlay() {
    if (this.overlay) this.overlay.classList.add('active');
    this.resetForm();
  }

  hideOverlay() {
    if (this.overlay) this.overlay.classList.remove('active');
  }

  resetForm() {
    this.showStatus('', ''); // Clear status
    const certDisplay = document.getElementById('cm-certificate-display');
    if (certDisplay) certDisplay.innerHTML = '';
    const genBtn = document.getElementById('cm-generate-cert');
    if (genBtn) genBtn.disabled = true;
  }

  showStatus(message, type) {
    const statusEl = document.getElementById('cm-cert-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `cert-manager-status ${type}`;
    }
  }

  /* Authentication Methods */
  async verifyCredentials() {
    try {
      const publicKey = document.getElementById('cm-public-key').value.trim();
      const githubToken = document.getElementById('cm-github-token').value.trim();
      
      if (!publicKey || !githubToken) {
        throw new Error('Both fields are required');
      }

      this.showStatus('Verifying credentials...', 'loading');
      
      // Simulate verification (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      const isValid = true; // Replace with actual verification
      
      if (!isValid) throw new Error('Invalid credentials');
      
      this.isVerified = true;
      this.showStatus('✓ Verified successfully', 'success');
      document.getElementById('cm-generate-cert').disabled = false;
      
    } catch (error) {
      this.isVerified = false;
      this.showStatus(`✗ ${error.message}`, 'error');
      document.getElementById('cm-generate-cert').disabled = true;
    }
  }

  /* Certificate Methods */
  generateCertificate() {
    if (!this.isVerified) return;
    
    this.currentCertificate = {
      id: `cert-${Date.now()}`,
      name: 'Verified User',
      date: new Date().toLocaleDateString(),
      score: '100%',
      timestamp: Date.now()
    };

    this.showCertificate(this.currentCertificate);
    document.getElementById('cm-download-cert').disabled = false;
  }

  showCertificate(cert) {
    const certDisplay = document.getElementById('cm-certificate-display');
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

  downloadCertificate() {
    if (!this.currentCertificate) return;
    console.log('Downloading:', this.currentCertificate);
    // Implement PDF generation here
  }

  /* Event Listeners */
  initEventListeners() {
    // Certificate Manager Button
    document.getElementById('cert-manager-btn')?.addEventListener('click', () => {
      this.toggleOverlay();
    });

    // Close Overlay Button
    document.querySelector('.certificate-manager-close')?.addEventListener('click', () => {
      this.hideOverlay();
    });

    // Verify Credentials Button
    document.getElementById('cm-load-cert-data')?.addEventListener('click', () => {
      this.verifyCredentials();
    });

    // Generate Certificate Button
    document.getElementById('cm-generate-cert')?.addEventListener('click', () => {
      this.generateCertificate();
    });

    // Download Certificate Button
    document.getElementById('cm-download-cert')?.addEventListener('click', () => {
      this.downloadCertificate();
    });
  }
}

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  window.certManager = new CertificateManager();
});
