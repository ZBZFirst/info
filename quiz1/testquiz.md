---
layout: quizlayout
title: Minute Ventilation Quiz
---

<div id="math-quiz" class="math-quiz-container">
    <div class="section-title">
        <h1>Minute Ventilation Worksheet</h1>
        <button id="cert-manager-btn" class="section-status cert-manager-btn cert-manager-btn-primary" disabled>
            <i class="fas fa-certificate"></i> Certificate Manager
        </button>
    </div>
    <h2>Complete all sections to unlock the Certificate Manager.</h2>
    <h3>When solving for Minute Ventilation, round to 1 decimal point</h3>
    <h3>When solving for Tidal Volume, round to 2 decimal point</h3>
    <h3>When solving for Respiratory Rate, use whole numbers</h3>
    <div class="question-section">
        <!-- Solve for Z Card -->
        <div class="question-card" id="z-card">
            <h2>Solve for Minute Ventilation (MV)</h2>
            <div class="question" id="z-question"></div>
            <div class="input-group">
                <input type="number" step="0.001" id="z-answer" placeholder="Enter Z">
                <button id="z-submit">Submit</button>
            </div>
            <div class="feedback" id="z-feedback"></div>
            <div class="progress-container">
                <div class="progress-label">
                    <span>Progress</span>
                    <span id="z-score">0/10</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" id="z-progress"></div>
                </div>
            </div>
        </div>
        <!-- Solve for X Card -->
        <div class="question-card" id="x-card">
            <h2>Solve for Tidal Volume (Vt)</h2>
            <div class="question" id="x-question"></div>
            <div class="input-group">
                <input type="number" step="0.001" id="x-answer" placeholder="Enter X">
                <button id="x-submit">Submit</button>
            </div>
            <div class="feedback" id="x-feedback"></div>
            <div class="progress-container">
                <div class="progress-label">
                    <span>Progress</span>
                    <span id="x-score">0/10</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" id="x-progress"></div>
                </div>
            </div>
        </div>
        <!-- Solve for Y Card -->
        <div class="question-card" id="y-card">
            <h2>Solve for Respiratory Rate (RR)</h2>
            <div class="question" id="y-question"></div>
            <div class="input-group">
                <input type="number" step="0.001" id="y-answer" placeholder="Enter Y">
                <button id="y-submit">Submit</button>
            </div>
            <div class="feedback" id="y-feedback"></div>
            <div class="progress-container">
                <div class="progress-label">
                    <span>Progress</span>
                    <span id="y-score">0/10</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" id="y-progress"></div>
                </div>
            </div>
        </div>
        <!-- Recall Card -->
        <div class="question-card recall-card" id="recall-card">
            <h1>Recall Questions on Minute Ventilation</h1>
            <div class="question" id="recall-question"></div>
            <div id="recall-options"></div>
            <div class="feedback" id="recall-feedback"></div>
            <button id="recall-submit">Submit Answer</button>
            <button id="next-recall" class="hidden">Next Question</button>
            <div class="progress-container">
                <div class="progress-label">
                    <span>Progress</span>
                    <span id="recall-score">0/5</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" id="recall-progress"></div>
                </div>
            </div>
        </div>
    </div>
    <div id="math-complete" class="completion-message hidden">
        All application and recall questions completed!
    </div>
</div>
<script type="module" src="certificate-manager.js"></script>
<script src="quiz.js"></script>
