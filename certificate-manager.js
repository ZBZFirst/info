// certificate-manager.js

const CERT_STORAGE_KEYS = {
    primary: 'mv_certs_v3',
    backup: 'mv_certs_backup',
    legacy: 'mv_certificates' 
};

class CertificateManager {
    constructor() {
        this.loadedCertificates = [];
        this.migrateLegacyCerts();
        
    }

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

    renderCertificates() {
        try {
            const container = document.getElementById('cert-list');
            const noCertsEl = document.getElementById('no-certs');
            
            // Skip rendering if elements don't exist
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
        // Get from storage once
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
                <button onclick="certManager.downloadCert('${cert.id}')">
                    <i class="fas fa-download"></i> PDF
                </button>
                <button onclick="certManager.shareCert('${cert.id}')">
                    <i class="fas fa-share-alt"></i> Share
                </button>
            </div>
        </div>`;
    }

    downloadCert(certId) {
        const cert = this.getAllCerts().find(c => c.id === certId) || 
                    JSON.parse(localStorage.getItem(`cert_${certId}`));
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
        if (navigator.share) {
            navigator.share({
                title: 'My Minute Ventilation Certificate',
                text: `I earned a certificate in minute ventilation calculations!`,
                url: `${window.location.href}?cert=${certId}`
            });
        } else {
            prompt('Copy this link to share:', `${window.location.href}?cert=${certId}`);
        }
    }

    hasCertificateForAttempt(name, score) {
        return this.getAllCerts().some(cert => 
            cert.name === name && 
            cert.score === score
        );
    }
}

// Initialize a global instance
window.certManager = new CertificateManager();

// Optional: Load certificates automatically when script loads
document.addEventListener('DOMContentLoaded', () => {
    certManager.loadCertificates();
});
