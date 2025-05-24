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
  
  // Function to render MathJax and update the page
  function renderMathJax() {
    if (typeof MathJax !== 'undefined') {
      MathJax.typesetPromise();
    }
  }
  
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
      <p>\\( VE_{current} = VT_{current} \\times RR_{current} \\)</p>
      <p>\\( VE_{current} = ${currentVT} \\text{ ml} \\times ${currentRR} \\text{ breaths/min} \\)</p>
      <p><strong>\\( VE_{current} = ${currentVE.toFixed(1)} \\text{ ml/min} \\ (${(currentVE/1000).toFixed(2)} \\text{ L/min}) \\)</strong></p>
    `;
    
    // Calculate new required minute ventilation
    const newVE = (currentPaCO2 * currentVE) / desiredPaCO2;
    document.getElementById('new-ve-steps').innerHTML = `
      <p>\\( VE_{new} = \\frac{PaCO_{2\\ current} \\times VE_{current}}{PaCO_{2\\ desired}} \\)</p>
      <p>\\( VE_{new} = \\frac{${currentPaCO2} \\times ${currentVE.toFixed(1)}}{${desiredPaCO2}} \\)</p>
      <p><strong>\\( VE_{new} = ${newVE.toFixed(1)} \\text{ ml/min} \\ (${(newVE/1000).toFixed(2)} \\text{ L/min}) \\)</strong></p>
    `;
    
    // Calculate option 1: adjust RR only (keep VT constant)
    const newRR = (currentPaCO2 * currentRR) / desiredPaCO2;
    document.getElementById('new-rr-steps').innerHTML = `
      <p>\\( RR_{new} = \\frac{PaCO_{2\\ current} \\times RR_{current}}{PaCO_{2\\ desired}} \\)</p>
      <p>\\( RR_{new} = \\frac{${currentPaCO2} \\times ${currentRR}}{${desiredPaCO2}} \\)</p>
      <p><strong>\\( RR_{new} = ${newRR.toFixed(1)} \\text{ breaths/min} \\)</strong></p>
      <p>\\( VE_{new\\ with\\ RR} = VT_{current} \\times RR_{new} = ${currentVT} \\times ${newRR.toFixed(1)} = ${(currentVT * newRR).toFixed(1)} \\text{ ml/min} \\)</p>
    `;
    
    // Calculate option 2: adjust VT only (keep RR constant)
    const newVT = (currentPaCO2 * currentVT) / desiredPaCO2;
    document.getElementById('new-vt-steps').innerHTML = `
      <p>\\( VT_{new} = \\frac{PaCO_{2\\ current} \\times VT_{current}}{PaCO_{2\\ desired}} \\)</p>
      <p>\\( VT_{new} = \\frac{${currentPaCO2} \\times ${currentVT}}{${desiredPaCO2}} \\)</p>
      <p><strong>\\( VT_{new} = ${newVT.toFixed(1)} \\text{ ml} \\)</strong></p>
      <p>\\( VE_{new\\ with\\ VT} = VT_{new} \\times RR_{current} = ${newVT.toFixed(1)} \\times ${currentRR} = ${(newVT * currentRR).toFixed(1)} \\text{ ml/min} \\)</p>
    `;
    
    // Calculate option 3: proportional adjustment
    const adjustmentFactor = newVE / currentVE;
    const sqrtAdjustment = Math.sqrt(adjustmentFactor);
    const propNewRR = currentRR * sqrtAdjustment;
    const propNewVT = currentVT * sqrtAdjustment;
    
    document.getElementById('adjustment-factor-steps').innerHTML = `
      <p>\\( \\text{Adjustment Factor} = \\frac{VE_{new}}{VE_{current}} \\)</p>
      <p>\\( \\text{Adjustment Factor} = \\frac{${newVE.toFixed(1)}}{${currentVE.toFixed(1)}} \\)</p>
      <p><strong>\\( \\text{Adjustment Factor} = ${adjustmentFactor.toFixed(3)} \\)</strong></p>
    `;
    
    document.getElementById('proportional-adjustment-steps').innerHTML = `
      <p>\\( \\sqrt{\\text{Adjustment Factor}} = \\sqrt{${adjustmentFactor.toFixed(3)}} = ${sqrtAdjustment.toFixed(3)} \\)</p>
      <p>\\( RR_{new} = RR_{current} \\times \\sqrt{\\text{Adjustment Factor}} \\)</p>
      <p>\\( RR_{new} = ${currentRR} \\times ${sqrtAdjustment.toFixed(3)} = \\mathbf{${propNewRR.toFixed(1)} \\text{ breaths/min}} \\)</p>
      <p>\\( VT_{new} = VT_{current} \\times \\sqrt{\\text{Adjustment Factor}} \\)</p>
      <p>\\( VT_{new} = ${currentVT} \\times ${sqrtAdjustment.toFixed(3)} = \\mathbf{${propNewVT.toFixed(1)} \\text{ ml}} \\)</p>
      <p>\\( VE_{new} = VT_{new} \\times RR_{new} = ${propNewVT.toFixed(1)} \\times ${propNewRR.toFixed(1)} = ${(propNewVT * propNewRR).toFixed(1)} \\text{ ml/min} \\)</p>
    `;
    
    // Render MathJax after updating the content
    renderMathJax();
  }
  
  // Initialize calculations
  updateCalculations();
});
