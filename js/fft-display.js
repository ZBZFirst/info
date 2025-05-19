//fft-display.js file start


let animationId;
let ctx;

export function init(visualizer) {
  // Private functions
  function drawBars(dataArray, bufferLength, canvas) {
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, `hsl(${200 + (i/bufferLength)*160}, 100%, 50%)`);
      gradient.addColorStop(1, `hsl(${200 + (i/bufferLength)*160}, 100%, 20%)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  }

  function drawWaveform(dataArray, bufferLength) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsl(200, 100%, 50%)`;
    ctx.beginPath();
    
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * canvas.height / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  // ... other drawing functions (circle, particles)

  function visualize(fftCalc, visualizer) {
    function draw() {
      animationId = requestAnimationFrame(draw);
      
      const data = fftCalc.getProcessedData();
      if (!data) return;
      
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      switch(visualizer.settings.visualMode) {
        case 'bars':
          drawBars(data.frequencyData, data.bufferLength);
          break;
        case 'wave':
          drawWaveform(data.timeData, data.bufferLength);
          break;
        // ... other modes
      }
    }
    
    draw();
  }

  // Public API
  return {
    start(fftCalc, visualizer) {
      ctx = visualizer.canvas.getContext('2d');
      visualize(fftCalc, visualizer);
    },
    
    stop() {
      cancelAnimationFrame(animationId);
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };
}

//fft-display.js file end
