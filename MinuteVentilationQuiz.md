---
layout: default
title: "Minute Ventilation Quiz"
---

<script src="certificate-manager.js"></script>
<link rel="stylesheet" href="quiz.css">

# Minute Ventilation Quiz

<form id="MV-Quiz">
    <div class="question">
        <h3>Question 1: What is the equation for minute ventilation (V<sub>E</sub>)?</h3>
        <input type="radio" name="q1" value="a" id="q1a"> <label for="q1a">V<sub>E</sub> = Tidal Volume × Respiratory Rate</label><br>
        <input type="radio" name="q1" value="b" id="q1b"> <label for="q1b">V<sub>E</sub> = Heart Rate × Stroke Volume</label><br>
        <input type="radio" name="q1" value="c" id="q1c"> <label for="q1c">V<sub>E</sub> = Blood Pressure × Cardiac Output</label><br>
    </div>

    <div class="question">
        <h3>Question 2: If a patient has a tidal volume of 500 mL and respiratory rate of 12 breaths/min, what is their minute ventilation?</h3>
        <input type="number" name="q2" id="q2" placeholder="Answer in mL/min"> mL/min
    </div>

    <div class="question">
        <h3>Question 3: Which of these would classify as "normal" minute ventilation in an adult?</h3>
        <input type="checkbox" name="q3a" id="q3a"> <label for="q3a">4-5 L/min</label><br>
        <input type="checkbox" name="q3b" id="q3b"> <label for="q3b">6-8 L/min</label><br>
        <input type="checkbox" name="q3c" id="q3c"> <label for="q3c">10-12 L/min</label><br>
    </div>

    <div class="question">
        <h3>Question 4: Calculate minute ventilation for these parameters:<br>
        Tidal Volume: 450 mL, Respiratory Rate: 14 breaths/min</h3>
        <input type="number" name="q4" id="q4" placeholder="Answer in L/min"> L/min
    </div>

    <!-- SUBMIT BUTTON (now properly included) -->
    <button type="button" id="submit-btn" onclick="checkQuiz()">Submit Quiz</button>
</form>

<div id="results" style="display:none;">
    <h2>Quiz Results</h2>
    <p>Your score: <span id="score">0</span>/4</p>
    <div id="feedback"></div>
    <button id="certificate-btn" onclick="generateCertificate()">Generate Certificate</button>
</div>

<!-- Certificate Gallery -->
<div id="cert-gallery">
    <h2><i class="fas fa-trophy"></i> Your Certificates</h2>
    <div id="cert-list">
        <p id="no-certs">No certificates yet. Complete the quiz to earn one!</p>
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<script>

// Initialize
const certManager = new CertificateManager();

// Quiz Validation Function
function checkQuiz() {
    // Correct answers
    const answers = {
        q1: "a",
        q2: 6000,
        q3: ["a", "b"],
        q4: 6.3
    };

    let score = 0;
    let feedback = [];

    // Hide feedback initially
    document.getElementById('feedback').innerHTML = '';
    document.querySelectorAll('.question').forEach(q => q.classList.remove('correct', 'incorrect'));

    // Validate Q1
    const q1 = document.querySelector('input[name="q1"]:checked');
    if (q1 && q1.value === answers.q1) {
        score++;
        feedback.push("<p>✓ Q1: Correct! V<sub>E</sub> = Tidal Volume × Respiratory Rate</p>");
        document.querySelector('.question:nth-child(1)').classList.add('correct');
    } else {
        document.querySelector('.question:nth-child(1)').classList.add('incorrect');
    }

    // Validate Q2
    const q2 = parseFloat(document.getElementById('q2').value);
    if (q2 === answers.q2) {
        score++;
        feedback.push("<p>✓ Q2: Correct! 500 mL × 12 = 6000 mL/min</p>");
        document.querySelector('.question:nth-child(2)').classList.add('correct');
    } else {
        document.querySelector('.question:nth-child(2)').classList.add('incorrect');
    }

    // Validate Q3
    const q3a = document.getElementById('q3a').checked;
    const q3b = document.getElementById('q3b').checked;
    const q3c = document.getElementById('q3c').checked;
    if (q3a && q3b && !q3c) {
        score++;
        feedback.push("<p>✓ Q3: Correct! Both 4-5 L/min and 6-8 L/min are normal</p>");
        document.querySelector('.question:nth-child(3)').classList.add('correct');
    } else {
        document.querySelector('.question:nth-child(3)').classList.add('incorrect');
    }

    // Validate Q4
    const q4 = parseFloat(document.getElementById('q4').value);
    if (q4 === answers.q4) {
        score++;
        feedback.push("<p>✓ Q4: Correct! 450 mL × 14 = 6.3 L/min</p>");
        document.querySelector('.question:nth-child(4)').classList.add('correct');
    } else {
        document.querySelector('.question:nth-child(4)').classList.add('incorrect');
    }

    // If all answers are correct (score 4/4), show feedback
    if (score === 4) {
        document.getElementById('feedback').innerHTML = feedback.join('');
        document.getElementById('results').style.display = 'block';

        // Show certificate button if passed (3/4 or better)
        document.getElementById('certificate-btn').style.display = 'block';
    }

    // Update score and display results
    document.getElementById('score').textContent = score;
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// Certificate Generation - Updated to prevent duplicates
function generateCertificate() {
    const name = prompt("Enter your name for the certificate:");
    if (!name) return;

    // Check if certificate already exists for this session
    const existingCerts = certManager.getAllCerts();
    const existingCert = existingCerts.find(cert => 
        cert.name === name && 
        cert.score === document.getElementById('score').textContent
    );

    if (existingCert) {
        if (confirm("You already have a certificate for this attempt. Download it again?")) {
            certManager.downloadCert(existingCert.id);
        }
        return;
    }

    const certData = {
        id: 'mv-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name: name,
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        timestamp: Date.now(),
        score: document.getElementById('score').textContent + "/4",
        quizId: window.location.href + '-attempt-' + Date.now()
    };

    certManager.saveCertificate(certData);
    certManager.downloadCert(certData.id);
    certManager.loadCertificates();
}
</script>
