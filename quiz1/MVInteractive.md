---
title: "Minute Ventilation Grid"
layout: default
---
<style>/* Add to your CSS file */
:root {
  --time-modulo: 0; /* Will be animated */
}

.grid {
  display: grid;
  gap: 4px;
  margin: 2rem 0;
  
  /* Dynamic grid calculation */
  grid-template-rows: repeat(calc(1 + var(--time-modulo)), 40px);
  grid-auto-columns: 80px;
  grid-auto-flow: column;
  
  /* Animation for time modulation */
  animation: time-modulo 10s infinite linear;
}

.grid > * {
  background: rgba(67, 97, 238, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

@keyframes time-modulo {
  0% { --time-modulo: 0; }
  10% { --time-modulo: 1; }
  20% { --time-modulo: 2; }
  30% { --time-modulo: 3; }
  40% { --time-modulo: 4; }
  50% { --time-modulo: 5; }
  60% { --time-modulo: 6; }
  70% { --time-modulo: 7; }
  80% { --time-modulo: 8; }
  90% { --time-modulo: 9; }
  100% { --time-modulo: 0; }
}

/* Property registration for animation */
@property --time-modulo {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}</style>

<div class="grid">
  <!-- Generated cells using Jekyll -->
  {% for i in (1..10) %}
    <div>{{ i }}</div>
  {% endfor %}
</div>
