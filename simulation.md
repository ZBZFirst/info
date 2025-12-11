---
layout: page
title: NBRC Ventilation Simulation
permalink: /simulation/
---

<link rel="stylesheet" href="/info/_css/defaultpage.css">
<link rel="stylesheet" href="/info/_css/calculator.css">

<div class="simulation-container">
    <!-- Header -->
    <div class="simulation-header">
        <h1>🧪 NBRC Ventilation Simulation</h1>
        <p class="subtitle">Practice calculating initial ventilator settings according to NBRC guidelines</p>
        
        <div class="back-link">
            <a href="/" class="btn btn-outline">
                ← Back to Main Dashboard
            </a>
            <a href="/info/quiz3/VTCalculator.html" class="btn btn-outline" target="_blank">
                Open Calculator for Reference
            </a>
        </div>
    </div>

    <!-- Stats Panel -->
    <div class="stats-panel">
        <div class="stat">
            <span class="stat-label">Score</span>
            <span class="stat-value" id="score">0</span>
        </div>
        <div class="stat">
            <span class="stat-label">Accuracy</span>
            <span class="stat-value" id="accuracy">0%</span>
        </div>
        <div class="stat">
            <span class="stat-label">Completed</span>
            <span class="stat-value" id="completed">0</span>
        </div>
        <div class="stat">
            <button class="btn-reset" onclick="resetProgress()">Reset All</button>
        </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-container">
        <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
        </div>
        <div class="progress-text">
            <span id="progress-text">0% complete</span>
        </div>
    </div>

    <!-- Patient Scenario -->
    <div class="patient-card">
        <h2>📋 Patient Scenario</h2>
        <div class="patient-details">
            <div class="detail">
                <strong>Gender:</strong> <span id="gender-display" class="highlight">-</span>
            </div>
            <div class="detail">
                <strong>Height:</strong> <span id="height-display" class="highlight">-</span> inches
            </div>
            <div class="detail">
                <strong>Weight:</strong> <span id="weight-display" class="highlight">-</span> lbs
            </div>
            <div class="detail">
                <strong>Condition:</strong> <span id="condition-display" class="highlight">-</span>
            </div>
        </div>
        <div class="patient-instruction">
            <em>Calculate initial ventilator settings according to NBRC lung-protective ventilation guidelines.</em>
        </div>
    </div>

    <!-- Calculator Reference -->
    <div class="reference-card">
        <h3>📊 NBRC Formulas Reference</h3>
        <div class="formula-grid">
            <div class="formula-item">
                <strong>Weight Conversion</strong>
                <code>kg = lbs ÷ 2.2</code>
            </div>
            <div class="formula-item">
                <strong>Male IBW</strong>
                <code>50 + 2.3 × (height - 60)</code>
            </div>
            <div class="formula-item">
                <strong>Female IBW</strong>
                <code>45.5 + 2.3 × (height - 60)</code>
            </div>
            <div class="formula-item">
                <strong>Tidal Volume Range</strong>
                <code>6–8 mL/kg IBW</code>
            </div>
        </div>
    </div>

    <!-- Questions Container -->
    <div id="questions-container">
        <!-- Questions will be dynamically generated here -->
    </div>

    <!-- Controls -->
    <div class="controls-container">
        <button class="btn btn-primary" onclick="generateNewScenario()">
            🎲 Generate New Scenario
        </button>
        <button class="btn btn-success" onclick="checkAllAnswers()">
            ✅ Check All Answers
        </button>
        <button class="btn btn-info" onclick="showAllSolutions()">
            📖 Show All Solutions
        </button>
        <button class="btn btn-warning" onclick="toggleDebug()">
            🔧 Debug Mode
        </button>
    </div>

    <!-- Debug Panel -->
    <div id="debug-panel" class="debug-panel" style="display: none;">
        <h3>Debug Information</h3>
        <pre id="debug-output">Click "Generate New Scenario" to see data</pre>
        <div class="debug-actions">
            <button onclick="clearStorage()">Clear Local Storage</button>
            <button onclick="exportData()">Export Session Data</button>
            <button onclick="importData()">Import Session Data</button>
        </div>
    </div>

    <!-- Session History -->
    <div class="history-container">
        <h3>📝 Session History</h3>
        <div id="history-list" class="history-list">
            <!-- History items will be added here -->
        </div>
    </div>
</div>

<script>
// ====================
// SIMULATION ENGINE
// ====================

