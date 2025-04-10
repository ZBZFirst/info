---
layout: quizlayout
title: Minute Ventilation Quiz
---

<div id="math-quiz" class="math-quiz-container">
    <div class="section-title">
        <h1>Minute Ventilation Worksheet</h1>
        <button id="cert-manager-btn" class="section-status">
            <i class="fas fa-certificate"></i> Certificate Manager
        </button>
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
    
    <div id="completion-overlay" class="completion-overlay hidden">
        <div class="completion-content certificate-card">
            <button id="close-overlay" class="close-btn" aria-label="Close">×</button>
            <h2><i class="fas fa-check-circle success-icon"></i> Worksheet Complete! 🎉</h2>
            
            <!-- Certificate controls section -->
            <div id="certificate-controls" class="certificate-controls">
                <h3>Generate Verified Certificate</h3>
                <div class="input-group">
                    <label for="github-token">GitHub Token:</label>
                    <input type="password" id="github-token" placeholder="Enter LockBox repo token">
                </div>
                <div class="input-group">
                    <label for="public-key">Your Public Key:</label>
                    <input type="text" id="public-key" placeholder="From your testauth.csv">
                </div>
                <button id="load-cert-data" class="btn-primary">
                    <i class="fas fa-unlock"></i> Authenticate
                </button>
                <div id="cert-status" class="cert-status"></div>
            </div>
            
            <div id="certificate-display" class="certificate-details">
                <!-- Default completion message -->
                <p>Congratulations on completing the worksheet!</p>
            </div>
            
            <div class="completion-actions">
                <button id="download-cert" class="btn-primary" disabled>
                    <i class="fas fa-download"></i> Download Certificate
                </button>
                <button id="restart-quiz" class="btn-secondary">
                    <i class="fas fa-redo"></i> Restart Worksheet
                </button>
            </div>
        </div>
    </div>

    <div id="certificate-manager-overlay" class="certificate-manager-overlay hidden">
      <div class="certificate-manager-content">
        <button class="certificate-manager-close">&times;</button>
        <h2><i class="fas fa-certificate"></i> Certificate Manager</h2>
        
        <div class="auth-form">
          <div class="input-group">
            <label for="cm-public-key">Public Key</label>
            <input type="text" id="cm-public-key" placeholder="From testauth.csv">
          </div>
          <div class="input-group">
            <label for="cm-github-token">Access Token</label>
            <input type="password" id="cm-github-token" placeholder="GRUMPYHORSE404">
          </div>
          <button id="cm-load-cert-data">Verify Credentials</button>
          <div id="cm-cert-status" class="cert-manager-status"></div>
        </div>
        
        <div id="cm-certificate-display" class="cert-manager-preview">
          <!-- Certificate will appear here after verification -->
        </div>
        
        <div class="cert-manager-actions">
          <button id="cm-generate-cert" class="btn-primary" disabled>
            <i class="fas fa-file-certificate"></i> Generate Certificate
          </button>
          <button id="cm-download-cert" class="btn-secondary" disabled>
            <i class="fas fa-download"></i> Download PDF
          </button>
        </div>
      </div>
    </div>
    
</div>

<script type="module" src="certificate-manager.js"></script>
<script src="quiz.js"></script>
