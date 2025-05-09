---
title: "Minute Ventilation Grid"
layout: default
---
<style>/* Add to your CSS file */
/* Add to your CSS */
.grid-container {
  perspective: 1200px;
  margin: 4rem 0;
}

.grid {
  display: grid;
  gap: 1px;
  transform-style: preserve-3d;
  position: relative;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Dynamic 3D transformation */
  transform: 
    rotateX(calc((var(--y, 0) * 1deg)) 
    rotateY(calc((var(--x, 0) * 1deg))) 
    translateZ(calc(var(--z, 0) * 20px));
}

.grid-cell {
  background: rgba(67, 97, 238, 0.15);
  transform: 
    translateX(calc(var(--cell-x, 0) * var(--spacing, 40px))) 
    translateY(calc(var(--cell-y, 0) * var(--spacing, 40px))) 
    translateZ(calc(var(--cell-z, 0) * 20px));
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animated demo variables */
@property --x {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

@property --y {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

@property --z {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

@keyframes grid-movement {
  0% { --x: 0; --y: 0; --z: 0; }
  25% { --x: 10; --y: 5; --z: 4; }
  50% { --x: -5; --y: 8; --z: 8; }
  75% { --x: 7; --y: -3; --z: 12; }
  100% { --x: 0; --y: 0; --z: 0; }
}

.grid {
  animation: grid-movement 12s infinite linear;
}

/* Hover interaction */
.grid:hover {
  --spacing: 60px;
  animation-play-state: paused;
}

.grid:hover .grid-cell {
  background: rgba(67, 97, 238, 0.25);
  transform: 
    translateX(calc(var(--cell-x) * var(--spacing))) 
    translateY(calc(var(--cell-y) * var(--spacing))) 
    translateZ(calc(var(--cell-z) * 40px));
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

<div class="grid-container">
  <div class="grid">
    {% comment %} Generate 5x5x5 grid cells {% endcomment %}
    {% for x in (0..4) %}
      {% for y in (0..4) %}
        {% for z in (0..4) %}
          <div class="grid-cell" 
               style="--cell-x: {{x}}; --cell-y: {{y}}; --cell-z: {{z}};">
            {{x}},{{y}},{{z}}
          </div>
        {% endfor %}
      {% endfor %}
    {% endfor %}
  </div>
</div>
