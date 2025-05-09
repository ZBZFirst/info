{% raw %}
---
title: "Minute Ventilation Grid"
layout: default
---

<style>
  .grid {
    /* Create grid with 41 rows (RR=0-40) and 201 columns (VT=0-1 in 0.005 steps) */
    display: grid;
    grid-template-columns: repeat(201, 1fr);
    grid-template-rows: repeat(41, 20px);
    gap: 1px;
    margin: 2rem;
  }

  .cell {
    background: rgba(44, 62, 80, calc(var(--z) / 40)); /* Normalize VE (max=40) */
    font-size: 0; /* Hide text by default */
    transition: 0.2s;
  }

  .cell:hover {
    font-size: 6px; /* Show value on hover */
    z-index: 2;
    outline: 1px solid #e74c3c;
  }

  /* Generate axis labels */
  .row-label { grid-column: 1; text-align: right; padding-right: 10px; }
  .col-label { grid-row: 1; text-align: center; }
</style>

<div class="grid">
  <!-- Column Labels (VT 0-1) -->
  {% for vt_step in (0..200) %}
    <div class="col-label" style="grid-column: {{ vt_step | plus: 2 }};">
      {{ vt_step | times: 0.005 | round: 3 }}
    </div>
  {% endfor %}

  <!-- Row Labels + Data Cells (RR 0-40) -->
  {% for rr in (0..40) %}
    <div class="row-label" style="grid-row: {{ rr | plus: 2 }};">RR={{ rr }}</div>
    
    {% for vt_step in (0..200) %}
      {% assign vt = vt_step | times: 0.005 %}
      <div class="cell" 
          style="--z: {{ rr | times: vt }};
                grid-row: {{ rr | plus: 2 }};
                grid-column: {{ vt_step | plus: 2 }};"
          title="RR={{ rr }}, VT={{ vt }}, VE={{ rr | times: vt }}">
        {{ rr | times: vt | round: 3 }}
      </div>
    {% endfor %}
  {% endfor %}
</div>
{% endraw %}
