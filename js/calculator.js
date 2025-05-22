document.addEventListener('DOMContentLoaded', function() {
  const heightSlider = document.getElementById('height');
  const weightSlider = document.getElementById('weight');
  const genderRadios = document.querySelectorAll('input[name="gender"]');
  
  // Display initial values
  updateCalculations();
  
  // Add event listeners
  heightSlider.addEventListener('input', updateCalculations);
  weightSlider.addEventListener('input', updateCalculations);
  genderRadios.forEach(radio => radio.addEventListener('change', updateCalculations));
  
  function updateCalculations() {
    // Get current values
    const height = parseFloat(heightSlider.value);
    const weight = parseFloat(weightSlider.value);
    const gender = document.querySelector('input[name="gender"]:checked').value;
    
    // Update displayed values
    document.getElementById('height-value').textContent = height;
    document.getElementById('weight-value').textContent = weight;
    
    // Perform calculations
    const weightKg = (weight / 2.2).toFixed(1);
    const heightDiff = (height - 60).toFixed(1);
    const ibwStep1 = (2.3 * heightDiff).toFixed(1);
    const ibwBase = gender === 'M' ? 50 : 45.5;
    const ibw = (parseFloat(ibwBase) + parseFloat(ibwStep1)).toFixed(1);
    const vtLow = (6 * ibw).toFixed(1);
    const vtHigh = (8 * ibw).toFixed(1);
    const veMin = (vtLow * 12).toFixed(1);
    const veMax = (vtHigh * 20).toFixed(1);
    
    // Update weight conversion
    document.getElementById('weight-conversion-steps').innerHTML = 
      `${weight} / 2.2 = <strong>${weightKg} kg</strong>`;
    
    // Update IBW calculation
    document.getElementById('ibw-formula').textContent = 
      `IBW = ${ibwBase} + (2.3 × (height - 60))`;
    document.getElementById('ibw-steps').innerHTML = `
      <p>Step 1: ${height} - 60 = ${heightDiff}</p>
      <p>Step 2: 2.3 × ${heightDiff} = ${ibwStep1}</p>
      <p>Step 3: ${ibwBase} + ${ibwStep1} = <strong>${ibw} kg</strong></p>
    `;
    
    // Update tidal volume
    document.getElementById('tidal-volume-steps').innerHTML = `
      <p>6 × ${ibw} = <strong>${vtLow} ml</strong></p>
      <p>8 × ${ibw} = <strong>${vtHigh} ml</strong></p>
    `;
    
    // Update ventilation
    document.getElementById('ventilation-steps').innerHTML = `
      <p>Min VE: ${vtLow} × 12 = <strong>${veMin} ml/min</strong></p>
      <p>Max VE: ${vtHigh} × 20 = <strong>${veMax} ml/min</strong></p>
    `;
  }
});