// Configuration
const CONFIG = {
    minHeight: 60,    // inches
    maxHeight: 84,    // inches
    minWeight: 100,   // lbs
    maxWeight: 300,   // lbs
    conditions: [
        'Post-operative',
        'Acute Respiratory Distress Syndrome (ARDS)',
        'Pneumonia',
        'COPD Exacerbation',
        'Trauma',
        'Sepsis',
        'Asthma Attack'
    ]
};

// State Management
let currentScenario = null;
let sessionStats = {
    totalAttempts: 0,
    correctAnswers: 0,
    scenariosCompleted: 0,
    history: []
};

// Initialize from localStorage
function loadSession() {
    const saved = localStorage.getItem('ventilation_sim_session');
    if (saved) {
        sessionStats = JSON.parse(saved);
        updateStatsDisplay();
    }
}

// Save to localStorage
function saveSession() {
    localStorage.setItem('ventilation_sim_session', JSON.stringify(sessionStats));
}

// Generate random patient scenario
function generateRandomPatient() {
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';
    const height = Math.floor(Math.random() * (CONFIG.maxHeight - CONFIG.minHeight + 1)) + CONFIG.minHeight;
    const weight = Math.floor(Math.random() * (CONFIG.maxWeight - CONFIG.minWeight + 1)) + CONFIG.minWeight;
    const condition = CONFIG.conditions[Math.floor(Math.random() * CONFIG.conditions.length)];
    
    return {
        gender,
        height,
        weight,
        condition,
        timestamp: new Date().toISOString()
    };
}

// Calculate correct answers for a scenario
function calculateCorrectAnswers(scenario) {
    // Convert weight to kg
    const weightKg = (scenario.weight / 2.2).toFixed(1);
    
    // Calculate IBW
    let ibw;
    if (scenario.gender === 'Male') {
        ibw = 50 + 2.3 * (scenario.height - 60);
    } else {
        ibw = 45.5 + 2.3 * (scenario.height - 60);
    }
    ibw = ibw.toFixed(1);
    
    // Calculate tidal volume range
    const vtLow = Math.round(ibw * 6);
    const vtHigh = Math.round(ibw * 8);
    
    return {
        weightKg: parseFloat(weightKg),
        ibw: parseFloat(ibw),
        vtLow: vtLow,
        vtHigh: vtHigh,
        formula: scenario.gender === 'Male' 
            ? '50 + 2.3 × (height - 60)' 
            : '45.5 + 2.3 × (height - 60)'
    };
}

// Display the current scenario
function displayScenario() {
    if (!currentScenario) return;
    
    document.getElementById('gender-display').textContent = currentScenario.gender;
    document.getElementById('height-display').textContent = currentScenario.height;
    document.getElementById('weight-display').textContent = currentScenario.weight;
    document.getElementById('condition-display').textContent = currentScenario.condition;
}

// Generate questions for the current scenario
function generateQuestions() {
    if (!currentScenario || !currentScenario.correctAnswers) return;
    
    const answers = currentScenario.correctAnswers;
    const container = document.getElementById('questions-container');
    
    container.innerHTML = `
        <div class="question-card">
            <h3>Step 1: Convert Weight to Kilograms</h3>
            <p class="question-text">
                Convert the patient's weight to kilograms using the formula:
                <code>kg = lbs ÷ 2.2</code>
            </p>
            <div class="input-group">
                <label>${currentScenario.weight} lbs ÷ 2.2 =</label>
                <input type="number" id="q1-weight" class="answer-input" step="0.1" placeholder="0.0">
                <label>kg</label>
            </div>
            <div id="f1" class="feedback"></div>
        </div>
        
        <div class="question-card">
            <h3>Step 2: Calculate Ideal Body Weight (IBW)</h3>
            <p class="question-text">
                Use the ${currentScenario.gender} formula: 
                <code>${answers.formula}</code>
            </p>
            <div class="input-group">
                <label>IBW =</label>
                <input type="number" id="q2-ibw" class="answer-input" step="0.1" placeholder="0.0">
                <label>kg</label>
            </div>
            <div id="f2" class="feedback"></div>
        </div>
        
        <div class="question-card">
            <h3>Step 3: Determine Tidal Volume Range</h3>
            <p class="question-text">
                Apply NBRC guideline: <code>6–8 mL/kg IBW</code>
            </p>
            <div class="range-inputs">
                <div class="range-item">
                    <label>Lower range (6 mL/kg):</label>
                    <input type="number" id="q3-vt-low" class="answer-input" placeholder="0">
                    <label>mL</label>
                </div>
                <div class="range-item">
                    <label>Upper range (8 mL/kg):</label>
                    <input type="number" id="q3-vt-high" class="answer-input" placeholder="0">
                    <label>mL</label>
                </div>
            </div>
            <div id="f3" class="feedback"></div>
        </div>
        
        <div class="question-card">
            <h3>Step 4: Clinical Decision Making</h3>
            <p class="question-text">
                For a patient with <strong>${currentScenario.condition}</strong>, 
                what would be your initial approach?
            </p>
            <select id="q4-decision" class="decision-select">
                <option value="">Select your approach...</option>
                <option value="start_low">Start at 6 mL/kg (lung protective)</option>
                <option value="start_mid">Start at 7 mL/kg (mid-range)</option>
                <option value="start_high">Start at 8 mL/kg (traditional)</option>
                <option value="custom">Custom approach (explain below)</option>
            </select>
            <textarea id="q4-explanation" class="explanation-input" 
                      placeholder="If selecting custom, explain your rationale..." 
                      style="display: none;"></textarea>
            <div id="f4" class="feedback"></div>
        </div>
    `;
    
    // Add event listener for decision dropdown
    document.getElementById('q4-decision').addEventListener('change', function() {
        const explanation = document.getElementById('q4-explanation');
        explanation.style.display = this.value === 'custom' ? 'block' : 'none';
    });
}

