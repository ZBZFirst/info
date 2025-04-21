import { CERTIFICATE_TEMPLATE } from './certificateconfig.js';

class CertificateManager {
  constructor() {
    this.isVerified = false;
    this.currentCertificate = null;
    this.overlay = null;
    this.setupCertificateManagerButtonListener();
    this.setupStorageListener();
    this.checkConditions();
    this.setupQuizCompletionListener();

  }

  setupCertificateManagerButtonListener() {
    const button = document.getElementById('cert-manager-btn');
    if (!button) {
      console.error('Certificate manager button not found!');
      return;
    }
    button.addEventListener('click', () => {
      this.toggleOverlay();
    });
    console.log('Certificate button listener initialized');
  }
  
  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'quizProgress' || e.key === 'MenuScreen') {
        this.checkConditions();
      }
    });
  }

  setupQuizCompletionListener() {
      window.addEventListener('quizCompletionChanged', () => {
          this.checkConditions();
      });
  }
  
  checkConditions() {
      const certManagerBtn = document.getElementById('cert-manager-btn');
      if (!certManagerBtn) return;
      const quizProgress = JSON.parse(localStorage.getItem('quizProgress')) || {};
      const menuScreen = localStorage.getItem('MenuScreen') === 'true';
      const isUnlocked = (quizProgress.allComplete === true) || menuScreen;
      certManagerBtn.disabled = !isUnlocked;
      certManagerBtn.title = isUnlocked 
          ? "" 
          : "Complete the quiz to unlock the Certificate Manager";
      console.log('Cert Manager State:', {
          allComplete: quizProgress.allComplete,
          menuScreen,
          isUnlocked,
          buttonDisabled: certManagerBtn.disabled
      });
  }

  injectHTML() {
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
    this.overlay.querySelector('.certificate-manager-close')?.addEventListener('click', () => {
        this.hideOverlay();
    });
    this.overlay.querySelector('#cm-load-cert-data')?.addEventListener('click', () => {
        this.verifyCredentials();
    });
    this.overlay.querySelector('#cm-generate-cert')?.addEventListener('click', () => {
        this.generateCertificate();
    });
  }

  toggleOverlay() {
    if (!this.overlay) {
      this.injectHTML();
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
      setTimeout(() => this.removeHTML(), 300);
    }
  }

  resetForm() {
    this.showStatus('', '');
    const certDisplay = document.getElementById('cm-certificate-display');
    if (certDisplay) certDisplay.innerHTML = '';
    const generateBtn = document.getElementById('cm-generate-cert');
    if (generateBtn) {
      generateBtn.disabled = !this.isVerified;
      generateBtn.classList.remove('disabled');
    }
  }

  showStatus(message, type) {
    const statusEl = document.getElementById('cm-cert-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `cert-manager-status ${type}`;
    }
  }

  async verifyCredentials() {
    try {
      const publicKey = document.getElementById('cm-public-key').value.trim();
      const githubToken = document.getElementById('cm-github-token').value.trim();
      if (!githubToken) {
        throw new Error('GitHub Token is required');
      }
      this.showStatus('Verifying credentials...', 'loading');
      const csvData = await this.fetchCertificateData(githubToken);
      const matchingRecord = publicKey 
        ? this.findCertificateRecord(csvData, publicKey)
        : null;
      if (matchingRecord || githubToken) {
        this.isVerified = true;
        const statusMessage = matchingRecord 
          ? `✓ Verified: ${matchingRecord.User}` 
          : '✓ Token accepted';
        this.showStatus(statusMessage, 'success');
        document.getElementById('cm-generate-cert').disabled = false;
        this.currentCertificate = matchingRecord || { verified: true };
      } else {
        throw new Error('No matching record found');
      }
    } catch (error) {
      this.isVerified = false;
      this.showStatus(`✗ ${error.message}`, 'error');
      document.getElementById('cm-generate-cert').disabled = true;
    }
  }

  async fetchCertificateData(token) {
    const API_URL = "https://api.github.com/repos/ZBZFirst/LockBox/contents/MinuteVentilationKeys.csv";
    const response = await fetch(API_URL, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3.raw",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
    if (!response.ok) {
      throw new Error(response.status === 401 
        ? 'Invalid token - check permissions' 
        : 'Failed to fetch data');
    }
    const csvText = await response.text();
    return this.parseCSV(csvText);
  }

  parseCSV(csvText) {
    const cleanText = csvText.replace(/"/g, '');
    const lines = cleanText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index]?.trim() || '';
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
    const generateBtn = document.getElementById('cm-generate-cert');
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.classList.add('disabled');
    }
    if (!this.isVerified) return;
    this.currentCertificate = {
      id: this.currentCertificate?.ID || `cert-${Date.now()}`,
      name: this.currentCertificate?.User || 'Verified User',
      date: new Date().toLocaleDateString(),
      course: this.currentCertificate?.CourseID || 'Unknown Course',
      score: '100%',
      customFields: {}
    };
    this.showEditableCertificate(this.currentCertificate);
  }
  
  showEditableCertificate(cert) {
    const certDisplay = document.getElementById('cm-certificate-display');
    if (!certDisplay) return;
    const generateBtn = document.getElementById('cm-generate-cert');
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.classList.add('disabled');
    }
    certDisplay.innerHTML = `
      <div class="certificate-editor">
        <div class="cert-preview" id="cert-preview">
          <!-- Title (non-editable) -->
          <h3>${CERTIFICATE_TEMPLATE.fields.title.content}</h3>
          <!-- Recipient (editable) -->
          <p>${CERTIFICATE_TEMPLATE.fields.recipient.prefix}
            <span contenteditable="true" class="editable-field" data-field="name">
              ${cert.name}
            </span>
          </p>
          <!-- Course (non-editable) -->
          <p>Course: ${cert.course}</p>
          <!-- Date (non-editable) -->
          <p>Date: ${cert.date}</p>
          <!-- Score (editable) -->
          <p>Score: ${cert.score}</p>
          <!-- ID (now editable) -->
          <p>ID: <span contenteditable="true" class="editable-field" data-field="id">${cert.id}</span></p>
          <!-- Logo if defined -->
          ${CERTIFICATE_TEMPLATE.fields.logo?.image ? `
        <img src="${CERTIFICATE_TEMPLATE.fields.logo.image}" alt="Logo" style="width: 150px; margin-top: 20px;">
      ` : ''}
          <div class="certificate-controls">
            <button id="cm-update-cert">Update Certificate</button>
            <button id="cm-print-cert">Print Certificate</button>
          </div>
        </div>
      </div>
    `;
    this.setupCertificateControls();
  }

  setupCertificateControls() {
    document.getElementById('cm-update-cert')?.addEventListener('click', () => {
      this.updateCertificateFromEdits();
    });
    document.getElementById('cm-print-cert')?.addEventListener('click', () => {
      this.printCertificate();
    });
  }
  
  updateCertificateFromEdits() {
    const preview = document.getElementById('cert-preview');
    if (!preview) return;
    const fields = preview.querySelectorAll('.editable-field');
    fields.forEach(field => {
      const fieldName = field.dataset.field;
      this.currentCertificate[fieldName] = field.textContent;
    });
    this.showStatus('Certificate updated!', 'success');
  }

  processCertificateTemplate(data) {
    let html = CERTIFICATE_TEMPLATE.template;
    html = html.replace(/{{([^{}]+)}}/g, (match, key) => {
      const keys = key.split('.');
      let value = data;
      for (const k of keys) {
        value = value?.[k];
      }
      if (value === undefined) {
        value = keys.reduce((obj, k) => obj?.[k], CERTIFICATE_TEMPLATE.fields);
      }
      return value !== undefined ? value : match;
    });
    html = html.replace(/{{#if ([^{}]+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
      const value = condition.split('.').reduce((obj, k) => obj?.[k], data) || 
                   condition.split('.').reduce((obj, k) => obj?.[k], CERTIFICATE_TEMPLATE.fields);
      return value ? content : '';
    });
    return html;
  }
  
  printCertificate() {
    if (!this.currentCertificate) return;
    const templateData = {
      ...this.currentCertificate,
      title: CERTIFICATE_TEMPLATE.fields.title.content,
      recipient: {
        name: this.currentCertificate.name,
        prefix: CERTIFICATE_TEMPLATE.fields.recipient.prefix
      },
      logo: CERTIFICATE_TEMPLATE.fields.logo.image,
      background: CERTIFICATE_TEMPLATE.background,
      container: CERTIFICATE_TEMPLATE.container
    };
    const certificateHTML = this.processCertificateTemplate(templateData);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(certificateHTML);
    printWindow.document.close();
  }

}

document.addEventListener('DOMContentLoaded', () => {
  window.certManager = new CertificateManager();
});
