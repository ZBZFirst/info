---
layout: default
title: "Minute Ventilation Quiz"
---

# Minute Ventilation Quiz

Test your understanding of minute ventilation calculations after watching the educational videos.

<form id="quiz-form">
    <div class="question">
        <h3>Question 1: What is the equation for minute ventilation (V<sub>E</sub>)?</h3>
        <input type="radio" name="q1" value="a"> V<sub>E</sub> = Tidal Volume × Respiratory Rate<br>
        <input type="radio" name="q1" value="b"> V<sub>E</sub> = Heart Rate × Stroke Volume<br>
        <input type="radio" name="q1" value="c"> V<sub>E</sub> = Blood Pressure × Cardiac Output<br>
    </div>

    <div class="question">
        <h3>Question 2: If a patient has a tidal volume of 500 mL and respiratory rate of 12 breaths/min, what is their minute ventilation?</h3>
        <input type="number" name="q2" placeholder="Answer in mL/min"> mL/min
    </div>

    <div class="question">
        <h3>Question 3: Which of these would classify as "normal" minute ventilation in an adult?</h3>
        <input type="checkbox" name="q3a"> 4-5 L/min<br>
        <input type="checkbox" name="q3b"> 6-8 L/min<br>
        <input type="checkbox" name="q3c"> 10-12 L/min<br>
    </div>

    <div class="question">
        <h3>Question 4: Calculate minute ventilation for these parameters:<br>
        Tidal Volume: 450 mL, Respiratory Rate: 14 breaths/min</h3>
        <input type="number" name="q4" placeholder="Answer in L/min"> L/min
    </div>

    <button type="button" onclick="checkQuiz()">Submit Quiz</button>
</form>

<div id="results" style="display:none; margin-top:30px; padding:20px; background:#f5f5f5; border-radius:5px;">
    <h2>Quiz Results</h2>
    <p>Your score: <span id="score">0</span>/4</p>
    <div id="feedback"></div>
    <button id="certificate-btn" style="display:none;" onclick="generateCertificate()">Generate Certificate</button>
</div>

<script>
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

        // Check Q1
        const q1 = document.querySelector('input[name="q1"]:checked');
        if (q1 && q1.value === answers.q1) {
            score++;
            feedback.push("<p>Q1: Correct! V<sub>E</sub> = Tidal Volume × Respiratory Rate</p>");
        } else {
            feedback.push("<p>Q1: Incorrect. The correct answer is V<sub>E</sub> = Tidal Volume × Respiratory Rate</p>");
        }

        // Check Q2
        const q2 = parseFloat(document.querySelector('input[name="q2"]').value);
        if (q2 === answers.q2) {
            score++;
            feedback.push("<p>Q2: Correct! 500 mL × 12 = 6000 mL/min</p>");
        } else {
            feedback.push(`<p>Q2: Incorrect. 500 mL × 12 = 6000 mL/min (You answered ${q2 || 'blank'})</p>`);
        }

        // Check Q3
        const q3a = document.querySelector('input[name="q3a"]').checked;
        const q3b = document.querySelector('input[name="q3b"]').checked;
        const q3c = document.querySelector('input[name="q3c"]').checked;
        if (q3a && q3b && !q3c) {
            score++;
            feedback.push("<p>Q3: Correct! Both 4-5 L/min and 6-8 L/min can be normal</p>");
        } else {
            feedback.push("<p>Q3: Incorrect. Both 4-5 L/min and 6-8 L/min can be normal for adults</p>");
        }

        // Check Q4
        const q4 = parseFloat(document.querySelector('input[name="q4"]').value);
        if (q4 === answers.q4) {
            score++;
            feedback.push("<p>Q4: Correct! 450 mL × 14 = 6300 mL/min = 6.3 L/min</p>");
        } else {
            feedback.push(`<p>Q4: Incorrect. 450 mL × 14 = 6300 mL/min = 6.3 L/min (You answered ${q4 || 'blank'})</p>`);
        }

        // Display results
        document.getElementById('score').textContent = score;
        document.getElementById('feedback').innerHTML = feedback.join('');
        document.getElementById('results').style.display = 'block';
        
        // Show certificate button if passed
        if (score >= 3) {
            document.getElementById('certificate-btn').style.display = 'block';
        }
    }

    function generateCertificate() {
        const name = prompt("Enter your name for the certificate:");
        if (name) {
            // Create certificate content
            const certContent = `
                <div style="text-align:center; border:2px solid #000; padding:20px; max-width:600px; margin:0 auto;">
                    <h1>Minute Ventilation Certificate</h1>
                    <p>This certifies that</p>
                    <h2>${name}</h2>
                    <p>has successfully completed the Minute Ventilation Quiz</p>
                    <p>on ${new Date().toLocaleDateString()}</p>
                    <p>Verification ID: ${btoa(name + Date.now()).substring(0,12)}</p>
                </div>
            `;
            
            // Open certificate in new window for printing/download
            const certWindow = window.open('', '_blank');
            certWindow.document.write(`
                <html><head><title>Minute Ventilation Certificate</title></head>
                <body>${certContent}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                <\/script>
                </body></html>
            `);
        }
    }
</script>

<style>
    .question {
        margin-bottom: 20px;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 5px;
    }
    button {
        padding: 10px 20px;
        background: #0366d6;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    button:hover {
        background: #0056b3;
    }
</style>

