---
layout: default
title: "Minute Ventilation Calculator"
---
<link rel="stylesheet" href="/info/_css/bigdata.css">

<div class="graph">
  {% include data-processor.html %}
  {% include 3d-visualizer.html %}

<script type="module">
  try {
    const container = document.getElementById('graph3d');
    container.classList.add('loading');
    
    console.log("Starting data load...");
    
    // 1. Check if DataVisualizer is available
    if (typeof DataVisualizer === 'undefined') {
      throw new Error('DataVisualizer class not loaded');
    }
    
    // 2. Fetch data
    const response = await fetch('/path/to/your/x_y_z_data.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csv = await response.text();
    console.log("CSV data loaded:", csv.substring(0, 100) + "..."); // Log first 100 chars
    
    // 3. Process data
    const data = processCSV(csv);
    if (!data || data.length === 0) {
      throw new Error('No data processed from CSV');
    }
    console.log(`Processed ${data.length} data points`);
    
    // 4. Create visualization
    new DataVisualizer('graph3d', data);
    container.classList.remove('loading');
    
  } catch (error) {
    console.error("Visualization error:", error);
    const container = document.getElementById('graph3d');
    container.classList.remove('loading');
    container.classList.add('error');
    container.setAttribute('data-error', `Error: ${error.message}`);
    
    // For more detailed debugging
    const debugInfo = document.createElement('div');
    debugInfo.style.color = 'black';
    debugInfo.style.padding = '10px';
    debugInfo.innerHTML = `
      <h3>Debug Information</h3>
      <p><strong>Error:</strong> ${error.message}</p>
      <p><strong>Stack:</strong> ${error.stack}</p>
      <p><strong>THREE available:</strong> ${typeof THREE}</p>
      <p><strong>DataVisualizer available:</strong> ${typeof DataVisualizer}</p>
    `;
    container.appendChild(debugInfo);
  }
</script>
