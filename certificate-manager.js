// certificate-manager.js

const CERT_STORAGE_KEYS = {
    primary: 'mv_certs_v3',
    backup: 'mv_certs_backup',
    legacy: 'mv_certificates' 
};

class CertificateManager {
    constructor() {
        this.loadedCertificates = [];
        this.currentCertificate = null;
        this.migrateLegacyCerts();
        this.initEventListeners();
    }

    /* Core Certificate Methods (unchanged signatures) */
    getAllCerts() {
        return this.loadedCertificates;
    }

    getCertsFromStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    }

    saveCertificate(cert) {
        if (!this.loadedCertificates.some(c => c.id === cert.id)) {
            this.loadedCertificates.unshift(cert);
        }
        
        localStorage.setItem(CERT_STORAGE_KEYS.primary, 
            JSON.stringify(this.loadedCertificates));
        localStorage.setItem(CERT_STORAGE_KEYS.backup, 
            JSON.stringify(this.loadedCertificates));
        
        this.renderCertificates();
    }

    migrateLegacyCerts() {
        const legacyCerts = this.getCertsFromStorage(CERT_STORAGE_KEYS.legacy);
        if (legacyCerts.length > 0) {
            legacyCerts.forEach(cert => this.saveCertificate(cert));
            localStorage.removeItem(CERT_STORAGE_KEYS.legacy);
        }
    }

    loadCertificates() {
        const fromPrimary = this.getCertsFromStorage(CERT_STORAGE_KEYS.primary);
        const fromBackup = this.getCertsFromStorage(CERT_STORAGE_KEYS.backup);
        const certMap = new Map();
        
        [...fromPrimary, ...fromBackup].forEach(cert => {
            if (cert.id && !certMap.has(cert.id)) {
                certMap.set(cert.id, cert);
            }
        });
        
        this.loadedCertificates = Array.from(certMap.values())
            .sort((a, b) => b.timestamp - a.timestamp);
        
        this.renderCertificates();
        return this.loadedCertificates;
    }

    hasCertificateForAttempt(name, score) {
        return this.getAllCerts().some(cert => 
            cert.name === name && 
            cert.score === score
        );
    }

    /* UI Rendering Methods */
    renderCertificates() {
        try {
            const container = document.getElementById('cert-list');
            const noCertsEl = document.getElementById('no-certs');
            
            if (!container || !noCertsEl) return;
            
            if (this.loadedCertificates.length === 0) {
                noCertsEl.style.display = 'block';
                container.innerHTML = '';
                return;
            }

            noCertsEl.style.display = 'none';
            container.innerHTML = this.loadedCertificates
                .map(cert => this.createCertCard(cert))
                .join('');
        } catch (error) {
            console.error('Error rendering certificates:', error);
        }
    }

    createCertCard(cert) {
        return `
        <div class="cert-card" data-id="${cert.id}">
            <div class="cert-preview">
                <h3>${cert.name}</h3>
                <p>Earned: ${cert.date}</p>
                <p class="cert-id">ID: ${cert.id}</p>
            </div>
            <div class="cert-actions">
                <button class="download-btn" data-id="${cert.id}">
                    <i class="fas fa-download"></i> PDF
                </button>
                <button class="share-btn" data-id="${cert.id}">
                    <i class="fas fa-share-alt"></i> Share
                </button>
            </div>
        </div>`;
    }

    /* Certificate Actions */
    downloadCert(certId) {
        const cert = this.getAllCerts().find(c => c.id === certId);
        if (!cert) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Certificate design
        doc.setFillColor(240, 240, 240);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
        doc.setTextColor(40, 40, 40);
        
        // Header
        doc.setFontSize(24);
        doc.text('Minute Ventilation Certification', 105, 30, { align: 'center' });
        
        // Body
        doc.setFontSize(16);
        doc.text('This certifies that', 105, 50, { align: 'center' });
        doc.setFontSize(24);
        doc.text(cert.name, 105, 70, { align: 'center' });
        doc.setFontSize(16);
        doc.text('has demonstrated proficiency in minute ventilation calculations', 105, 90, { align: 'center' });
        doc.text(`Completed on ${cert.date}`, 105, 110, { align: 'center' });
        
        // Footer
        doc.setFontSize(12);
        doc.text(`Verification ID: ${cert.id}`, 105, 140, { align: 'center' });
        doc.text(`Verify at: ${window.location.href}verify.html?id=${cert.id}`, 105, 150, { align: 'center' });
        
        doc.save(`MinuteVentilation_Certificate_${cert.id}.pdf`);
    }

    shareCert(certId) {
        const cert = this.getAllCerts().find(c => c.id === certId);
        if (!cert) return;

        const shareData = {
            title: 'My Minute Ventilation Certificate',
            text: `I earned a certificate in minute ventilation calculations!`,
            url: `${window.location.href}?cert=${certId}`
        };

        if (navigator.share) {
            navigator.share(shareData).catch(err => {
                console.log('Error sharing:', err);
            });
        } else {
            prompt('Copy this link to share:', shareData.url);
        }
    }

    /* New Overlay Management Methods */
    initEventListeners() {
        // Certificate Manager Button
        document.getElementById('cert-manager-btn')?.addEventListener('click', () => {
            this.toggleCertificateOverlay();
        });

        // Close Overlay Button
        document.getElementById('close-overlay')?.addEventListener('click', () => {
            this.hideOverlay();
        });

        // Restart Quiz Button
        document.getElementById('restart-quiz')?.addEventListener('click', () => {
            this.restartQuiz();
        });

        // Authentication Button
        document.getElementById('load-cert-data')?.addEventListener('click', () => {
            this.handleAuthentication();
        });

        // Download Button in Overlay
        document.getElementById('download-cert')?.addEventListener('click', () => {
            if (this.currentCertificate) {
                this.downloadCert(this.currentCertificate.id);
            }
        });

        // Delegate events for dynamically created buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.download-btn')) {
                const certId = e.target.closest('.download-btn').dataset.id;
                this.downloadCert(certId);
            }
            if (e.target.closest('.share-btn')) {
                const certId = e.target.closest('.share-btn').dataset.id;
                this.shareCert(certId);
            }
        });
    }

    toggleCertificateOverlay() {
        const overlay = document.getElementById('completion-overlay');
        overlay.classList.toggle('hidden');
        
        if (!overlay.classList.contains('hidden')) {
            this.updateOverlayContent();
        }
    }

    hideOverlay() {
        document.getElementById('completion-overlay').classList.add('hidden');
    }

    restartQuiz() {
        // Reset quiz state (coordinate with quiz.js)
        window.location.reload();
    }

    handleAuthentication() {
        const token = document.getElementById('github-token').value.trim();
        const publicKey = document.getElementById('public-key').value.trim();
        
        if (!token || !publicKey) {
            this.showStatusMessage('Please enter both credentials', 'error');
            return;
        }

        this.showStatusMessage('Verifying credentials...', 'loading');
        
        // Simulate authentication (replace with actual API call)
        setTimeout(() => {
            if (token && publicKey) {
                this.generateVerifiedCertificate(token, publicKey);
            } else {
                this.showStatusMessage('Authentication failed', 'error');
            }
        }, 1500);
    }

    generateVerifiedCertificate(token, publicKey) {
        const newCert = {
            id: `cert-${Date.now()}`,
            name: 'Verified User', // Would come from auth in real implementation
            date: new Date().toLocaleDateString(),
            score: '100%',
            timestamp: Date.now(),
            verified: true
        };

        this.currentCertificate = newCert;
        this.saveCertificate(newCert);
        this.showStatusMessage('Certificate generated!', 'success');
        this.updateOverlayContent(newCert);
        document.getElementById('download-cert').disabled = false;
    }

    showStatusMessage(message, type) {
        const statusEl = document.getElementById('cert-status');
        statusEl.textContent = message;
        statusEl.className = `cert-status ${type}`;
    }

    updateOverlayContent(cert = null) {
        const certDisplay = document.getElementById('certificate-display');
        
        if (!cert) {
            certDisplay.innerHTML = `
                <p>Congratulations on completing the worksheet!</p>
                <p>Authenticate to generate your verified certificate.</p>
            `;
            return;
        }

        certDisplay.innerHTML = `
            <div class="cert-preview">
                <h3>${cert.name}</h3>
                <p>Date: ${cert.date}</p>
                <p>Score: ${cert.score}</p>
                <p class="cert-id">ID: ${cert.id}</p>
                ${cert.verified ? '<p class="verified-badge"><i class="fas fa-check-circle"></i> Verified</p>' : ''}
            </div>
        `;
    }
}

// Initialize and expose the manager
window.certManager = new CertificateManager();

// Load any existing certificates when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    certManager.loadCertificates();
});
