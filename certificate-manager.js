import { CERTIFICATE_TEMPLATE } from './certificateconfig.js';

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
        this.generatePDF();
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

    /* Authentication Methods */
  async verifyCredentials() {
    try {
      const publicKey = document.getElementById('cm-public-key').value.trim();
      const githubToken = document.getElementById('cm-github-token').value.trim();
      
      if (!githubToken) {
        throw new Error('GitHub Token is required');
      }
  
      this.showStatus('Verifying credentials...', 'loading');
      
      // Fetch data using the user-provided token
      const csvData = await this.fetchCertificateData(githubToken);
      
      // Find matching record (if public key provided)
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
    const API_URL = "https://api.github.com/repos/ZBZFirst/LockBox/contents/testauth.csv";
    
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
    // Remove any double quotes from fields
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
    // Disable the button immediately
    const generateBtn = document.getElementById('cm-generate-cert');
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.classList.add('disabled');
    }
  
    if (!this.isVerified) return;
    
    // Create editable certificate data
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
  
    // Keep the generate button disabled
    const generateBtn = document.getElementById('cm-generate-cert');
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.classList.add('disabled');
    }
  
    certDisplay.innerHTML = `
      <div class="certificate-editor">
        <div class="cert-preview" id="cert-preview">
          <!-- Title (non-editable) -->
          <h3>${CERTIFICATE_TEMPLATE.fields.find(f => f.name === 'title').content}</h3>
          
          <!-- Recipient (editable) -->
          <p>${CERTIFICATE_TEMPLATE.fields.find(f => f.name === 'recipient').prefix}
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
        
        <div class="certificate-controls">
          <button id="cm-update-cert">Update Certificate</button>
          <button id="cm-print-cert">Print Certificate</button>
          <button id="cm-pdf-cert">Export as PDF</button>
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
    
    document.getElementById('cm-pdf-cert')?.addEventListener('click', () => {
      this.generatePDF();
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
  
  printCertificate() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate</title>
        <style>
          body { font-family: Arial; text-align: center; }
          .certificate { border: 2px solid #000; padding: 20px; margin: 20px; }
          h1 { color: #1a5276; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>Certificate of Completion</h1>
          <p>This certifies that <strong>${this.currentCertificate.name}</strong></p>
          <p>has successfully completed <strong>${this.currentCertificate.course}</strong></p>
          <p>with a score of <strong>${this.currentCertificate.score}</strong></p>
          <p>on ${this.currentCertificate.date}</p>
          <p>Certificate ID: ${this.currentCertificate.id}</p>
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  generatePDF() {
    if (!this.currentCertificate) return;
  
    // Load jsPDF library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Add certificate content
      doc.setFontSize(20);
      doc.text('Certificate of Completion', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text(`This certifies that ${this.currentCertificate.name}`, 105, 40, { align: 'center' });
      doc.text(`has successfully completed ${this.currentCertificate.course}`, 105, 50, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(`Score: ${this.currentCertificate.score}`, 105, 70, { align: 'center' });
      doc.text(`Date: ${this.currentCertificate.date}`, 105, 80, { align: 'center' });
      doc.text(`ID: ${this.currentCertificate.id}`, 105, 90, { align: 'center' });
      
      // Add decorative elements
      doc.setDrawColor(0);
      doc.setLineWidth(1);
      doc.line(20, 30, 190, 30);
      
      // Save the PDF
      doc.save(`certificate_${this.currentCertificate.id}.pdf`);
    };
    document.head.appendChild(script);
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
