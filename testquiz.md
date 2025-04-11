---
layout: quizlayout
title: Minute Ventilation Quiz
---

<div id="math-quiz" class="math-quiz-container">
    <div class="section-title">
        <h1>Minute Ventilation Worksheet</h1>
        <span id="math-status" class="section-status">In Progress</span>
    </div>
    <h2>Complete all sections to complete the worksheet to obtain a certificate of completion.</h2>
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
    <button id="final-submission" disabled>
    Submit All Answers
    </button>
    <!-- Add this just before </div> closing the math-quiz container -->
    <div id="completion-overlay" class="completion-overlay hidden">
        <div class="completion-content certificate-card">
            <button id="close-overlay" class="close-btn" aria-label="Close">×</button>
            <h2><i class="fas fa-check-circle success-icon"></i> Worksheet Complete! 🎉</h2>
            <div id="certificate-display" class="certificate-details">
                <!-- This will be populated by JavaScript -->
            </div>
            <div class="completion-actions">
                <button id="download-cert" class="btn-primary">
                    <i class="fas fa-download"></i> Download Certificate
                </button>
                <button id="restart-quiz" class="btn-secondary">
                    <i class="fas fa-redo"></i> Restart Worksheet
                </button>
            </div>
        </div>
    </div>
</div>

<script src="certificate-manager.js"></script>
<script src="quiz.js"></script>

