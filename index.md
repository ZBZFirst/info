---
layout: default
title: Ventilator Data Project
description: Open-source ventilator waveform analysis and visualization
---

<link rel="stylesheet" href="/info/_css/dashboard.css">

<div class="landing-grid-container">
  <header class="grid-header">
    <h1>Ventilator Data Visualization Project</h1>
    <p class="subtitle">Open-source solutions for ventilator waveform analysis</p>
  </header>

  <div class="grid-intro">
    <p>This project demonstrates methods for capturing, analyzing, and visualizing ventilator data using accessible hardware and software tools.</p>
  </div>

  <div class="grid-3x3">
    <!-- Grid Item 1 -->
    <a href="/info/quiz4/paco2-calculator.html" class="grid-item" data-grid-item="1">
      <div class="grid-icon">📊</div>
      <h3 class="grid-title">ABG Calculator</h3>
      <p class="grid-desc">Interactive visualization of the pH Equation being plotted</p>
      <span class="grid-url">/ABG-Calculator/</span>
    </a>

    <!-- Grid Item 2 -->
    <a href="/info/quiz1/MinuteVentilationExplained.html" class="grid-item" data-grid-item="2">
      <div class="grid-icon">⚙️</div>
      <h3 class="grid-title">Minute Ventilation Module</h3>
      <p class="grid-desc">What is the Minute Ventilation Equation?</p>
      <span class="grid-url">/Minute-Ventilation/</span>
    </a>

    <!-- Grid Item 3 -->
    <a href="/documentation/" class="grid-item" data-grid-item="3">
      <div class="grid-icon">📖</div>
      <h3 class="grid-title">Documentation</h3>
      <p class="grid-desc">Technical specifications and reference materials</p>
      <span class="grid-url">/documentation/</span>
    </a>

    <!-- Grid Item 4 -->
    <a href="/HyperCube/" class="grid-item" data-grid-item="4">
      <div class="grid-icon">📈</div>
      <h3 class="grid-title">The HyperCube Research Experiment</h3>
      <p class="grid-desc">Literature Reviews in 3D, Requires API Key</p>
      <span class="grid-url">/Download-PubMed/</span>
    </a>

    <!-- Grid Item 5 -->
    <a href="/info/quiz3/VTCalculator.html" class="grid-item" data-grid-item="5">
      <div class="grid-icon">💻</div>
      <h3 class="grid-title">Determining Initial Tidal Volume</h3>
      <p class="grid-desc">How to apply the 6-8 mL/kg Equation</p>
      <span class="grid-url">/VTbyKG/</span>
    </a>

    <!-- Grid Item 6 -->
    <a href="/info/quiz4/paco2-calculator.html" class="grid-item" data-grid-item="6">
      <div class="grid-icon">🌀</div>
      <h3 class="grid-title">Changing the Tidal Volume based on PaCO2</h3>
      <p class="grid-desc">Aww, babies first calculus...</p>
      <span class="grid-url">/Predicting-PaCO2/</span>
    </a>

    <!-- Grid Item 7 -->
    <a href="/case-studies/" class="grid-item" data-grid-item="7">
      <div class="grid-icon">🏥</div>
      <h3 class="grid-title">Case Studies</h3>
      <p class="grid-desc">Clinical examples and applications</p>
      <span class="grid-url">/case-studies/</span>
    </a>

    <!-- Grid Item 8 -->
    <a href="/about-project/" class="grid-item" data-grid-item="8">
      <div class="grid-icon">ℹ️</div>
      <h3 class="grid-title">About Project</h3>
      <p class="grid-desc">Background, goals, and contributors</p>
      <span class="grid-url">/about-project/</span>
    </a>

    <!-- Grid Item 9 -->
    <a href="/resources/" class="grid-item" data-grid-item="9">
      <div class="grid-icon">🔗</div>
      <h3 class="grid-title">Additional Resources</h3>
      <p class="grid-desc">Links, references, and further reading</p>
      <span class="grid-url">/resources/</span>
    </a>
  </div>

  <div class="grid-footer">
    <p><strong>Note:</strong> This is an educational project. Ventilator data collection should only be performed by qualified professionals.</p>
  </div>
</div>

<style>
/* ===== Grid Layout Structure ===== */
.landing-grid-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.grid-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(67, 97, 238, 0.1);
}

.grid-header h1 {
  font-size: 2.5rem;
  color: var(--color-primary-dark, #3a0ca3);
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, var(--color-primary, #4361ee), var(--color-accent, #7209b7));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--text-medium, #586069);
  font-weight: var(--font-weight-normal, 400);
}

.grid-intro {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
  padding: 1.5rem;
  background: rgba(248, 249, 255, 0.5);
  border-radius: var(--border-radius-lg, 0.75rem);
  border: 1px solid rgba(67, 97, 238, 0.1);
}

.grid-intro p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text, #2c3e50);
}

/* ===== 3x3 Grid ===== */
.grid-3x3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
  flex: 1;
}

.grid-item {
  background: var(--color-white, #ffffff);
  border-radius: var(--border-radius-lg, 0.75rem);
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  border: 2px solid rgba(67, 97, 238, 0.1);
  transition: all var(--transition-normal, 0.3s) cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.08));
  min-height: 220px;
}

/* Grid item hover effects */
.grid-item:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: var(--color-primary, #4361ee);
  box-shadow: var(--shadow-lg, 0 12px 24px rgba(0,0,0,0.15));
  z-index: 10;
}

