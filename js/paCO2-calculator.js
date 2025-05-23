document.addEventListener('DOMContentLoaded', function() {
  // Get all input elements
  const currentPaCO2Input = document.getElementById('current-paco2');
  const desiredPaCO2Input = document.getElementById('desired-paco2');
  const currentRRInput = document.getElementById('current-rr');
  const currentVTInput = document.getElementById('current-vt');
  
  // Get all value display elements
  const currentPaCO2Value = document.getElementById('current-paco2-value');
  const desiredPaCO2Value = document.getElementById('desired-paco2-value');
  const currentRRValue = document.getElementById('current-rr-value');
  const currentVTValue = document.getElementById('current-vt-value');
  
  // Add event listeners to all inputs
  [currentPaCO2Input, desiredPaCO2Input, currentRRInput, currentVTInput].forEach(input => {
    input.addEventListener('input', updateCalculations);
  });
  
  // Update displayed values when sliders change
  currentPaCO2Input.addEventListener('input', () => {
    currentPaCO2Value.textContent = currentPaCO2Input.value;
  });
  
  desiredPaCO2Input.addEventListener('input', () => {
    desiredPaCO2Value.textContent = desiredPaCO2Input.value;
  });
  
  currentRRInput.addEventListener('input', () => {
    currentRRValue.textContent = currentRRInput.value;
  });
  
  currentVTInput.addEventListener('input', () => {
    currentVTValue.textContent = currentVTInput.value;
  });
  
  // Main calculation function
  function updateCalculations() {
    // Get current values
    const currentPaCO2 = parseFloat(currentPaCO2Input.value);
    const desiredPaCO2 = parseFloat(desiredPaCO2Input.value);
    const currentRR = parseFloat(currentRRInput.value);
    const currentVT = parseFloat(currentVTInput.value);
    
    // Calculate current minute ventilation
    const currentVE = currentVT * currentRR;
    document.getElementById('current-ve-steps').innerHTML = `
      <p>Current VE = ${currentVT} ml × ${currentRR} breaths/min</p>
      <p><strong>Current VE = ${currentVE.toFixed(1)} ml/min (${(currentVE/1000).toFixed(2)} L/min)</strong></p>
    `;
    
    // Calculate new required minute ventilation
    const newVE = (currentPaCO2 * currentVE) / desiredPaCO2;
    document.getElementById('new-ve-steps').innerHTML = `
      <p>New VE = (${currentPaCO2} × ${currentVE.toFixed(1)}) / ${desiredPaCO2}</p>
      <p><strong>New VE = ${newVE.toFixed(1)} ml/min (${(newVE/1000).toFixed(2)} L/min)</strong></p>
    `;
    
    // Calculate option 1: adjust RR only
    const newRR = newVE / currentVT;
    document.getElementById('new-rr-steps').innerHTML = `
      <p>New RR = ${newVE.toFixed(1)} / ${currentVT}</p>
      <p><strong>New RR = ${newRR.toFixed(1)} breaths/min</strong></p>
    `;
    
    // Calculate option 1: adjust RR only (keep VT constant)
    // New RR = (Current PaCO2 × Current RR) / Desired PaCO2
    const newRR = (currentPaCO2 * currentRR) / desiredPaCO2;
    document.getElementById('new-rr-steps').innerHTML = `
      <p>New RR = (${currentPaCO2} × ${currentRR}) / ${desiredPaCO2}</p>
      <p><strong>New RR = ${newRR.toFixed(1)} breaths/min</strong></p>
      <p>New VE with this RR = ${currentVT} ml × ${newRR.toFixed(1)} = ${(currentVT * newRR).toFixed(1)} ml/min</p>
    `;
    
    // Calculate option 2: adjust VT only (keep RR constant)
    // New VT = (Current PaCO2 × Current VT) / Desired PaCO2
    const newVT = (currentPaCO2 * currentVT) / desiredPaCO2;
    document.getElementById('new-vt-steps').innerHTML = `
      <p>New VT = (${currentPaCO2} × ${currentVT}) / ${desiredPaCO2}</p>
      <p><strong>New VT = ${newVT.toFixed(1)} ml</strong></p>
      <p>New VE with this VT = ${newVT.toFixed(1)} ml × ${currentRR} = ${(newVT * currentRR).toFixed(1)} ml/min</p>
    `;
    
    document.getElementById('proportional-adjustment-steps').innerHTML = `
      <p>Square root of adjustment factor = ${sqrtAdjustment.toFixed(3)}</p>
      <p>New RR = ${currentRR} × ${sqrtAdjustment.toFixed(3)} = <strong>${propNewRR.toFixed(1)} breaths/min</strong></p>
      <p>New VT = ${currentVT} × ${sqrtAdjustment.toFixed(3)} = <strong>${propNewVT.toFixed(1)} ml</strong></p>
    `;
  }
  
  // Initialize calculations
  updateCalculations();
});
