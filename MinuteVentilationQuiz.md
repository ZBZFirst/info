---
layout: default
title: "Minute Ventilation Quiz"
---

# Minute Ventilation Quiz

<form id="quiz-form">
    <!-- Questions remain unchanged from your original -->
    <div class="question">
        <h3>Question 1: What is the equation for minute ventilation (V<sub>E</sub>)?</h3>
        <input type="radio" name="q1" value="a" id="q1a"> <label for="q1a">V<sub>E</sub> = Tidal Volume × Respiratory Rate</label><br>
        <input type="radio" name="q1" value="b" id="q1b"> <label for="q1b">V<sub>E</sub> = Heart Rate × Stroke Volume</label><br>
        <input type="radio" name="q1" value="c" id="q1c"> <label for="q1c">V<sub>E</sub> = Blood Pressure × Cardiac Output</label><br>
    </div>

    <!-- Other questions... -->
</form>

<div id="results"></div>

<!-- Certificate Gallery -->
<div id="cert-gallery">
    <h2><i class="fas fa-trophy"></i> Your Certificates</h2>
    <div id="cert-list">
        <p id="no-certs">No certificates yet. Complete the quiz to earn one!</p>
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
<script>
// Triple storage system for maximum persistence
const CERT_STORAGE_KEYS = {
    primary: 'mv_certs_v3',
    backup: 'mv_certs_backup',
    legacy: 'mv_certificates' // For migration from old versions
};

class CertificateManager {
    constructor() {
        this.migrateLegacyCerts();
        this.loadCertificates();
    }

    getAllCerts() {
        // Check all storage locations
        const fromPrimary = this.getCertsFromStorage(CERT_STORAGE_KEYS.primary);
        const fromBackup = this.getCertsFromStorage(CERT_STORAGE_KEYS.backup);
        
        // Merge and deduplicate
        return [...new Set([...fromPrimary, ...fromBackup])]
            .filter(cert => cert.id)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    getCertsFromStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    }

    saveCertificate(cert) {
        const allCerts = this.getAllCerts();
        allCerts.unshift(cert); // Add new cert to beginning
        
        // Save to multiple locations
        localStorage.setItem(CERT_STORAGE_KEYS.primary, JSON.stringify(allCerts));
        localStorage.setItem(CERT_STORAGE_KEYS.backup, JSON.stringify(allCerts));
        
        // Additional per-certificate storage
        localStorage.setItem(`cert_${cert.id}`, JSON.stringify(cert));
        sessionStorage.setItem(`cert_${cert.id}`, JSON.stringify(cert));
    }

    migrateLegacyCerts() {
        const legacyCerts = this.getCertsFromStorage(CERT_STORAGE_KEYS.legacy);
        if (legacyCerts.length > 0) {
            legacyCerts.forEach(cert => this.saveCertificate(cert));
            localStorage.removeItem(CERT_STORAGE_KEYS.legacy);
        }
    }

    loadCertificates() {
        const certs = this.getAllCerts();
        const container = document.getElementById('cert-list');
        
        if (certs.length === 0) {
            document.getElementById('no-certs').style.display = 'block';
            return;
        }

        document.getElementById('no-certs').style.display = 'none';
        container.innerHTML = certs.map(cert => this.createCertCard(cert)).join('');
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
}

// Initialize
const certManager = new CertificateManager();

// Quiz logic (unchanged except for certificate generation)
function generateCertificate() {
    const name = prompt("Enter your name for the certificate:");
    if (!name) return;

    const certData = {
        id: 'mv-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name: name,
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        timestamp: Date.now()
    };

    certManager.saveCertificate(certData);
    certManager.downloadCert(certData.id);
    certManager.loadCertificates();
}
</script>

<style>
/* Modern styling */
#cert-gallery {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    margin-top: 40px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.cert-card {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.cert-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.cert-preview h3 {
    margin: 0;
    color: #2c3e50;
}

.cert-id {
    font-family: monospace;
    color: #7f8c8d;
    font-size: 0.9em;
    margin: 5px 0 0;
}

.cert-actions button {
    background: #3498db;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    margin-left: 10px;
    cursor: pointer;
    transition: background 0.2s;
}

.cert-actions button:hover {
    background: #2980b9;
}

.cert-actions button i {
    margin-right: 5px;
}

#no-certs {
    color: #7f8c8d;
    font-style: italic;
    text-align: center;
    padding: 20px;
}
</style>