.grid-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, 
    var(--color-primary, #4361ee), 
    var(--color-secondary, #3f37c9));
  opacity: 0;
  transition: opacity var(--transition-normal, 0.3s) ease;
}

.grid-item:hover::before {
  opacity: 1;
}

/* Grid content styling */
.grid-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  transition: transform var(--transition-normal, 0.3s) ease;
}

.grid-item:hover .grid-icon {
  transform: scale(1.2);
}

.grid-title {
  font-size: 1.25rem;
  color: var(--color-primary-dark, #3a0ca3);
  margin: 0 0 0.75rem 0;
  font-weight: var(--font-weight-bold, 600);
  transition: color var(--transition-fast, 0.15s) ease;
}

.grid-item:hover .grid-title {
  color: var(--color-accent, #7209b7);
}

.grid-desc {
  font-size: 0.95rem;
  color: var(--text-medium, #586069);
  line-height: 1.5;
  margin: 0 0 1rem 0;
  flex: 1;
}

.grid-url {
  font-size: 0.8rem;
  color: rgba(67, 97, 238, 0.6);
  font-family: var(--font-mono, 'SF Mono', monospace);
  padding: 0.25rem 0.5rem;
  background: rgba(67, 97, 238, 0.05);
  border-radius: var(--border-radius-sm, 0.25rem);
  transition: all var(--transition-fast, 0.15s) ease;
}

.grid-item:hover .grid-url {
  color: var(--color-primary, #4361ee);
  background: rgba(67, 97, 238, 0.1);
}

/* Grid item specific colors using data attributes */
.grid-item[data-grid-item="1"] { border-left-color: #4361ee; }
.grid-item[data-grid-item="2"] { border-left-color: #3f37c9; }
.grid-item[data-grid-item="3"] { border-left-color: #7209b7; }
.grid-item[data-grid-item="4"] { border-left-color: #f72585; }
.grid-item[data-grid-item="5"] { border-left-color: #4cc9f0; }
.grid-item[data-grid-item="6"] { border-left-color: #4895ef; }
.grid-item[data-grid-item="7"] { border-left-color: #560bad; }
.grid-item[data-grid-item="8"] { border-left-color: #3a0ca3; }
.grid-item[data-grid-item="9"] { border-left-color: #7209b7; }

.grid-item:hover[data-grid-item="1"] { border-color: #4361ee; }
.grid-item:hover[data-grid-item="2"] { border-color: #3f37c9; }
.grid-item:hover[data-grid-item="3"] { border-color: #7209b7; }
.grid-item:hover[data-grid-item="4"] { border-color: #f72585; }
.grid-item:hover[data-grid-item="5"] { border-color: #4cc9f0; }
.grid-item:hover[data-grid-item="6"] { border-color: #4895ef; }
.grid-item:hover[data-grid-item="7"] { border-color: #560bad; }
.grid-item:hover[data-grid-item="8"] { border-color: #3a0ca3; }
.grid-item:hover[data-grid-item="9"] { border-color: #7209b7; }

/* Grid footer */
.grid-footer {
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid rgba(67, 97, 238, 0.1);
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-light, #6a737d);
}

/* ===== Responsive Design ===== */
@media (max-width: 1024px) {
  .grid-3x3 {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  
  .grid-item {
    padding: 1.75rem;
  }
}

@media (max-width: 768px) {
  .landing-grid-container {
    padding: 1.5rem;
  }
  
  .grid-header h1 {
    font-size: 2rem;
  }
  
  .grid-3x3 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .grid-item {
    padding: 1.5rem;
    min-height: 200px;
  }
  
  .grid-icon {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .landing-grid-container {
    padding: 1rem;
  }
  
  .grid-header h1 {
    font-size: 1.75rem;
  }
  
  .subtitle {
    font-size: 1.1rem;
  }
  
  .grid-item {
    padding: 1.25rem;
    min-height: 180px;
  }
  
  .grid-title {
    font-size: 1.1rem;
  }
  
  .grid-desc {
    font-size: 0.9rem;
  }
}

/* ===== Animation Enhancements ===== */
@keyframes gridItemFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid-item {
  animation: gridItemFadeIn 0.4s ease-out;
  animation-fill-mode: both;
}

/* Stagger the animations */
.grid-item:nth-child(1) { animation-delay: 0.1s; }
.grid-item:nth-child(2) { animation-delay: 0.2s; }
.grid-item:nth-child(3) { animation-delay: 0.3s; }
.grid-item:nth-child(4) { animation-delay: 0.4s; }
.grid-item:nth-child(5) { animation-delay: 0.5s; }
.grid-item:nth-child(6) { animation-delay: 0.6s; }
.grid-item:nth-child(7) { animation-delay: 0.7s; }
.grid-item:nth-child(8) { animation-delay: 0.8s; }
.grid-item:nth-child(9) { animation-delay: 0.9s; }

/* Focus styles for accessibility */
.grid-item:focus {
  outline: 2px solid var(--color-primary, #4361ee);
  outline-offset: 2px;
}

.grid-item:focus:not(:focus-visible) {
  outline: none;
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .grid-item,
  .grid-item:hover,
  .grid-icon,
  .grid-item:hover .grid-icon {
    transition: none;
    animation: none;
  }
}
</style>
