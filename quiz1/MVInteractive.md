---
layout: default
title: "Minute Ventilation Calculator"
---
<link rel="stylesheet" href="/info/_css/bigdata.css">

<div class="graph">
  {% include data-processor.html %}
  {% include 3d-visualizer.html %}

  <script type="module">
    // Fetch and process CSV data
    fetch('/path/to/your/x_y_z_data.csv')
      .then(response => response.text())
      .then(csv => {
        const data = processCSV(csv);
        new DataVisualizer('graph3d', data);
      })
      .catch(error => console.error('Error loading data:', error));
  </script>
</div>