// Generate a new scenario
function generateNewScenario() {
    currentScenario = generateRandomPatient();
    currentScenario.correctAnswers = calculateCorrectAnswers(currentScenario);
    
    displayScenario();
    generateQuestions();
    updateDebugInfo();
    
    // Add to history
    addHistoryItem('generated', `New scenario: ${currentScenario.gender}, ${currentScenario.height}in, ${currentScenario.weight}lbs`);
}

// Check all answers
function checkAllAnswers() {
    if (!currentScenario || !currentScenario.correctAnswers) {
        alert('Please generate a scenario first!');
        return;
    }
    
    const answers = currentScenario.correctAnswers;
    let correctCount = 0;
    let totalCount = 4;
    
    // Check weight conversion
    const weightInput = document.getElementById('q1-weight');
    const userWeight = parseFloat(weightInput.value);
    const weightCorrect = !isNaN(userWeight) && Math.abs(userWeight - answers.weightKg) <= 0.5;
    
    if (weightCorrect) {
        correctCount++;
        weightInput.classList.add('correct');
        weightInput.classList.remove('incorrect');
        showFeedback('f1', `✓ Correct! ${currentScenario.weight} ÷ 2.2 = ${answers.weightKg} kg`, true);
    } else {
        weightInput.classList.add('incorrect');
        weightInput.classList.remove('correct');
        showFeedback('f1', `✗ Try again. Correct answer: ${answers.weightKg} kg`, false);
    }
    
    // Check IBW
    const ibwInput = document.getElementById('q2-ibw');
    const userIBW = parseFloat(ibwInput.value);
    const ibwCorrect = !isNaN(userIBW) && Math.abs(userIBW - answers.ibw) <= 0.5;
    
    if (ibwCorrect) {
        correctCount++;
        ibwInput.classList.add('correct');
        ibwInput.classList.remove('incorrect');
        showFeedback('f2', `✓ Correct! IBW = ${answers.ibw} kg`, true);
    } else {
        ibwInput.classList.add('incorrect');
        ibwInput.classList.remove('correct');
        showFeedback('f2', `✗ Try again. Correct answer: ${answers.ibw} kg`, false);
    }
    
    // Check tidal volume range
    const vtLowInput = document.getElementById('q3-vt-low');
    const vtHighInput = document.getElementById('q3-vt-high');
    const userVtLow = parseInt(vtLowInput.value);
    const userVtHigh = parseInt(vtHighInput.value);
    
    const vtLowCorrect = userVtLow === answers.vtLow;
    const vtHighCorrect = userVtHigh === answers.vtHigh;
    const vtCorrect = vtLowCorrect && vtHighCorrect;
    
    if (vtCorrect) {
        correctCount++;
        vtLowInput.classList.add('correct');
        vtHighInput.classList.add('correct');
        vtLowInput.classList.remove('incorrect');
        vtHighInput.classList.remove('incorrect');
        showFeedback('f3', `✓ Correct! Range: ${answers.vtLow}–${answers.vtHigh} mL`, true);
    } else {
        vtLowInput.classList.add('incorrect');
        vtHighInput.classList.add('incorrect');
        showFeedback('f3', `✗ Try again. Correct range: ${answers.vtLow}–${answers.vtHigh} mL`, false);
    }
    
    // Check clinical decision (always correct for educational purposes)
    const decisionInput = document.getElementById('q4-decision');
    if (decisionInput.value) {
        correctCount++;
        showFeedback('f4', '✓ Good clinical reasoning! Consider patient-specific factors.', true);
    } else {
        showFeedback('f4', 'Please select a clinical approach.', false);
    }
    
    // Update stats
    sessionStats.totalAttempts += totalCount;
    sessionStats.correctAnswers += correctCount;
    sessionStats.scenariosCompleted++;
    
    updateStatsDisplay();
    saveSession();
    
    // Add to history
    addHistoryItem('completed', `Scored ${correctCount}/${totalCount} (${Math.round(correctCount/totalCount*100)}%)`);
}

