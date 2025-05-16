---
layout: default
title: "Minute Ventilation Calculator"
---
<link rel="stylesheet" href="/info/_css/bigdata.css">

<div class="graph">
  {% include data-processor.html %}
  {% include 3d-visualizer.html %}

  <script type="module">
    // Ensure DataVisualizer is available
    await new Promise(resolve => {
      const check = () => {
        if (window.DataVisualizer) resolve();
        else setTimeout(check, 50);
      };
      check();
    });

    // Now fetch and process data
    fetch('/path/to/your/x_y_z_data.csv')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
      })
      .then(csv => {
        const data = processCSV(csv);
        new DataVisualizer('graph3d', data);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        document.querySelector('.graph-3d').textContent = 
          'Error loading visualization: ' + error.message;
      });
  </script>
