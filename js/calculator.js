document.addEventListener('DOMContentLoaded', function() {
  // Get all input elements
  const heightSlider = document.getElementById('height');
  const heightValue = document.getElementById('height-value');
  const weightSlider = document.getElementById('weight');
  const weightValue = document.getElementById('weight-value');
  const genderRadios = document.querySelectorAll('input[name="gender"]');

  // Initialize display
  updateDisplayValues();
  updateCalculations();

  // Event listeners for real-time updates
  heightSlider.addEventListener('input', function() {
    heightValue.textContent = this.value;
    updateCalculations();
  });

  weightSlider.addEventListener('input', function() {
    weightValue.textContent = this.value;
    updateCalculations();
  });

  genderRadios.forEach(radio => {
    radio.addEventListener('change', updateCalculations);
  });

  function updateDisplayValues() {
    heightValue.textContent = heightSlider.value;
    weightValue.textContent = weightSlider.value;
  }

  function updateCalculations() {
    // Get current values
    const height = parseFloat(heightSlider.value);
    const weight = parseFloat(weightSlider.value);
    const gender = document.querySelector('input[name="gender"]:checked').value;

    // Calculate weight conversion
    const weightKg = (weight / 2.2).toFixed(1);
    document.getElementById('weight-conversion-steps').innerHTML = 
      `${weight} / 2.2 = <strong>${weightKg} kg</strong>`;

    // Calculate IBW
    const ibwBase = gender === 'M' ? 50 : 45.5;
    const heightDiff = (height - 60).toFixed(1);
    const ibwStep1 = (2.3 * (height - 60)).toFixed(1);
    const ibw = (parseFloat(ibwBase) + parseFloat(ibwStep1)).toFixed(1);
    
    document.getElementById('ibw-formula').textContent = 
      `IBW = ${ibwBase} + (2.3 × (height - 60))`;
    document.getElementById('ibw-steps').innerHTML = `
      <p>Step 1, Subtract Height Difference: <strong>${height} - 60 = <i>${heightDiff}</i></strong></p>
      <p>Step 2, Multiply Difference by 2.3: <strong>2.3 × ${heightDiff} = <i>${ibwStep1}</i></strong></p>
      <p>Step 3, Add the reamining Values: <strong>${ibwBase} + ${ibwStep1} = <i>${ibw} kg</i></strong></p>
    `;

    // Calculate Tidal Volume
    const vtLow = (6 * ibw).toFixed(1);
    const vtHigh = (8 * ibw).toFixed(1);
    document.getElementById('tidal-volume-steps').innerHTML = `
      <p>Utilize 6 - 8 ml/kg per NBRC White Paper</p>
      <p>6 × ${ibw} = <strong>${vtLow} ml</strong></p>
      <p>8 × ${ibw} = <strong>${vtHigh} ml</strong></p>
    `;

    // Calculate Minute Ventilation
    const veMin = (vtLow * 12).toFixed(1);
    const veMax = (vtHigh * 20).toFixed(1);
    document.getElementById('ventilation-steps').innerHTML = `
      <p>Min VE: ${vtLow} × 12 = <strong>${veMin} ml/min</strong></p>
      <p>Max VE: ${vtHigh} × 20 = <strong>${veMax} ml/min</strong></p>
    `;
  }
});
