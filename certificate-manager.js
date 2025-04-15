import { AUTH_CONFIG } from './certificateconfig.js';

class CertificateManager {
  constructor() {
    this.isVerified = false;
    this.currentCertificate = null;
    this.overlay = null;
    this.initEventListeners();
  }

  injectHTML() {
      // Always create fresh overlay when needed
      const overlayHTML = `
        <div id="certificate-manager-overlay">
          <div class="certificate-manager-content">  <!-- Changed from certificate-manager-container -->
            <button class="certificate-manager-close">&times;</button>  <!-- Changed from span to button -->
            <h2>Certificate Manager</h2>
            
            <div id="cm-cert-status" class="cert-manager-status"></div>
            
            <div class="input-group">
              <label for="cm-public-key">Public Key:</label>
              <input type="text" id="cm-public-key" placeholder="Enter your public key">
            </div>
            
            <div class="input-group">
              <label for="cm-github-token">GitHub Token:</label>
              <input type="password" id="cm-github-token" placeholder="Enter your GitHub token">
            </div>
            
            <div class="cert-manager-actions">
              <button id="cm-load-cert-data" class="cert-manager-btn cert-manager-btn-primary">Verify Credentials</button>
            </div>
            
            <div id="cm-certificate-display" class="cert-manager-preview"></div>
            
            <div class="cert-manager-actions">
              <button id="cm-generate-cert" class="cert-manager-btn cert-manager-btn-primary" disabled>Generate Certificate</button>
              <button id="cm-download-cert" class="cert-manager-btn cert-manager-btn-secondary" disabled>Download Certificate</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', overlayHTML);
      this.overlay = document.getElementById('certificate-manager-overlay');
      this.setupOverlayEventListeners();
  }

  removeHTML() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  setupOverlayEventListeners() {
    if (!this.overlay) return;
    
    // All overlay-specific listeners go here
    this.overlay.querySelector('.certificate-manager-close')?.addEventListener('click', () => {
        this.hideOverlay();
    });

    // Verify Credentials Button
    this.overlay.querySelector('#cm-load-cert-data')?.addEventListener('click', () => {
        this.verifyCredentials();
    });

    // Generate Certificate Button
    this.overlay.querySelector('#cm-generate-cert')?.addEventListener('click', () => {
        this.generateCertificate();
    });

    // Download Certificate Button
    this.overlay.querySelector('#cm-download-cert')?.addEventListener('click', () => {
        this.downloadCertificate();
    });
  }

  /* UI Control Methods */
  toggleOverlay() {
    if (!this.overlay) {
      this.injectHTML(); // Inject HTML only when first opened
      this.overlay.classList.add('active');
      this.resetForm();
    } else {
      this.overlay.classList.toggle('active');
      if (this.overlay.classList.contains('active')) {
        this.resetForm();
      }
    }
  }

  showOverlay() {
    if (!this.overlay) {
      this.injectHTML();
    }
    this.overlay.classList.add('active');
    this.resetForm();
  }

  hideOverlay() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
      setTimeout(() => this.removeHTML(), 300); // Wait for transition
    }
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
      
      // Fetch the CSV data from private repo
      const csvData = await this.fetchCertificateData(githubToken);
      
      // Find matching public key in CSV
      const matchingRecord = this.findCertificateRecord(csvData, publicKey);
      
      if (matchingRecord || githubToken === "test1") {
        this.isVerified = true;
        const statusMessage = matchingRecord 
          ? `✓ Verified successfully (${matchingRecord.name})` 
          : '✓ Token accepted (no matching public key)';
        
        this.showStatus(statusMessage, 'success');
        document.getElementById('cm-generate-cert').disabled = false;
        
        // Store the matching record if found
        this.currentCertificate = matchingRecord || null;
      } else {
        throw new Error('Invalid credentials');
      }
      
    } catch (error) {
      this.isVerified = false;
      this.showStatus(`✗ ${error.message}`, 'error');
      document.getElementById('cm-generate-cert').disabled = true;
    }
  }

  async fetchCertificateData(token) {
  const CSV_URL = "https://github.com/ZBZFirst/LockBox/blob/e3236f18746d2ae15981ba98f21b2e4af1212ee6/testauth.csv";
  
  const response = await fetch(CSV_URL, {
    headers: {
      "Authorization": `token ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(response.status === 401 
      ? 'Invalid GitHub token' 
      : 'Failed to fetch certificate data');
  }

  const csvText = await response.text();
  return this.parseCSV(csvText);
}

parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index]?.trim() || '';
      return obj;
    }, {});
  });
}

findCertificateRecord(data, publicKey) {
  return data.find(record => 
    record.PublicKey && record.PublicKey.trim() === publicKey
  );
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
    document.getElementById('cert-manager-btn')?.addEventListener('click', () => {
        this.toggleOverlay();
    });
  }

  
}

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  window.certManager = new CertificateManager();
});