// Show all solutions
function showAllSolutions() {
    if (!currentScenario || !currentScenario.correctAnswers) {
        alert('Please generate a scenario first!');
        return;
    }
    
    const answers = currentScenario.correctAnswers;
    
    // Fill in all answers
    document.getElementById('q1-weight').value = answers.weightKg;
    document.getElementById('q2-ibw').value = answers.ibw;
    document.getElementById('q3-vt-low').value = answers.vtLow;
    document.getElementById('q3-vt-high').value = answers.vtHigh;
    document.getElementById('q4-decision').value = 'start_low';
    
    // Mark all as correct
    document.querySelectorAll('.answer-input').forEach(input => {
        input.classList.add('correct');
        input.classList.remove('incorrect');
    });
    
    // Show all feedback
    showFeedback('f1', `Solution: ${currentScenario.weight} ÷ 2.2 = ${answers.weightKg} kg`, true);
    showFeedback('f2', `Solution: IBW = ${answers.ibw} kg`, true);
    showFeedback('f3', `Solution: Tidal Volume Range = ${answers.vtLow}–${answers.vtHigh} mL`, true);
    showFeedback('f4', 'Clinical note: Start at lower end (6 mL/kg) for lung protection per NBRC guidelines', true);
}

// Helper function to show feedback
function showFeedback(elementId, message, isCorrect) {
    const element = document.getElementById(elementId);
    element.innerHTML = `
        <div class="feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}">
            ${message}
        </div>
    `;
    element.style.display = 'block';
}

// Update stats display
function updateStatsDisplay() {
    const scoreElem = document.getElementById('score');
    const accuracyElem = document.getElementById('accuracy');
    const completedElem = document.getElementById('completed');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    scoreElem.textContent = sessionStats.correctAnswers;
    
    const accuracy = sessionStats.totalAttempts > 0 
        ? Math.round((sessionStats.correctAnswers / sessionStats.totalAttempts) * 100)
        : 0;
    accuracyElem.textContent = `${accuracy}%`;
    
    completedElem.textContent = sessionStats.scenariosCompleted;
    
    // Progress bar (max 100 scenarios)
    const progress = Math.min(sessionStats.scenariosCompleted * 1, 100);
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${progress}% complete`;
}

// Add item to history
function addHistoryItem(type, message) {
    const item = {
        timestamp: new Date().toLocaleTimeString(),
        type: type,
        message: message
    };
    
    sessionStats.history.unshift(item);
    if (sessionStats.history.length > 20) {
        sessionStats.history = sessionStats.history.slice(0, 20);
    }
    
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    const container = document.getElementById('history-list');
    if (!container) return;
    
    container.innerHTML = sessionStats.history.map(item => `
        <div class="history-item ${item.type}">
            <span class="history-time">${item.timestamp}</span>
            <span class="history-message">${item.message}</span>
        </div>
    `).join('');
}

// Reset progress
function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        sessionStats = {
            totalAttempts: 0,
            correctAnswers: 0,
            scenariosCompleted: 0,
            history: []
        };
        localStorage.removeItem('ventilation_sim_session');
        updateStatsDisplay();
        updateHistoryDisplay();
        addHistoryItem('system', 'Progress reset');
    }
}

// Debug functions
function toggleDebug() {
    const panel = document.getElementById('debug-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function updateDebugInfo() {
    const output = document.getElementById('debug-output');
    if (currentScenario) {
        output.textContent = JSON.stringify({
            scenario: currentScenario,
            correctAnswers: currentScenario.correctAnswers,
            sessionStats: sessionStats
        }, null, 2);
    }
}

function clearStorage() {
    localStorage.clear();
    alert('Local storage cleared!');
    location.reload();
}

function exportData() {
    const data = JSON.stringify(sessionStats, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventilation-sim-data-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function importData() {
    // Implementation for import
    alert('Import feature coming soon!');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadSession();
    generateNewScenario();
    updateHistoryDisplay();
});
</script>

<style>
/* Simulation-specific styles */
.simulation-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
}

.simulation-header {
    text-align: center;
    margin-bottom: 2rem;
}

.simulation-header h1 {
    color: #2c3e50;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.subtitle {
    color: #7f8c8d;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
}

.back-link {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
}

.stats-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 10px;
    margin: 2rem 0;
}

.stat {
    text-align: center;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-label {
    display: block;
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.stat-value {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: #4361ee;
}

.btn-reset {
    background: #dc3545;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.3s;
}

.btn-reset:hover {
    background: #c82333;
}

.progress-container {
    margin: 2rem 0;
}

.progress-bar {
    height: 10px;
    background: #e9ecef;
    border-radius: 5px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4361ee, #3a0ca3);
    transition: width 0.5s ease;
}

.progress-text {
    text-align: center;
    margin-top: 0.5rem;
    color: #6c757d;
    font-size: 0.9rem;
}

.patient-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 15px;
    margin: 2rem 0;
}

.patient-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
}

.detail {
    background: rgba(255,255,255,0.1);
    padding: 1rem;
    border-radius: 8px;
    backdrop-filter: blur(10px);
}

.highlight {
    font-weight: bold;
    font-size: 1.2rem;
    color: #ffd166;
}

.patient-instruction {
    margin-top: 1.5rem;
    font-style: italic;
    opacity: 0.9;
}

.reference-card {
    background: #e3f2fd;
    padding: 1.5rem;
    border-radius: 10px;
    margin: 2rem 0;
    border-left: 4px solid #2196f3;
}

.formula-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.formula-item {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
}

.formula-item code {
    display: block;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #f5f5f5;
    border-radius: 4px;
    font-family: monospace;
}

.question-card {
    background: white;
    padding: 1.5rem;
    margin: 1.5rem 0;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    border-left: 4px solid #4cc9f0;
}

.question-text {
    margin: 1rem 0;
    line-height: 1.6;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 1rem 0;
}

.answer-input {
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    width: 120px;
    transition: all 0.3s;
}

.answer-input.correct {
    border-color: #28a745;
    background: #d4edda;
}

.answer-input.incorrect {
    border-color: #dc3545;
    background: #f8d7da;
}

.range-inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
}

.range-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.decision-select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    margin: 1rem 0;
}

.explanation-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    margin: 1rem 0;
    min-height: 100px;
    resize: vertical;
}

.feedback {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 5px;
    display: none;
}

.feedback-correct {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.feedback-incorrect {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.controls-container {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin: 2rem 0;
    flex-wrap: wrap;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: bold;
}

.btn-primary {
    background: #4361ee;
    color: white;
}

.btn-success {
    background: #28a745;
    color: white;
}

.btn-info {
    background: #17a2b8;
    color: white;
}

.btn-warning {
    background: #ffc107;
    color: #212529;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.debug-panel {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 10px;
    margin: 2rem 0;
    border: 1px solid #dee2e6;
}

.debug-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.history-container {
    margin: 2rem 0;
}

.history-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
}

.history-item {
    padding: 0.75rem;
    margin: 0.5rem 0;
    border-radius: 5px;
    background: #f8f9fa;
}

.history-item.generated {
    border-left: 3px solid #4361ee;
}

.history-item.completed {
    border-left: 3px solid #28a745;
}

.history-item.system {
    border-left: 3px solid #6c757d;
}

.history-time {
    font-size: 0.85rem;
    color: #6c757d;
    margin-right: 1rem;
}

.history-message {
    font-weight: 500;
}

/* Responsive design */
@media (max-width: 768px) {
    .simulation-container {
        padding: 1rem;
    }
    
    .simulation-header h1 {
        font-size: 2rem;
    }
    
    .stats-panel {
        grid-template-columns: 1fr 1fr;
    }
    
    .controls-container {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
    }
}

/* Animation for new scenarios */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.question-card {
    animation: fadeIn 0.5s ease-out;
}
</style>
